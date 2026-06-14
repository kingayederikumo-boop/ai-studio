# Security & Environment Configuration Guide

## 🔒 CORS & ALLOWED_ORIGINS

### What is ALLOWED_ORIGINS?

CORS (Cross-Origin Resource Sharing) controls which websites can call your API. Without proper configuration, **anyone on the internet can attack your API**.

### The Security Risk

Without CORS protection:
1. An attacker's website (e.g., `evil.com`) loads in a user's browser
2. Malicious JavaScript makes requests to your API (`yourdomain.com/api/chat`)
3. Your API accepts the request (if not protected)
4. Attacker can:
   - Steal your API keys
   - Send spam requests
   - Deplete your rate limit quota
   - Use your GitHub tokens
   - Cost you money on LLM API calls

### How ALLOWED_ORIGINS Protects You

ALLOWED_ORIGINS is a whitelist of domains that are **allowed** to call your API. All other origins are rejected by the browser automatically.

```
Browser CORS Protection Flow:

1. evil.com sends request to your API
2. Browser checks: "Is evil.com in ALLOWED_ORIGINS?"
3. NO → Browser blocks request ❌
4. Response never reaches evil.com
```

### How to Set ALLOWED_ORIGINS in Vercel

#### Step 1: Get Your Domain
Find your deployment URL:
- Vercel auto-generated: `https://ai-studio-abc123.vercel.app`
- Custom domain: `https://yourdomain.com`

#### Step 2: Add to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **ai-studio** project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**:
   - **Name:** `ALLOWED_ORIGINS`
   - **Value:** `https://ai-studio-abc123.vercel.app,https://yourdomain.com`
   - **Environments:** Select all (Production, Preview, Development)
5. Click **Save**

#### Step 3: Redeploy
```bash
git push  # Redeploy to activate new environment variables
```

### ALLOWED_ORIGINS Examples

#### Development Only (localhost)
```env
ALLOWED_ORIGINS=http://localhost:3000
```

#### Single Production Domain
```env
ALLOWED_ORIGINS=https://ai-studio.vercel.app
```

#### Multiple Domains
```env
ALLOWED_ORIGINS=https://ai-studio.vercel.app,https://yourdomain.com,https://api.yourdomain.com
```

#### Allow All (⚠️ NOT RECOMMENDED)
```env
ALLOWED_ORIGINS=*
```
**Only use for testing or open APIs!**

### What Happens When a Request is Blocked

```
Request from unauthorized origin (evil.com):

1. Browser sends: Origin: evil.com
2. Your API responds: Access-Control-Allow-Origin: https://ai-studio.vercel.app
3. Mismatch! Browser blocks response ❌
4. JavaScript gets: "CORS error"
5. Request fails silently
```

---

## 🔐 Other Security Features

### API Key Authentication
All endpoints require an API key in the Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://your-api.com/api/chat
```

**Vercel Environment Variables:**
- `NEXT_PUBLIC_API_KEY` - Primary API key
- `API_KEY_2` - Secondary (for rotation)
- `API_KEY_3` - Tertiary (for rotation)

### Rate Limiting
Protects against DoS and abuse:
- 10 requests per minute per IP + API key
- Uses Redis (Upstash on Vercel) for distributed rate limiting
- Falls back to in-memory for development

### Request Size Limits
Prevents memory exhaustion:
- Chat endpoints: 1MB limit
- File operations: 5MB limit
- Validated before processing

### Error Sanitization
Prevents information disclosure:
- API keys redacted from error messages
- Tokens removed before returning to client
- Secrets never logged

---

## 📋 Environment Variables Checklist

### Required for Production

- [ ] `ALLOWED_ORIGINS` - CORS whitelist (comma-separated)
- [ ] `NEXT_PUBLIC_API_KEY` - Main API authentication key
- [ ] `OPENAI_API_KEY` - OpenAI API key (if using OpenAI)
- [ ] `NVIDIA_API_KEY_1` - Nvidia API key (if using Nvidia)
- [ ] `GITHUB_TOKEN_CLASSIC` - GitHub Personal Access Token
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key

### Optional but Recommended

- [ ] `API_KEY_2`, `API_KEY_3` - For key rotation
- [ ] `UPSTASH_REDIS_REST_URL` - For distributed rate limiting
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis auth
- [ ] `OPENAI_MODEL` - Specify OpenAI model
- [ ] `NVIDIA_INFERENCE_MODEL` - Specify Nvidia model

---

## 🛡️ Best Practices

### API Keys
✅ DO:
- Use strong, random API keys (32+ characters)
- Rotate keys regularly
- Store in Vercel environment variables
- Use different keys for dev/staging/production

❌ DON'T:
- Commit keys to GitHub
- Share keys in messages or logs
- Use simple keys like "password123"
- Expose keys in error messages

### CORS Configuration
✅ DO:
- Use specific domains you own
- Update when deploying to new URL
- Test with curl: `curl -H "Origin: yourdomain.com" https://your-api.com`

❌ DON'T:
- Use `*` in production
- Add untrusted domains
- Disable CORS entirely

### Rate Limiting
✅ DO:
- Monitor rate limit usage
- Set alerts for abuse patterns
- Use distributed rate limiting (Redis) at scale

❌ DON'T:
- Disable rate limiting
- Set limits too high
- Trust IP addresses alone for rate limiting

---

## 🧪 Testing CORS Configuration

### Test with curl
```bash
# Test allowed origin
curl -H "Origin: https://ai-studio.vercel.app" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-api.com/api/chat/health

# Should see: Access-Control-Allow-Origin: https://ai-studio.vercel.app

# Test blocked origin
curl -H "Origin: https://evil.com" \
  https://your-api.com/api/chat/health

# Should see: No CORS header (browser blocks automatically)
```

### Test with JavaScript
```javascript
// This will work
fetch('https://your-api.com/api/chat', {
  headers: { 'Authorization': 'Bearer KEY' }
})

// Browser will block this automatically if origin not in ALLOWED_ORIGINS
```

---

## 📞 Troubleshooting

### "CORS error" or "No 'Access-Control-Allow-Origin' header"

**Check:**
1. Is `ALLOWED_ORIGINS` set in Vercel?
2. Does it include your current domain?
3. Have you redeployed after changing env vars?
4. Are you including the API key?

### API key not working

**Check:**
1. Is the key set in Vercel environment variables?
2. Are you sending it in Authorization header: `Bearer YOUR_KEY`?
3. Have you redeployed?

### Rate limit errors

**Check:**
1. How many requests are you sending?
2. Is Redis URL configured?
3. Are you sharing API key across multiple clients?

---

## 📚 Further Reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel: Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OWASP: API Security](https://owasp.org/www-project-api-security/)
