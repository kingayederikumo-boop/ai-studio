import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ProviderRouter } from "@/src/services/providerRouter";
import type { ProviderType } from "@/src/services/providerRouter";
import { NvidiaService } from "@/src/services/nvidiaService";

// GET handler for health checks or initialization
export async function GET() {
  try {
    const status = NvidiaService.getKeyRotationStatus();
    return NextResponse.json({ ok: true, status, message: "Chat API ready" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt;
    const provider: ProviderType = body?.provider || "openai";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
    }

    // If using Nvidia, randomly select one of the 4 available models
    if (provider === "nvidia") {
      const status = NvidiaService.getKeyRotationStatus();
      const totalKeys = status.totalKeys;
      if (totalKeys > 0) {
        const randomIndex = Math.floor(Math.random() * totalKeys);
        NvidiaService.setCurrentKeyIndex(randomIndex);
        const selectedModel = status.models[randomIndex] || status.models[0];
        console.log(`[Chat] Randomly selected Nvidia model: ${selectedModel} (slot ${randomIndex + 1}/${totalKeys})`);
      }
    }

    const result = await ProviderRouter.generateText(prompt, provider);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Provider error" }, { status: 500 });
    }

    // Include which model/provider was used in the response
    const response: any = { ok: true, text: result.text };
    if (provider === "nvidia") {
      const status = NvidiaService.getKeyRotationStatus();
      response.usedModel = status.models[status.currentKeyIndex] || status.models[0];
      response.usedSlot = status.currentKeyIndex + 1;
      response.totalSlots = status.totalKeys;
    }
    response.provider = provider;

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
