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
    if (!validateRequestSize(contentLength, 1048576)) { // 1MB limit
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
    const { owner, repo, head, base, title, body: prBody } = body;
    if (!owner || !repo || !head || !base) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await GitHubService.createPullRequest(owner, repo, head, base || "main", title, prBody);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to create PR" },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true, url: result.payload?.url }, { headers: corsHeaders });
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}
