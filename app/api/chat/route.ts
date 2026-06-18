import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ProviderRouter } from '@/src/services/providerRouter';
import type { ProviderType } from '@/src/services/providerRouter';
import { MemoryService } from '@/src/services/memoryService';
import { validateApiKey } from '@/src/lib/auth';
import { validatePrompt, validateSessionId, sanitizeError } from '@/src/lib/validation';
import { checkRateLimit } from '@/src/lib/rateLimiter';
import { getCorsHeaders, validateRequestSize } from '@/src/lib/cors';

// ----- LangChain imports -----
import { ChatNVIDIA } from '@langchain/nvidia-ai-endpoints';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// -----------------------------

// Generate cryptographically secure session ID
function generateSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* fallback */ }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

// OPTIONS & GET handlers (unchanged)
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
    return NextResponse.json(
      { ok: true, message: 'Chat API ready', activeSessions: activeSessions.length },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: sanitizeError(err) }, { status: 500, headers: corsHeaders });
  }
}

// ----- NVIDIA model configuration (EXACT IDs from your catalog) -----
const nvidiaModelMap: Record<string, { modelId: string; apiKey: string }> = {
  'nemotron-ultra': {
    modelId: 'nvidia/nemotron-3-ultra-550b-a55b',
    apiKey: process.env.NVIDIA_API_KEY_1!,
  },
  'nemotron-nano': {
    modelId: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    apiKey: process.env.NVIDIA_API_KEY_2!,
  },
  'qwen': {
    modelId: 'qwen/qwen2.5-coder-32b-instruct',
    apiKey: process.env.NVIDIA_API_KEY_3!,
  },
  'deepseek': {
    modelId: 'deepseek-ai/deepseek-v4-pro',
    apiKey: process.env.NVIDIA_API_KEY_4!,
  },
  'kimi': {
    modelId: 'moonshotai/kimi-k2.6',
    apiKey: process.env.NVIDIA_API_KEY_5!,
  },
};

// Helper: call NVIDIA with memory
async function callNvidiaModel(
  prompt: string,
  modelKey: string,
  sessionId: string
): Promise<{ text: string; provider: string }> {
  const config = nvidiaModelMap[modelKey];
  if (!config) throw new Error(`Unknown model: ${modelKey}`);

  // Get conversation history from your MemoryService
  const history = await MemoryService.getHistory(sessionId); // implement this method

  // Build messages: system + history + current prompt
  const messages: [string, string][] = [
    ['system', 'You are a helpful assistant.'],
    ...history.map((msg: { role: string; content: string }) => [msg.role, msg.content] as [string, string]),
    ['human', prompt],
  ];

  const promptTemplate = ChatPromptTemplate.fromMessages(messages);
  const model = new ChatNVIDIA({
    model: config.modelId,
    temperature: 0.7,
    apiKey: config.apiKey,
  });

  const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
  const response = await chain.invoke({});

  // Save to memory
  await MemoryService.addMessage(sessionId, 'user', prompt);
  await MemoryService.addMessage(sessionId, 'assistant', response);

  return { text: response, provider: `nvidia-${modelKey}` };
}
// -----------------------------------------------------------------

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    // ---- All validations (unchanged) ----
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
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Maximum 10 requests per minute.' },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } }
      );
    }

    let body: any;
    try { body = await req.json(); } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON in request body' }, { status: 400, headers: corsHeaders });
    }

    const prompt: string = body?.prompt;
    const provider: ProviderType = body?.provider || 'openai';
    const sessionId: string = body?.sessionId || generateSessionId();
    const model: string = body?.model || 'nemotron-ultra'; // NEW

    const promptErrors = validatePrompt(prompt);
    if (promptErrors.length > 0) {
      return NextResponse.json({ ok: false, error: 'Invalid prompt', errors: promptErrors }, { status: 400, headers: corsHeaders });
    }

    const sessionErrors = validateSessionId(sessionId);
    if (sessionErrors.length > 0) {
      return NextResponse.json({ ok: false, error: 'Invalid session ID', errors: sessionErrors }, { status: 400, headers: corsHeaders });
    }

    // ---- Provider branching ----
    if (provider === 'openai') {
      // Keep your existing OpenAI logic
      const result = await ProviderRouter.generateTextWithMemory(prompt, provider, sessionId);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error || 'Provider error' }, { status: 500, headers: corsHeaders });
      }
      const memoryStatus = await MemoryService.getSessionStatus(sessionId);
      return NextResponse.json(
        { ok: true, text: result.text, provider: result.provider, sessionId, memoryStatus, rateLimitRemaining: remaining },
        { headers: corsHeaders }
      );
    } 
    else if (provider === 'nvidia') {
      // Validate model
      if (!nvidiaModelMap[model]) {
        return NextResponse.json(
          { ok: false, error: `Unsupported NVIDIA model: ${model}. Available: ${Object.keys(nvidiaModelMap).join(', ')}` },
          { status: 400, headers: corsHeaders }
        );
      }

      // Call NVIDIA with LangChain
      const result = await callNvidiaModel(prompt, model, sessionId);
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
    } 
    else {
      return NextResponse.json(
        { ok: false, error: 'Invalid provider. Must be "openai" or "nvidia"' },
        { status: 400, headers: corsHeaders }
      );
    }
  } catch (err) {
    const message = sanitizeError(err);
    console.error('Chat API error:', { error: message, timestamp: new Date().toISOString() });
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}