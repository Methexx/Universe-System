# Backend Environment Variables

All variables are validated at startup via Zod in [src/config/env.ts](src/config/env.ts). The app will refuse to start if a required variable is missing or invalid.

Copy `.env.example` to `.env` and fill in the values below.

---

## Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Port the Fastify server listens on |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` — controls logging, error detail, cookie flags |

---

## Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | — | Prisma connection string — use the **pooled** Supabase URL (port 6543, `pgbouncer=true`) |
| `DIRECT_URL` | No* | — | Non-pooler URL for `prisma migrate` — required when running migrations |

> `DIRECT_URL` is not declared in the Zod schema so the app starts without it, but migrations will fail without it. Add it to your `.env` and to `prisma/schema.prisma` as `directUrl`.

**Where to get it:** Supabase dashboard → Project → Settings → Database → Connection string.

---

## Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | — | Redis connection URL. If omitted, all cache operations are silently skipped |
| `REDIS_DEFAULT_TTL` | No | `120` | Default cache TTL in seconds |

In Docker Compose the URL is automatically set to `redis://redis:6379`.

---

## Supabase

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | **Yes** | — | Supabase project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_ANON_KEY` | **Yes** | — | Public anon key — respects Row-Level Security |
| `SUPABASE_SERVICE_KEY` | **Yes** | — | Service role key — bypasses RLS, used for admin operations |

**Where to get it:** Supabase dashboard → Project → Settings → API.

> Never expose `SUPABASE_SERVICE_KEY` to the client/frontend.

---

## Auth

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | — | Secret used to sign/verify JWTs — minimum 32 characters |

Generate one with: `openssl rand -hex 32`

---

## Email — Resend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | **Yes** | — | Resend API key (prefix `re_`) |
| `RESEND_FROM_EMAIL` | **Yes** | — | Sender address shown on outgoing emails |

Used for: OTP emails, transactional notifications.  
**Where to get it:** [resend.com](https://resend.com) → API Keys.

---

## AI / ML

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini key — used for `text-embedding-004` embeddings in the RAG pipeline |
| `ANTHROPIC_API_KEY` | **Yes** | — | Anthropic key — used for Claude answer generation in the RAG pipeline |
| `OPENAI_API_KEY` | No | — | OpenAI key — declared in schema, not currently wired to any service |

**Where to get them:**
- Gemini: [Google AI Studio](https://aistudio.google.com/app/apikey)
- Anthropic: [Anthropic Console](https://console.anthropic.com/)
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)

---

## Firebase — Push Notifications

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_PROJECT_ID` | No | — | Firebase project ID — if omitted, FCM push notifications are disabled |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | No* | — | Full service account JSON as a single-line string |

> `FIREBASE_SERVICE_ACCOUNT_JSON` is not in the Zod schema but is read directly in `src/config/firebase.ts`. Required if `FIREBASE_PROJECT_ID` is set.

**Where to get it:** Firebase console → Project settings → Service accounts → Generate new private key. Stringify the downloaded JSON (`JSON.stringify(...)`) and paste as one line.

---

## CORS Origins

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEB_URL` | No | `http://localhost:3000` | Allowed origin for the Next.js web frontend |
| `FLUTTER_ORIGIN` | No | `http://localhost:3001` | Allowed origin for the Flutter mobile app |

---

## Quick Reference — required keys to get started

```
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
JWT_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
GEMINI_API_KEY
ANTHROPIC_API_KEY
```
