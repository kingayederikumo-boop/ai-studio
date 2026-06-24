import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ProviderRouter } from '@/src/services/providerRouter';
import type { ProviderType } from '@/src/services/providerRouter';
import { MemoryService } from '@/src/services/memoryService';
import { validateApiKey } from '@/src/lib/auth';
import { validatePrompt, validateSessionId, sanitizeError } from '@/src/lib/validation';
import { checkRateLimit } from '@/src/lib/rateLimiter';
import { getCorsHeaders, validateRequestSize } from '@/src/lib/cors';

function generateSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    const activeSessions = MemoryService.getActiveSessions();
    return NextResponse.json({ ok: true, message: 'Chat API ready', activeSessions: activeSessions.length }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ ok: false, error: sanitizeError(err) }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(contentLength, 1048576)) {
      return NextResponse.json({ ok: false, error: 'Request body too large' }, { status: 413, headers: corsHeaders });
    }

    const { valid, userId } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: Invalid or missing API key' }, { status: 401, headers: corsHeaders });
    }

    const clientIp = getClientIp(req);
    const rateLimitKey = `${clientIp}:${userId}`;
    const { success: rateLimitSuccess, remaining } = await checkRateLimit(rateLimitKey);

    if (!rateLimitSuccess) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded. Maximum 10 requests per minute.' }, { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } });
    }

    const body = await req.json();
    const prompt: string = body?.prompt;
    const provider: ProviderType | string = body?.provider || 'openai';
    const sessionId: string = body?.sessionId || generateSessionId();

    const promptErrors = validatePrompt(prompt);
    if (promptErrors.length > 0) {
      return NextResponse.json({ ok: false, error: 'Invalid prompt', errors: promptErrors }, { status: 400, headers: corsHeaders });
    }

    const sessionErrors = validateSessionId(sessionId);
    if (sessionErrors.length > 0) {
      return NextResponse.json({ ok: false, error: 'Invalid session ID', errors: sessionErrors }, { status: 400, headers: corsHeaders });
    }

    if (provider === 'nvidia') {
      return NextResponse.json({ ok: false, error: 'NVIDIA provider temporarily disabled' }, { status: 503, headers: corsHeaders });
    }

    const result = await ProviderRouter.generateTextWithMemory(prompt, 'openai' as ProviderType, sessionId);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Provider error' }, { status: 500, headers: corsHeaders });
    }

    const memoryStatus = await MemoryService.getSessionStatus(sessionId);

    return NextResponse.json({ ok: true, text: result.text, provider: result.provider, sessionId, memoryStatus, rateLimitRemaining: remaining }, { headers: corsHeaders });
  } catch (err) {
    const message = sanitizeError(err);
    console.error('Chat API error:', { error: message, timestamp: new Date().toISOString() });
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
