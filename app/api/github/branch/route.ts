import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GitHubService } from "@/src/services/githubService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, branchName, from } = body;
    if (!owner || !repo || !branchName) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await GitHubService.createBranch(owner, repo, branchName, from || "main");
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || "Failed to create branch" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ref: result.payload?.ref });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
