# 10 — Production Readiness

## Overview

This document outlines the deployment architecture, environment configuration, and production checklist for the Universe platform.

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PRODUCTION                        │
│                                                     │
│  ┌──────────────┐      ┌──────────────────────┐    │
│  │    Vercel    │      │  Railway / Render     │    │
│  │              │      │                      │    │
│  │  Next.js     │─────▶│  Fastify API         │    │
│  │  Dashboard   │      │  Node.js 20          │    │
│  │              │      │  Docker Container    │    │
│  └──────────────┘      └──────────┬───────────┘    │
│                                   │                 │
│              ┌────────────────────┼──────────┐      │
│              ▼                    ▼          ▼      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Supabase   │  │   Firebase   │  │  OpenAI  │  │
│  │    Cloud     │  │     FCM      │  │   API    │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Services Summary

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| Frontend | Vercel | Next.js hosting | Free tier |
| Backend | Railway | Fastify API | Free tier |
| Database | Supabase | PostgreSQL + all features | Free tier |
| Push Notifications | Firebase | FCM | Free |
| AI/Embeddings | OpenAI | RAG + Chat | Pay per use |
| Flutter App | App stores / Direct APK | Mobile | Free |

---

## Environment Variables

### Backend Production (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# JWT
JWT_SECRET=strong_random_secret_min_32_chars

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Firebase Admin
FIREBASE_PROJECT_ID=universe-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@universe-xxxxx.iam.gserviceaccount.com
```

### Frontend Production (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.universe-platform.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Production Dockerfile (Backend)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

---

## Production Dockerfile (Frontend)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Supabase Production Setup

```
1. Enable pgvector extension
2. Run all migration SQL scripts
3. Seed first admin user
4. Configure Auth:
    → Email OTP enabled
    → Redirect URLs configured
    → Email templates customized
5. Storage buckets:
    → module-documents (private)
    → avatars (public)
6. Row Level Security (RLS):
    → Enable on all tables
    → Policies match RBAC roles
7. Realtime:
    → Enable for: notifications, attendance_records,
                  announcements, questions
```

---

## Row Level Security Policies

```sql
-- Users can only read their own notifications
CREATE POLICY "users_own_notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Students can only see their own attendance
CREATE POLICY "students_own_attendance"
ON attendance_records FOR SELECT
USING (auth.uid() = student_id);

-- Lecturers can only see their module documents
CREATE POLICY "lecturers_own_documents"
ON module_documents FOR ALL
USING (auth.uid() = lecturer_id);
```

---

## Security Checklist

```
Authentication:
    ✅ JWT secret is strong (32+ chars)
    ✅ Tokens expire in 7 days
    ✅ HTTP-only cookies on web
    ✅ flutter_secure_storage on mobile
    ✅ OTP expires in 10 minutes
    ✅ Max 3 OTP attempts

API Security:
    ✅ HTTPS only (TLS)
    ✅ CORS configured for known origins
    ✅ Helmet.js security headers
    ✅ Rate limiting on auth endpoints
    ✅ Input validation (Zod) on all endpoints
    ✅ RBAC on all protected routes

Database Security:
    ✅ Row Level Security enabled
    ✅ Service key never exposed to client
    ✅ Anon key only for public operations
    ✅ Parameterized queries (no SQL injection)

File Upload Security:
    ✅ Only PDF files accepted
    ✅ Max file size: 10MB
    ✅ Signed URLs for private documents
    ✅ Virus scan (optional, future)
```

---

## Performance Checklist

```
Backend:
    ✅ Database indexes on foreign keys
    ✅ Vector index (ivfflat) for RAG
    ✅ Connection pooling (Supabase built-in)
    ✅ Fastify schema-based serialization
    ✅ Async/await throughout

Frontend (Next.js):
    ✅ Server components where possible
    ✅ Image optimization
    ✅ API response caching

Flutter:
    ✅ Lazy loading screens
    ✅ Cached network images
    ✅ Pagination on lists
```

---

## Monitoring (Future)

```
→ Supabase dashboard for DB metrics
→ Railway logs for API monitoring
→ Vercel analytics for web dashboard
→ Firebase console for FCM delivery rates
→ OpenAI usage dashboard for cost tracking
```

---

## Pre-Submission Demo Checklist

```
Core flows to demo in viva:

1. Student registers → OTP → academic profile → dashboard
2. Lecturer uploads PDF → student asks question → AI answers
3. Student escalates → lecturer answers → student notified
4. Lecturer creates QR → student scans → attendance recorded
5. Student submits complaint → admin assigns → lecturer notified
6. Admin posts announcement → students receive push notification
7. AI chat conversation
8. Admin promotes demo user to lecturer
9. Lecturer posts module announcement
10. Student views attendance history + complaint history
```
