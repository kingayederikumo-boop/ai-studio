import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LangChainService } from '@/src/services/langchainService';
import { validateApiKey } from '@/src/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Health check and model status
export async function GET(req: NextRequest) {
  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const status = LangChainService.getModelRotationStatus();
    return NextResponse.json(
      {
        ok: true,
        message: 'LangChain API ready',
        status,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

interface LangChainRequestBody {
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  model?: string;
}

// POST - Invoke LangChain model
export async function POST(req: NextRequest) {
  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body: LangChainRequestBody = await req.json();

    // Support both messages array or simple prompt
    let messages: Array<{ role: string; content: string }>;

    if (body.messages) {
      messages = body.messages;
    } else if (body.prompt) {
      messages = [{ role: 'user', content: body.prompt }];
    } else {
      return NextResponse.json(
        { ok: false, error: 'Missing "messages" array or "prompt" string' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Invoke model (with optional specific model selection)
    const result = await LangChainService.invoke(
      messages as any,
      body.model
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        content: result.content,
        reasoning: result.reasoning,
        model: result.model,
        provider: result.provider,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
