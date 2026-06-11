import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GitHubService } from "@/src/services/githubService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, head, base, title, body: prBody } = body;
    if (!owner || !repo || !head || !base) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await GitHubService.createPullRequest(owner, repo, head, base || "main", title, prBody);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Failed to create PR" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: result.payload?.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
