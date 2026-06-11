import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GitHubService } from "@/src/services/githubService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, path, content, message, branch } = body;
    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await GitHubService.createOrUpdateFile(owner, repo, path, content, message, branch || "main");
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Failed to write file" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, commitUrl: result.payload?.commitUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
