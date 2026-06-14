import { NextRequest } from 'next/server';

export function validateApiKey(req: NextRequest): { valid: boolean; userId?: string } {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return { valid: false };
  }

  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer') {
    return { valid: false };
  }

  // Read API keys at REQUEST time, not module load time
  // This ensures Vercel environment variables are correctly loaded
  const VALID_API_KEYS = [
    process.env.NEXT_PUBLIC_API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
  ].filter(Boolean);

  if (!token || !VALID_API_KEYS.includes(token)) {
    return { valid: false };
  }

  return { valid: true, userId: token };
}

export function redactApiKey(key: string | undefined): string {
  if (!key) return 'REDACTED';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}
