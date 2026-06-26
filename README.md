# AI Studio

## Setup

1. Copy `.env.local.example` to `.env.local` (local dev)
2. Fill all keys from list: NVIDIA_*_1-5, GITHUB_TOKEN_*, Supabase vars
3. Vercel Dashboard → Settings → Environment Variables: Add ALL of them
4. Redeploy

Primary: NVIDIA for chat (with key rotation). GitHub tab uses token. Errors fixed by proper env config.