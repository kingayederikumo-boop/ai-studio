import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GitHubService } from '@/src/services/githubService';
import { parseCommand, getCommandHelp } from '@/src/lib/chat-commands';
import { validateApiKey } from '@/src/lib/auth';
import { getCorsHeaders, validateRequestSize } from '@/src/lib/cors';
import { sanitizeError } from '@/src/lib/validation';

/**
 * POST /api/github/commands
 * Execute GitHub commands from chat
 */
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const contentLength = req.headers.get('content-length');
    if (!validateRequestSize(contentLength, 1048576)) {
      return NextResponse.json(
        { ok: false, error: 'Request body too large' },
        { status: 413, headers: corsHeaders }
      );
    }

    const { valid } = validateApiKey(req);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing command' },
        { status: 400, headers: corsHeaders }
      );
    }

    const parsed = parseCommand(command);

    switch (parsed.type) {
      case 'help': {
        const help = getCommandHelp(parsed.args.raw);
        return NextResponse.json(
          { ok: true, type: 'help', content: help },
          { headers: corsHeaders }
        );
      }

      case 'github-repos': {
        const result = await GitHubService.listRepositories();
        return NextResponse.json(
          { ok: result.ok, type: 'repos', data: result.payload, error: result.error },
          { headers: corsHeaders }
        );
      }

      case 'github-status': {
        const [owner, repo] = (parsed.args.raw || '').split('/');
        if (!owner || !repo) {
          return NextResponse.json(
            { ok: false, error: 'Usage: /github-status owner/repo' },
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await GitHubService.getRepositoryDetails(owner, repo);
        return NextResponse.json(
          { ok: result.ok, type: 'status', data: result.payload, error: result.error },
          { headers: corsHeaders }
        );
      }

      case 'github-files': {
        const [owner, repo] = (parsed.args.raw || '').split('/');
        const path = parsed.args.extra || '';

        if (!owner || !repo) {
          return NextResponse.json(
            { ok: false, error: 'Usage: /github-files owner/repo [path:/path]' },
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await GitHubService.listFiles(owner, repo, path);
        return NextResponse.json(
          { ok: result.ok, type: 'files', data: result.payload, error: result.error },
          { headers: corsHeaders }
        );
      }

      case 'github-search': {
        return NextResponse.json(
          { ok: true, type: 'search', content: 'Code search requires implementing GitHub Search API' },
          { headers: corsHeaders }
        );
      }

      case 'github-create-pr': {
        return NextResponse.json(
          { ok: true, type: 'pr-wizard', content: 'Start a guided PR creation workflow' },
          { headers: corsHeaders }
        );
      }

      default:
        return NextResponse.json(
          { ok: false, error: 'Unknown command', suggestion: 'Use /help for available commands' },
          { status: 400, headers: corsHeaders }
        );
    }
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
