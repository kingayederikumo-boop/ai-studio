import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NvidiaService } from "@/src/services/nvidiaService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotIndex } = body; // 1-based
    if (typeof slotIndex !== "number") {
      return NextResponse.json({ ok: false, error: "Missing slotIndex (1-based)" }, { status: 400 });
    }

    const idx = slotIndex - 1;
    const res = NvidiaService.setCurrentKeyIndex(idx as number);
    if (res === null) {
      return NextResponse.json({ ok: false, error: "Invalid slotIndex or no keys configured" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, currentKeyIndex: res });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
