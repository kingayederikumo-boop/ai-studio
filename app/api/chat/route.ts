import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ProviderRouter } from "@/src/services/providerRouter";
import type { ProviderType } from "@/src/services/providerRouter";
import { MemoryService } from "@/src/services/memoryService";

// Simple UUID generation without external dependency
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET handler for health checks
export async function GET() {
  try {
    const activeSessions = MemoryService.getActiveSessions();
    return NextResponse.json({
      ok: true,
      message: "Chat API ready",
      activeSessions: activeSessions.length,
    });
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
    const sessionId: string = body?.sessionId || generateSessionId();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing prompt" },
        { status: 400 }
      );
    }

    // Use memory-based conversation if sessionId provided
    const result = await ProviderRouter.generateTextWithMemory(
      prompt,
      provider,
      sessionId
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Provider error" },
        { status: 500 }
      );
    }

    // Get session memory status for response
    const memoryStatus = await ProviderRouter.getSessionMemoryStatus(sessionId);

    return NextResponse.json({
      ok: true,
      text: result.text,
      provider: result.provider,
      sessionId,
      memoryStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
