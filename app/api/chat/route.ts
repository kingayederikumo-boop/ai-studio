import { NextRequest, NextResponse } from 'next/server';
import { ProviderRouter } from '@/src/services/providerRouter';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ ok: false, error: 'Prompt required' }, { status: 400 });
    const result = await ProviderRouter.generateText(prompt.trim());
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, text: result.text });
  } catch (error) {
    console.error('[Chat API]', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}