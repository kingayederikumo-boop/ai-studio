import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NvidiaService } from "@/src/services/nvidiaService";

export async function GET() {
  try {
    const status = NvidiaService.getKeyRotationStatus();
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
