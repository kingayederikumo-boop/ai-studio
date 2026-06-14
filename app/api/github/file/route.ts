import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GitHubService } from "@/src/services/githubService";
import { validateApiKey } from "@/src/lib/auth";
import { getCorsHeaders, validateRequestSize } from "@/src/lib/cors";
import { sanitizeError } from "@/src/lib/validation";

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    // Validate request size
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(contentLength, 5242880)) { // 5MB for file operations
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
    const { owner, repo, path, content, message, branch } = body;
    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await GitHubService.createOrUpdateFile(owner, repo, path, content, message, branch || "main");
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to write file" },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true, commitUrl: result.payload?.commitUrl }, { headers: corsHeaders });
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}
