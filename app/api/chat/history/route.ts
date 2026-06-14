import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ChatHistoryService } from '@/src/services/chatHistoryService';
import { validateApiKey } from '@/src/lib/auth';
import { getCorsHeaders } from '@/src/lib/cors';
import { sanitizeError } from '@/src/lib/validation';

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
    const search = searchParams.get('search');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session with messages
      const session = await ChatHistoryService.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { ok: false, error: 'Session not found' },
          { status: 404, headers: corsHeaders }
        );
      }

      const messages = await ChatHistoryService.getSessionMessages(sessionId);
      return NextResponse.json(
        { ok: true, session, messages },
        { headers: corsHeaders }
      );
    }

    if (search) {
      // Search sessions
      const sessions = await ChatHistoryService.searchSessions(search);
      return NextResponse.json(
        { ok: true, sessions },
        { headers: corsHeaders }
      );
    }

    // Get all sessions
    const sessions = await ChatHistoryService.getAllSessions();
    return NextResponse.json(
      { ok: true, sessions },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = sanitizeError(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: NextRequest) {
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Missing sessionId' },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await ChatHistoryService.deleteSession(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: 'Failed to delete session' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Session deleted' },
      { headers: corsHeaders }
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
