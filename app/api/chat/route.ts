import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ProviderRouter } from "@/src/services/providerRouter";
import type { ProviderType } from "@/src/services/providerRouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt;
    const provider: ProviderType = body?.provider || "openai";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
    }

    const result = await ProviderRouter.generateText(prompt, provider);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Provider error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, text: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
