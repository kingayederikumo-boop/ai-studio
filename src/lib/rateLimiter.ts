// Redis-based rate limiter with fallback for development
// For production on Vercel, uses Upstash Redis

interface RateLimitRecord {
  requests: number;
  resetAt: number;
}

const REQUESTS_PER_MINUTE = 10;
const MINUTE_MS = 60 * 1000;

// In-memory store for development/fallback
const rateLimitStore = new Map<string, RateLimitRecord>();

// Try to initialize Redis client for Vercel
let redisClient: any = null;
let useRedis = false;

async function initializeRedis() {
  if (useRedis || redisClient) return; // Already initialized
  
  try {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!redisUrl) {
      console.log('[RateLimit] No Redis URL found, using in-memory store');
      return;
    }

    // Try using native Redis if available
    if (process.env.REDIS_URL) {
      try {
        const redis = await import('redis');
        redisClient = redis.createClient({ url: process.env.REDIS_URL });
        await redisClient.connect();
        useRedis = true;
        console.log('[RateLimit] Connected to Redis');
      } catch (err) {
        console.log('[RateLimit] Redis import failed, using in-memory store');
      }
    }

    // Fallback to Upstash REST API
    if (!useRedis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      useRedis = true;
      console.log('[RateLimit] Using Upstash Redis REST API');
    }
  } catch (err) {
    console.error('[RateLimit] Failed to initialize Redis:', err);
  }
}

function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

async function checkRateLimitRedis(
  identifier: string
): Promise<{ success: boolean; remaining: number; resetTime: number } | null> {
  if (!useRedis) return null;

  try {
    // Try native Redis first
    if (redisClient) {
      const key = `ratelimit:${identifier}`;
      const count = await redisClient.get(key);
      const requests = count ? parseInt(count) : 0;

      if (requests >= REQUESTS_PER_MINUTE) {
        const ttl = await redisClient.ttl(key);
        const resetTime = Date.now() + (ttl * 1000);
        return { success: false, remaining: 0, resetTime };
      }

      const newCount = requests + 1;
      await redisClient.setex(key, 60, String(newCount));
      return {
        success: true,
        remaining: REQUESTS_PER_MINUTE - newCount,
        resetTime: Date.now() + MINUTE_MS,
      };
    }

    // Use Upstash REST API
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const key = `ratelimit:${identifier}`;
      const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      // Get current value
      const getRes = await fetch(`${baseUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getData = await getRes.json();
      const requests = getData.result ? parseInt(getData.result) : 0;

      if (requests >= REQUESTS_PER_MINUTE) {
        return { success: false, remaining: 0, resetTime: Date.now() + MINUTE_MS };
      }

      // Increment and set expiry
      const newCount = requests + 1;
      await fetch(`${baseUrl}/setex/${key}/60/${newCount}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        remaining: REQUESTS_PER_MINUTE - newCount,
        resetTime: Date.now() + MINUTE_MS,
      };
    }
  } catch (error) {
    console.error('[RateLimit] Redis check failed:', error);
  }

  return null;
}

// Initialize Redis on module load
initializeRedis().catch(err => console.error('[RateLimit] Init error:', err));

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    // Try Redis first if available
    if (useRedis) {
      const redisResult = await checkRateLimitRedis(identifier);
      if (redisResult) {
        return redisResult;
      }
    }

    // Fallback to in-memory for development
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
    // Fail open in case of errors - allow the request through
    return { success: true, remaining: REQUESTS_PER_MINUTE, resetTime: Date.now() + MINUTE_MS };
  }
}
