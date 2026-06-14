import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NvidiaService } from "@/src/services/nvidiaService";
import { validateApiKey } from "@/src/lib/auth";
import { getCorsHeaders } from "@/src/lib/cors";
import { sanitizeError } from "@/src/lib/validation";

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const status = NvidiaService.getKeyRotationStatus();
    return NextResponse.json({ ok: true, status }, { headers: corsHeaders });
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}
