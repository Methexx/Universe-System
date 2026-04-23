# 10 — Production Readiness

> School Connect — Deployment, Security & Pre-Submission Checklist

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
│                                                              │
│  ┌──────────────┐      ┌──────────────────────────────┐     │
│  │    Vercel    │      │         Railway               │     │
│  │              │      │                              │     │
│  │  Next.js 14  │─────▶│  Fastify API                 │     │
│  │  Web Dashboard│      │  Node.js 20 / Docker         │     │
│  └──────────────┘      └──────────────┬───────────────┘     │
│                                       │                      │
│            ┌──────────────────────────┼──────────┐           │
│            ▼                          ▼          ▼           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Supabase   │  │   Firebase   │  │   OpenAI API     │  │
│  │    Cloud     │  │     FCM      │  │  gpt-4o-mini     │  │
│  │              │  │              │  │  text-embedding  │  │
│  │  PostgreSQL  │  │  Push notif. │  │  -3-small        │  │
│  │  pgvector    │  └──────────────┘  └──────────────────┘  │
│  │  Storage     │                                            │
│  │  Realtime    │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Services Summary

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| Web frontend | Vercel | Next.js hosting | Free tier |
| Backend API | Railway | Fastify API container | Free tier |
| Database | Supabase | PostgreSQL + pgvector + Auth + Storage + Realtime | Free tier |
| Push notifications | Firebase FCM | Parent + teacher push | Free |
| AI embeddings + chat | OpenAI | RAG pipeline + policy bot | Pay per use (~$0.01/question) |
| Flutter app | Direct APK / App stores | Parent mobile | Free |

---

## Environment Variables

### Backend Production (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# Origins (CORS)
WEB_URL=https://school-connect.vercel.app
FLUTTER_ORIGIN=https://school-connect-api.railway.app

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# JWT
JWT_SECRET=minimum_32_character_random_secret_here

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Firebase Admin
FIREBASE_PROJECT_ID=school-connect-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@school-connect.iam.gserviceaccount.com

# Email (OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@school-connect.lk
SMTP_PASS=gmail_app_password

# School configuration
SCHOOL_START_TIME=07:30
RAG_SIMILARITY_THRESHOLD=0.5
RAG_TOP_K_CHUNKS=5
```

### Frontend Production (.env.local)

```env
NEXT_PUBLIC_API_URL=https://school-connect-api.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Production Dockerfiles

### Backend (Dockerfile)

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

### Frontend (Dockerfile)

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
1. Enable extensions:
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     CREATE EXTENSION IF NOT EXISTS "vector";

2. Run all migration SQL files (02-database-schema.md)

3. Seed first admin:
     INSERT INTO users (email, password_hash, role, full_name)
     VALUES ('admin@school.lk', bcrypt_hash, 'admin', 'Principal Name')

4. Configure Auth:
     → Email provider enabled
     → SMTP configured for OTP delivery
     → Email templates customised with School Connect branding

5. Storage buckets:
     → policy-docs (private — admin PDFs for RAG)
     → student-photos (private — student ID photos for gate verification)
     → avatars (public — parent/teacher profile photos)

6. Row Level Security (RLS):
     → Enable on all tables
     → Policies enforced at API level via service key
     → Backend uses service key (bypasses RLS for controlled access)
     → Anon key never used in backend

7. Realtime:
     → Enable Realtime for tables: gate_events, notifications
     → Set appropriate replication filters
```

---

## Row Level Security Policies (Future hardening)

```sql
-- Users can only read their own notifications
CREATE POLICY "users_own_notifications"
ON notifications FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Parents can only see their linked students
CREATE POLICY "parents_own_students"
ON parent_students FOR SELECT
USING (auth.uid()::text = parent_id::text);

