import { NextResponse } from "next/server";
import { GitHubService } from "@/src/services/githubService";

export async function GET() {
  try {
    const result = await GitHubService.listRepositories();
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Failed to list repositories" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, repos: result.payload || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
