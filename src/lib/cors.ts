import { NextRequest } from 'next/server';

/**
 * Get CORS headers with proper origin validation
 */
export function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // List of allowed origins
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  const corsOrigin = isAllowed ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Validate request size to prevent DoS
 */
export function validateRequestSize(contentLength: string | null, maxBytes: number = 1048576): boolean {
  if (!contentLength) return true; // Allow if no size header
  const size = parseInt(contentLength, 10);
  return size <= maxBytes;
}