-- Teachers can only see students in their assigned class
CREATE POLICY "teachers_own_class_attendance"
ON attendance_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM classes c
    WHERE c.teacher_id = auth.uid()
    AND c.id = attendance_records.class_id
  )
);
```

---

## Security Checklist

```
Authentication:
  ✅ JWT secret is strong (32+ random characters)
  ✅ Token expiry: 7 days with silent refresh
  ✅ HTTP-only cookie on web (sameSite: strict, secure: true)
  ✅ flutter_secure_storage on mobile (AES encrypted)
  ✅ OTP: 6 digits, 10-minute expiry, max 3 attempts
  ✅ token_version for all-sessions logout
  ✅ bcrypt password hashing (rounds: 12)

API Security:
  ✅ HTTPS only — all production connections
  ✅ CORS configured to known origins only
  ✅ Helmet.js security headers
  ✅ Rate limiting on /auth/* endpoints
  ✅ Zod input validation on all endpoints
  ✅ RBAC on all protected routes
  ✅ Service key never exposed to client side

Gate Security:
  ✅ Security role enforced by Next.js middleware
  ✅ All non-/gate routes redirect to /gate
  ✅ Gate API endpoints: security role only
  ✅ Student photo shown for manual entry verification
  ✅ Manual entry reason required and logged

Database Security:
  ✅ Service key used only in backend (never client)
  ✅ Anon key has minimal permissions
  ✅ Parameterised queries via Supabase client (no SQL injection)
  ✅ Parent-student link enforced: UNIQUE(student_id) in parent_students

File Upload Security:
  ✅ Only PDF files accepted for RAG (MIME type check)
  ✅ Max file size: 10MB
  ✅ Only images accepted for photos (MIME type check)
  ✅ Files stored in Supabase Storage (not local filesystem)
  ✅ Signed URLs for private document access
```

---

## Performance Checklist

```
Backend (Fastify):
  ✅ Database indexes on all foreign keys
  ✅ Vector index (ivfflat) for pgvector cosine search
  ✅ Connection pooling via Supabase (built-in)
  ✅ Fastify schema-based JSON serialisation
  ✅ Async/await throughout (no blocking calls)
  ✅ Background processing for RAG pipeline (non-blocking)

Frontend (Next.js):
  ✅ Server components for non-interactive pages
  ✅ Client components only where state needed
  ✅ Next.js Image component for optimisation

Flutter:
  ✅ Cached network images (cached_network_image)
  ✅ Pagination on all list screens
  ✅ Lazy loading with go_router
  ✅ Dispose Realtime channels on screen unmount
```

---

## Pre-Viva Demo Checklist

The following flows must work end-to-end for the viva demonstration.

```
1. Admin flow:
   → Login as admin → create a class + assign teacher
   → Create a student record → verify auto-generated ID + QR
   → Create a pending teacher account → approve → assign class

2. Teacher flow:
   → Login as teacher → see My Classrooms → open class → see students
   → Create today's attendance session → see gate status
   → Mark a student absent → verify FCM fires to parent Flutter app

3. Gate flow (manual — no physical scanner needed):
   → Login as security guard → /gate page opens (redirect enforced)
   → Search student by name → photo appears on screen
   → Confirm entry → verify parent FCM notification received

4. Parent flow (Flutter app):
   → Register → enter Student ID → confirm child → email OTP → home
   → View gate log → verify today's entry appears
   → View attendance → see absent mark from step 2
   → Open AI Bot → ask "What are the school fee dates?" → see answer
   → Send message to teacher → receive reply

5. RAG flow:
   → Admin uploads school fee schedule PDF
   → Parent asks "When are fees due?" → AI answers from document
   → Ask unanswerable question → fallback message shown

6. Grades flow:
   → Teacher creates module "Science" → enters scores for all students
   → Save draft → publish → parent receives FCM notification
   → Parent views grades in Flutter app

7. Complaints flow:
   → Parent submits complaint (category: Facility)
   → Admin assigns to teacher → teacher FCM notification
   → Teacher updates status to Resolved with reply note
   → Parent checks complaint detail → sees resolved status + note
```

---

## Monitoring (Post-Submission)

```
→ Supabase dashboard → DB metrics, storage usage, Realtime connections
→ Railway → API logs, memory/CPU usage
→ Vercel → Request analytics, build logs
→ Firebase console → FCM delivery rates, errors
→ OpenAI usage dashboard → token consumption, cost tracking
```
