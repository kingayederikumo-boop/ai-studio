import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ProviderRouter } from '@/src/services/providerRouter';
import type { ProviderType } from '@/src/services/providerRouter';
import { MemoryService } from '@/src/services/memoryService';
import { validateApiKey } from '@/src/lib/auth';
import { validatePrompt, validateSessionId, sanitizeError } from '@/src/lib/validation';
import { checkRateLimit } from '@/src/lib/rateLimiter';
import { getCorsHeaders, validateRequestSize } from '@/src/lib/cors';

// Generate cryptographically secure session ID
function generateSessionId(): string {
  try {
    // Use the Web Crypto API if available (browser/Vercel)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // fallback
  }
  // Fallback for Node.js
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

// GET handler for health checks
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const activeSessions = MemoryService.getActiveSessions();
    return NextResponse.json(
      {
        ok: true,
        message: 'Chat API ready',
        activeSessions: activeSessions.length,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    // 0. Validate request size to prevent DoS
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(contentLength, 1048576)) { // 1MB limit
      return NextResponse.json(
        { ok: false, error: 'Request body too large' },
        { status: 413, headers: corsHeaders }
      );
    }

    // 1. Validate API key
    const { valid, userId } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Invalid or missing API key' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Check rate limit
    const clientIp = getClientIp(req);
    const rateLimitKey = `${clientIp}:${userId}`;
    const { success: rateLimitSuccess, remaining } = await checkRateLimit(rateLimitKey);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Maximum 10 requests per minute.' },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } }
      );
    }

    // 3. Parse and validate request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    const prompt: string = body?.prompt;
    const provider: ProviderType = body?.provider || 'openai';
    const sessionId: string = body?.sessionId || generateSessionId();

    // 4. Validate prompt
    const promptErrors = validatePrompt(prompt);
    if (promptErrors.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid prompt', errors: promptErrors },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Validate session ID
    const sessionErrors = validateSessionId(sessionId);
    if (sessionErrors.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid session ID', errors: sessionErrors },
        { status: 400, headers: corsHeaders }
      );
    }

    // 6. Validate provider
    if (provider !== 'openai' && provider !== 'nvidia') {
      return NextResponse.json(
        { ok: false, error: 'Invalid provider. Must be "openai" or "nvidia"' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 7. Use memory-based conversation
    const result = await ProviderRouter.generateTextWithMemory(prompt, provider, sessionId);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Provider error' },
        { status: 500, headers: corsHeaders }
      );
    }

    // 8. Get session memory status for response
    const memoryStatus = await MemoryService.getSessionStatus(sessionId);

    return NextResponse.json(
      {
        ok: true,
        text: result.text,
        provider: result.provider,
        sessionId,
        memoryStatus,
        rateLimitRemaining: remaining,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = sanitizeError(err);
    console.error('Chat API error:', { error: message, timestamp: new Date().toISOString() });
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
