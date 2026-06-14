import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NvidiaService } from "@/src/services/nvidiaService";
import { validateApiKey } from "@/src/lib/auth";
import { getCorsHeaders, validateRequestSize } from "@/src/lib/cors";
import { sanitizeError } from "@/src/lib/validation";

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(contentLength, 1048576)) {
      return NextResponse.json(
        { ok: false, error: "Request body too large" },
        { status: 413, headers: corsHeaders }
      );
    }

    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { slotIndex } = body; // 1-based
    if (typeof slotIndex !== "number") {
      return NextResponse.json(
        { ok: false, error: "Missing slotIndex (1-based)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const idx = slotIndex - 1;
    const res = NvidiaService.setCurrentKeyIndex(idx as number);
    if (res === null) {
      return NextResponse.json(
        { ok: false, error: "Invalid slotIndex or no keys configured" },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true, currentKeyIndex: res }, { headers: corsHeaders });
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}
