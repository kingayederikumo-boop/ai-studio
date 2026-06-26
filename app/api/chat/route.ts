import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized or invalid API key' }, { status: 401 });
  }
  // TODO: implement actual call
  return NextResponse.json({ response: 'Mock response' });
}