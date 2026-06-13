import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NvidiaService } from "@/src/services/nvidiaService";
import { validateApiKey } from "@/src/lib/auth";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    // Add API key validation for security
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const status = NvidiaService.getKeyRotationStatus();
    return NextResponse.json({ ok: true, status }, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
