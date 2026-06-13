// Simple in-memory rate limiter (for single-server deployments)
// For distributed deployments, use Redis-based Ratelimit library

interface RateLimitRecord {
  requests: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const REQUESTS_PER_MINUTE = 10;
const MINUTE_MS = 60 * 1000;

function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    cleanupExpiredRecords();
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetAt) {
      // Create new record
      const resetAt = now + MINUTE_MS;
      rateLimitStore.set(identifier, { requests: 1, resetAt });
      return { success: true, remaining: REQUESTS_PER_MINUTE - 1, resetTime: resetAt };
    }

    if (record.requests >= REQUESTS_PER_MINUTE) {
      return { success: false, remaining: 0, resetTime: record.resetAt };
    }

    record.requests++;
    return {
      success: true,
      remaining: REQUESTS_PER_MINUTE - record.requests,
      resetTime: record.resetAt,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open in case of errors
    return { success: true, remaining: REQUESTS_PER_MINUTE, resetTime: Date.now() + MINUTE_MS };
  }
}
