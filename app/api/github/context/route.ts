import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GitHubService } from '@/src/services/githubService';
import { validateApiKey } from '@/src/lib/auth';
import { getCorsHeaders } from '@/src/lib/cors';
import { sanitizeError } from '@/src/lib/validation';

/**
 * GET /api/github/context
 * Get repository context for @ mentions and file/repo picker
 */
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path') || '';
    const type = searchParams.get('type') || 'files'; // 'files', 'repos', 'status'

    if (type === 'repos') {
      // List user repos
      const result = await GitHubService.listRepositories();
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { ok: true, repos: result.payload },
        { headers: corsHeaders }
      );
    }

    if (type === 'files' && owner && repo) {
      // List files in repo
      const result = await GitHubService.listFiles(owner, repo, path);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { ok: true, files: result.payload },
        { headers: corsHeaders }
      );
    }

    if (type === 'status' && owner && repo) {
      // Get repo status
      const result = await GitHubService.getRepositoryDetails(owner, repo);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { ok: true, repo: result.payload },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Missing or invalid parameters' },
      { status: 400, headers: corsHeaders }
    );
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}
