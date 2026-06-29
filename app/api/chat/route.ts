import { NextRequest, NextResponse } from 'next/server';
import { ProviderRouter } from '@/src/services/providerRouter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, provider: requestedProvider } = body;
    
    if (!prompt?.trim()) {
      return NextResponse.json({ ok: false, error: 'Prompt is required' }, { status: 400 });
    }

    const provider = requestedProvider || 'nvidia';
    const result = await ProviderRouter.generateText(prompt.trim(), provider as any);

    if (!result.ok) {
      console.error('[Chat API] Provider error:', result.error);
      return NextResponse.json({ ok: false, error: result.error || 'Unknown provider error' }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      text: result.text,
      provider: result.provider 
    });
  } catch (error) {
    console.error('[Chat API Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}