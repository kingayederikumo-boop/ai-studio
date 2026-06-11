import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GitHubService } from "@/src/services/githubService";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, path, message, branch } = body;
    if (!owner || !repo || !path || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await GitHubService.deleteFile(owner, repo, path, message, branch || "main");
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Failed to delete file" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
