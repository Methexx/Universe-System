# Universe System — Backend Deep Dive

> **Document 2 of 5** — Fastify backend: every API endpoint, database schema, authentication, RAG pipeline, middleware, testing, and packages.

**Location:** `apps/backend/`
**Port:** `5000`
**Entry:** `src/server.ts` → `src/app.ts`

---

## Table of Contents

1. [Application Bootstrap](#application-bootstrap)
2. [Folder Structure (Detailed)](#folder-structure-detailed)
3. [Every Package & Its Role](#every-package--its-role)
4. [Database Schema (Prisma)](#database-schema-prisma)
5. [Authentication & Authorization](#authentication--authorization)
6. [Middleware Stack](#middleware-stack)
7. [Complete API Reference](#complete-api-reference)
8. [The RAG Pipeline (How the Chatbot Works)](#the-rag-pipeline-how-the-chatbot-works)
9. [Scheduled Jobs](#scheduled-jobs)
10. [Caching Strategy (Redis)](#caching-strategy-redis)
11. [External Integrations](#external-integrations)
12. [Testing Strategy](#testing-strategy)
13. [Environment Variables](#environment-variables)
14. [NPM Scripts](#npm-scripts)
15. [Error Handling & Response Format](#error-handling--response-format)

---

## Application Bootstrap

### `src/server.ts` — Entry Point

```typescript
// Simplified responsibility flow
1. Load env (validated by Zod in config/env.ts)
2. Initialize Redis (graceful: skip if REDIS_URL not set)
3. Initialize Firebase Admin (FCM)
4. Build Fastify app via createApp() in app.ts
5. Start cron schedulers (gate auto-checkout)
6. app.listen({ port: env.PORT, host: '0.0.0.0' })
```

### `src/app.ts` — Fastify Configuration

```typescript
// What it does, in order:
1. Create Fastify instance with Pino logger
2. Register @fastify/cookie
3. Register @fastify/multipart (5 MB per file limit)
4. Register @fastify/cors (origins: WEB_URL, FLUTTER_ORIGIN, localhost:3000, localhost:3001)
5. Register @fastify/helmet (CORP: cross-origin, CSP: disabled)
6. Register @fastify/rate-limit (global: 100 req/min)
7. Set custom error handler (errorHandler middleware)
8. Register routes with prefixes:
     /api/auth, /api/users, /api/school, /api/gate,
     /api/attendance, /api/announcements, /api/messages,
     /api/complaints, /api/lost-found, /api/results, /api/rag
9. Add GET /health → { ok: true }
```

---

## Folder Structure (Detailed)

```
apps/backend/
├── src/
│   ├── server.ts                              ← App startup
│   ├── app.ts                                 ← Fastify configuration
│   │
│   ├── config/
│   │   ├── env.ts                             ← Zod env schema, fails loud on missing vars
│   │   ├── prisma.ts                          ← PrismaClient singleton (dev: global to survive HMR)
│   │   ├── redis.ts                           ← Redis client; optional, degrades gracefully
│   │   ├── supabase.ts                        ← createClient public + admin (storage uploads)
│   │   └── firebase.ts                        ← Firebase Admin init from FIREBASE_SERVICE_ACCOUNT_JSON
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts                ← JWT verify, DB lookup with retry, Redis online status
│   │   │   ├── rbac.ts                        ← Role guard: rbac(['admin','teacher'])
│   │   │   └── errorHandler.ts                ← Zod → 400, Fastify errors → statusCode, else 500
│   │   └── utils/
│   │       ├── jwt.ts                         ← generateToken({userId,role,email}), verifyToken
│   │       ├── hash.ts                        ← bcrypt: hashPassword(10 rounds), comparePassword
│   │       ├── otp.ts                         ← generateOTP() → 6-digit string
│   │       ├── cache.ts                       ← getCache/setCache/delCache/delCacheByPattern
│   │       ├── email.ts                       ← Resend: sendOtpEmail, sendApprovalEmail (3/10min per addr)
│   │       └── response.ts                    ← successResponse(msg,data) / errorResponse(msg,err)
│   │
│   ├── modules/                               ← 11 feature modules (see Module section)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── school/
│   │   ├── gate/
│   │   ├── attendance/
│   │   ├── announcements/
│   │   ├── messages/
│   │   ├── complaints/
│   │   ├── lost-found/
│   │   ├── results/
│   │   └── rag/
│   │       ├── rag.routes.ts
│   │       ├── rag.schema.ts
│   │       ├── controllers/
│   │       │   ├── ingest.controller.ts       ← PDF upload → chunk → embed → store
│   │       │   ├── query.controller.ts        ← Full RAG pipeline
│   │       │   ├── documents.controller.ts    ← List/Delete policy PDFs
│   │       │   └── eval.controller.ts         ← Evaluation metrics
│   │       └── services/
│   │           ├── chunker.service.ts         ← Recursive / character / markdown chunking
│   │           ├── embedder.service.ts        ← Gemini embeddings (768-dim, batch 100)
│   │           ├── retrieval.service.ts       ← Hybrid search + re-rank
│   │           ├── generation.service.ts      ← Gemini 2.5 Flash Lite answer gen
│   │           └── eval.service.ts            ← Log to EvaluationLog
│   │
│   └── scripts/
│       └── seedAdmin.ts                       ← Bootstrap first admin user
│
├── prisma/
│   ├── schema.prisma                          ← 20 models, 7 phases
│   └── migrations/                            ← Auto-generated history
│
├── tests/
│   ├── setup.ts                               ← Jest mocks (Prisma, Redis, Firebase, Email)
│   ├── unit/
│   │   ├── hash.test.ts
│   │   ├── jwt.test.ts
│   │   ├── otp.test.ts
│   │   └── schemas.test.ts
│   └── integration/
│       ├── auth.test.ts                       ← supertest against built app
│       ├── attendance.test.ts
│       └── gate.test.ts
│
├── .env.example                               ← All required env vars documented
├── Dockerfile.dev                             ← Node 20 alpine, hot reload
├── jest.config.js                             ← ts-jest preset, 70% coverage threshold
├── nodemon.json                               ← Watch src/, exec ts-node src/server.ts
├── tsconfig.json                              ← strict, ES2020, CommonJS
├── tsconfig.build.json                        ← rootDir: src, outDir: dist
└── package.json
```

---

## Every Package & Its Role

### Production Dependencies

| Package | Version | What it does | Where it's used |
|---|---|---|---|
| `fastify` | 5.7.4 | Async-first HTTP framework | `app.ts`, all routes |
| `@fastify/cookie` | 11.0.2 | Parse cookies (auth_token) | `app.ts`, login controller |
| `@fastify/cors` | 11.2.0 | CORS plugin | `app.ts` |
| `@fastify/helmet` | 13.0.2 | Security headers (X-Frame-Options, etc.) | `app.ts` |
| `@fastify/jwt` | 10.0.0 | JWT plugin (alternative API) | Available, our code uses `jsonwebtoken` directly |
| `@fastify/multipart` | 10.0.0 | File uploads (student photos, PDFs) | school routes, rag routes |
| `@fastify/rate-limit` | 10.3.0 | Per-route + global limiting | `app.ts` global, auth & rag routes per-route |
| `@prisma/client` | 6.16.3 | Auto-generated ORM client | Everywhere (`config/prisma.ts`) |
| `prisma` | 6.16.3 | CLI for migrations/generate | npm scripts |
| `@supabase/supabase-js` | 2.97.0 | Supabase SDK | `config/supabase.ts`, file storage |
| `redis` | 4.7.1 | Redis client | `config/redis.ts`, `utils/cache.ts` |
| `bcryptjs` | 3.0.3 | Password hashing | `utils/hash.ts` |
| `jsonwebtoken` | 9.0.3 | JWT signing/verifying | `utils/jwt.ts` |
| `zod` | 4.3.6 | Schema validation + TS inference | Every `*.schema.ts` |
| `firebase-admin` | 13.8.0 | FCM push notifications, admin SDK | `config/firebase.ts`, gate controller |
| `resend` | 6.12.2 | Transactional email | `utils/email.ts` |
| `@google/generative-ai` | 0.24.1 | Gemini embeddings + LLM | rag services |
| `@anthropic-ai/sdk` | 0.93.0 | Claude API (available, currently unused) | (future) |
| `axios` | 1.14.0 | External HTTP calls | rag/eval services |
| `node-cron` | 4.2.1 | Cron scheduler | `gate.scheduler.ts` |
| `pdf-parse` | 2.4.5 | Extract text from PDFs | `ingest.controller.ts` |
| `pino` | 10.3.1 | JSON logger (built into Fastify) | Auto-loaded by Fastify |
| `pino-pretty` | 13.1.3 | Pretty-print logs in dev | dev only |
| `dotenv` | 16.4.7 | Load `.env` files | Auto-loaded by env.ts |

### Development Dependencies

| Package | Purpose |
|---|---|
| `typescript@5.9.3` | Type checker / compiler |
| `ts-node@10.9.2` | Run TS without compile step (dev) |
| `ts-node-dev@2.0.0` | TS + watch + restart |
| `nodemon@3.1.14` | File watcher (used by `npm run dev`) |
| `jest@29.7.0` | Test runner |
| `ts-jest@29.4.9` | Jest TypeScript preset |
| `@types/jest@29.5.14` | Jest types |
| `@types/node@22.x` | Node.js types |
| `@types/bcryptjs`, `@types/jsonwebtoken` | Type stubs |
| `supertest@7.2.2` | HTTP assertions for integration tests |
| `@types/supertest@7.2.0` | Supertest types |
| `ndb@1.1.5` | Node debugger UI |

---

## Database Schema (Prisma)

**File:** `apps/backend/prisma/schema.prisma` (~444 lines, 20 models)
**Database:** PostgreSQL via Supabase
**Extensions:** `vector` (pgvector for embeddings), `uuid-ossp` (UUID gen)

### Phase 1 — Authentication

```prisma
model User {
  id                String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  email             String   @unique
  password_hash     String
  role              String   // pending | teacher | security | admin | parent
  requested_role    String?
  full_name         String?
  avatar_url        String?
  phone_number      String?
  fcm_token         String?  // for push notifications
  user_id_no        String?  @unique  // e.g., T-000001, S-000001, P-000001
  gender            String?
  is_active         Boolean  @default(true)
  is_suspended      Boolean  @default(false)
  created_at        DateTime @default(now()) @db.Timestamptz
  updated_at        DateTime @updatedAt @db.Timestamptz
  last_seen         DateTime? @db.Timestamptz

  // relations (~13 inverse relations: classes_taught, parent_links, gate_scans, ...)
  @@index([email])
  @@index([role])
  @@index([is_active])
  @@index([role, is_active])
}

model OtpVerification {
  id          String   @id @default(uuid())
  email       String
  otp_code    String   // 6-digit
  expires_at  DateTime @db.Timestamptz
  is_used     Boolean  @default(false)
  attempts    Int      @default(0)  // capped at 3
  created_at  DateTime @default(now()) @db.Timestamptz
  @@index([email])
}
```

### Phase 2 — Core (Profiles, Students, Classes)

```prisma
model SchoolGrade {
  id          String   @id @default(uuid())
  name        String   @unique         // "Grade 10"
  created_at  DateTime @default(now())
  classes     Class[]
}

model Class {
  id              String       @id @default(uuid())
  school_grade_id String
  name            String        // "10-A"
  teacher_id      String?      // FK to User
  subject         String?
  created_at      DateTime     @default(now())

  school_grade        SchoolGrade  @relation(fields: [school_grade_id], references: [id])
  teacher             User?         @relation("ClassTeacher", fields: [teacher_id], references: [id])
  students            Student[]
  announcements       Announcement[]
  attendanceSessions  AttendanceSession[]
  result_sets         ResultSet[]

  @@unique([school_grade_id, name])
  @@index([teacher_id])
}

model Student {
  id                 String   @id @default(uuid())
  full_name          String
  date_of_birth      DateTime? @db.Date
  photo_url          String?
  student_id_no      String   @unique  // shown on ID card
  qr_code            String   @unique  // payload for QR
  class_id           String?
  gender             String?
  parent_email       String?
  parent_mobile      String?
  parent_name        String?
  fcm_token          String?
  is_parent_linked   Boolean  @default(false)
  is_active          Boolean  @default(true)
  // ...
  class              Class?            @relation(fields: [class_id], references: [id])
  parents            ParentStudent[]
  gate_events        GateEvent[]
  attendance_records AttendanceRecord[]
  // ...
}

model ParentStudent {
  id           String   @id @default(uuid())
  parent_id    String   // FK User
  student_id   String   @unique  // 1 parent <-> 1 student
  relation     String?  // "mother", "father", "guardian"
  verified_via String?  // 'school_records' | 'admin_override'
  linked_at    DateTime @default(now())
}
```

### Phase 3 — Gate & Attendance

```prisma
model GateEvent {
  id              String   @id @default(uuid())
  student_id      String
  scanned_by_id   String?  // null if auto-checkout (cron)
  direction       String   // "IN" | "OUT"
  method          String   // "qr" | "manual"
  manual_reason   String?
  timestamp       DateTime @default(now()) @db.Timestamptz

  @@index([student_id])
  @@index([timestamp])
  @@index([student_id, timestamp])
}

model AttendanceRecord {
  id            String  @id @default(uuid())
  student_id    String
  date          DateTime @db.Date
  status        String   // "present" | "absent" | "late" | "excused"
  marked_by_id  String?
  session_id    String?
  remarks       String?

  @@unique([student_id, date])
}

model AttendanceSession {
  id          String   @id @default(uuid())
  class_id    String
  teacher_id  String
  date        DateTime @db.Date
  records     AttendanceRecord[]
  @@unique([class_id, date])
}
```

### Phase 4 — Announcements, Messages, Complaints

```prisma
model Announcement {
  id          String  @id @default(uuid())
  author_id   String
  title       String
  content     String   @db.Text
  image_url   String?
  scope       String   // "school_wide" | "class"
  target      String   // "all" | "parents_only" | "staff_only" | <class_id>
  class_id    String?
}

model Message {
  id            String  @id @default(uuid())
  sender_id     String
  receiver_id   String
  student_id    String? // contextual: "about which student?"
  content       String  @db.Text
  is_read       Boolean @default(false)
  created_at    DateTime @default(now())
}

model Complaint {
  id              String  @id @default(uuid())
  parent_id       String   // who filed
  student_id      String?
  category        String   // "academic" | "teacher_conduct" | "facility" | "administrative" | "suggestion" | "other"
  description     String   @db.Text
  status          String   // "pending" | "assigned" | "resolved" | "rejected"
  assigned_to_id  String?  // FK User
  assigned_at     DateTime?
  reply_note      String?  @db.Text
  resolved_by_id  String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### Phase 5 — Lost & Found

```prisma
model LostFoundItem {
  id            String   @id @default(uuid())
  posted_by     String   // staff who found
  item_name     String
  description   String?  @db.Text
  photo_url     String?
  found_at      String?
  found_date    DateTime?
  status        String   @default("unclaimed")  // "unclaimed" | "collected"
  collected_at  DateTime?
}

model LostFoundReport {
  id            String   @id @default(uuid())
  parent_id     String
  student_id    String
  item_name     String
  description   String?
  photo_url     String?
  date_lost     DateTime?
  status        String   @default("open")  // "open" | "recovered"
}
```

### Phase 6 — RAG (Policy Documents + Chatbot)

```prisma
model PolicyDocument {
  id            String   @id @default(uuid())
  uploaded_by   String
  file_name     String
  display_name  String
  storage_path  String   // Supabase Storage path
  file_hash     String?  @unique  // SHA-256, prevents duplicate uploads
  is_processed  Boolean  @default(false)
  chunk_count   Int      @default(0)
  chunks        DocumentChunk[]
}

model DocumentChunk {
  id           String   @id @default(uuid())
  document_id  String
  chunk_text   String   @db.Text
  embedding    Unsupported("vector(768)")?  // pgvector
  chunk_index  Int
  @@index([document_id])
}

model EvaluationLog {
  id                String   @id @default(uuid())
  query             String   @db.Text
  retrieved_chunks  Json     // [{id, score, text}]
  generated_answer  String   @db.Text
  confidence_score  Float?
  sources           Json     // [{document, page, snippet}]
  created_at        DateTime @default(now())
}
```

### Phase 7 — Results

```prisma
model Term {
  id          String  @id @default(uuid())
  label       String  // "Term 1 2026"
  created_by  String
  result_sets ResultSet[]
}

model ResultSet {
  id            String   @id @default(uuid())
  class_id      String
  teacher_id    String
  term_id       String
  status        String   @default("draft")  // "draft" | "published"
  published_at  DateTime?
  modules       ResultModule[]
  grades        StudentGrade[]
  @@unique([class_id, term_id])
}

model ResultModule {
  id             String  @id @default(uuid())
  result_set_id  String
  name           String  // "Mathematics", "Science"
  order_index    Int
  grades         StudentGrade[]
  @@unique([result_set_id, name])
}

model StudentGrade {
  id            String  @id @default(uuid())
  result_set_id String
  module_id     String
  student_id    String
  score         Float?  // 0-100
  @@unique([result_set_id, module_id, student_id])
}
```

---

## Authentication & Authorization

### Strategy
**JWT (7-day expiry)** + **bcrypt password hashing (10 rounds)** + **Role-Based Access Control (RBAC)**.

### Auth Endpoints (`/api/auth`)

| Method | Path | Rate Limit | Auth | Purpose |
|---|---|---|---|---|
| POST | `/register` | 5/min | — | Start registration (sends OTP) |
| POST | `/verify-otp` | 10/min | — | Verify OTP code |
| POST | `/complete-registration` | — | — | Parent 2FA + create user |
| POST | `/login` | 15/min | — | Email + password → JWT |
| POST | `/resend-otp` | 3/min | — | Resend OTP (60s cooldown) |
| POST | `/forgot-password` | 5/min | — | Send password-reset OTP |
| POST | `/reset-password` | 5/min | — | Reset with OTP + new pass |
| PUT | `/change-password` | — | ✓ | Authenticated password change |
| PUT | `/link-child` | — | — | Link parent → student (OTP gated) |
| POST | `/refresh` | — | ✓ | New JWT for existing session |
| POST | `/logout` | — | ✓ | Clear cookie |
| POST | `/logout-all` | — | ✓ | Invalidate all sessions |
| PUT | `/fcm-token` | — | ✓ | Update Firebase token |
| GET | `/me` | — | ✓ | Current user + classes_taught |
| GET | `/parent-profile` | — | ✓ Parent | Parent + child + teacher details |

### Registration Flow — Non-Parent (Teacher/Security)

```
1. POST /api/auth/register
   { email, password, full_name, phone_number, role:"teacher" }
   → Generate OTP, store pending registration in Redis + in-memory Map (10 min TTL)
   → sendOtpEmail(email, otp)
   → 200 { message: "OTP sent" }

2. POST /api/auth/verify-otp
   { email, otp_code }
   → Lookup OtpVerification (not expired, not used, < 3 attempts)
   → Create User { role:"pending", requested_role:"teacher" }
   → Mark OTP as used
   → Generate JWT, set httpOnly cookie + return token
   → 200 { token, user, requires_profile_setup: false }

3. Admin sees in /admin/overview/pending-requests
   → PUT /api/users/:id/promote → role:"teacher", is_active:true
   → sendApprovalEmail(email, fullName, "teacher")
```

### Registration Flow — Parent (2FA)

```
1. POST /api/auth/register
   { email, password, full_name, student_id_no }
   → Validate student exists, parent_email matches, not already linked
   → Store pending registration with student snapshot
   → sendOtpEmail
   → 200 { message: "OTP sent" }

2. POST /api/auth/verify-otp
   { email, otp_code }
   → Mark OTP verified in Redis (DO NOT create user yet)
   → 200 { student: {...}, requires_profile_setup: true }

3. POST /api/auth/complete-registration  ← 2nd factor: identity proof
   { email, grade, class, admission_year, gender }
   → Validate answers match school records for the student
   → BEGIN TRANSACTION
       INSERT User (role:"parent", user_id_no:"P-000001")
       INSERT ParentStudent (parent_id, student_id, verified_via:"school_records")
   → COMMIT
   → Generate JWT
   → 200 { token, user }
```

### JWT Claims

```typescript
{
  userId: string;   // User.id
  role:   string;   // "admin" | "teacher" | "security" | "parent" | "pending"
  email:  string;
}
```

**Secret:** `JWT_SECRET` env var (min 32 chars validated by Zod)
**Expiry:** `7d`
**Cookie:** `auth_token`, HttpOnly, Secure (prod), SameSite=Lax, maxAge 7d

### Middleware Application

```typescript
// Example: gate routes
fastify.post('/scan',
  {
    schema: { body: scanSchema },
    preHandler: [
      authenticate,                               // verify JWT, attach user to request
      rbac(['admin', 'teacher', 'security'])      // 403 if role not allowed
    ]
  },
  scanController
);
```

---

## Middleware Stack

### 1. `authenticate.ts`

```typescript
// File: src/common/middleware/authenticate.ts
async function authenticate(request, reply) {
  // 1. Extract token: Authorization "Bearer ..." OR cookie auth_token
  // 2. verifyToken(token) → claims { userId, role, email }
  // 3. Prisma.user.findUnique({ where:{id:userId} }) with retry (2x, 500ms backoff)
  // 4. If user is_active=false, is_suspended=true, or role="pending" → 401/403
  // 5. Set Redis online status: SETEX online:<userId> 35 "1"
  // 6. request.user = { userId, role, email }
}
```

**Returns 503** if database is unavailable after retries.

### 2. `rbac.ts`

```typescript
// File: src/common/middleware/rbac.ts
function rbac(allowed: string[]) {
  return async (request, reply) => {
    if (!allowed.includes(request.user.role)) {
      return reply.status(403).send(errorResponse('Forbidden'));
    }
  };
}
```

### 3. `errorHandler.ts`

```typescript
// Catches:
ZodError       → 400 { success:false, message:"Validation failed", error: issues[] }
FastifyError   → uses error.statusCode + error.message
Other          → 500 (dev includes stack trace)
```

### 4. Global Plugins (in `app.ts`)

| Plugin | Config |
|---|---|
| `@fastify/cookie` | Default |
| `@fastify/multipart` | `limits: { fileSize: 5_242_880 }` (5 MB) |
| `@fastify/cors` | `origin: [WEB_URL, FLUTTER_ORIGIN, localhost:3000, localhost:3001]`, `credentials: true` |
| `@fastify/helmet` | `crossOriginResourcePolicy: { policy: 'cross-origin' }`, `contentSecurityPolicy: false` |
| `@fastify/rate-limit` | `max: 100`, `timeWindow: '1 minute'` |

---

## Complete API Reference

### Health
- `GET /health` → `{ ok: true }`

### Users (`/api/users`)
| Method | Path | Roles |
|---|---|---|
| GET | `/me` | All |
| PUT | `/me` | All — update full_name, avatar_url, phone |
| DELETE | `/me` | All — self-delete |
| PUT | `/fcm-token` | All — update push token |
| GET | `/pending` | admin |
| GET | `/all` | admin |
| GET | `/teachers` | admin |
| PUT | `/:id/promote` | admin — pending → role |
| PUT | `/:id/suspend` | admin |
| PUT | `/:id/unsuspend` | admin |
| DELETE | `/:id` | admin |

### School (`/api/school`)
| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/grades` | admin | Create grade |
| GET | `/grades` | admin, teacher | List grades |
| DELETE | `/grades/:id` | admin | Delete grade |
| POST | `/classes` | admin | Create class |
| GET | `/classes` | admin | List classes |
| GET | `/grades-with-classes` | admin | Tree view |
| PATCH | `/classes/:id` | admin | Edit class |
| DELETE | `/classes/:id` | admin | Delete class |
| GET | `/classes/:id/students` | admin, teacher | Students in class |
| GET | `/students/next-id` | admin | Generate next student ID |
| POST | `/students/photo` | admin | Upload photo (multipart) |
| POST | `/students` | admin | Create student |
| GET | `/students` | admin, teacher | List/filter students |
| PATCH | `/students/:id` | admin | Edit student |
| DELETE | `/students/:id` | admin | Delete student |
| GET | `/overview/stats` | admin, teacher | Dashboard stats |
| GET | `/overview/recent-activity` | admin | Activity feed |

### Gate (`/api/gate`)
| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/scan` | admin, teacher, security | Creates GateEvent + FCM to parent |
| GET | `/student` | admin, security, teacher | Lookup by student_id_no |
| GET | `/search` | admin, security, teacher | Autocomplete |
| GET | `/stats` | admin, security, teacher | "Checked in today" |
| GET | `/stats/timeseries` | admin | range=today\|week\|30days |
| GET | `/events` | admin, security, teacher | Recent scans |
| GET | `/my-child-events` | parent | Child's history + current IN/OUT status |

### Attendance (`/api/attendance`)
| Method | Path | Roles |
|---|---|---|
| POST | `/mark` | admin, teacher |
| GET | `/` | admin, teacher, security |
| POST | `/session` | admin, teacher |
| GET | `/session` | admin, teacher |
| POST | `/session/submit` | admin, teacher — batch save |
| GET | `/session/dates` | admin, teacher — for calendar |
| GET | `/summary` | admin, teacher |
| GET | `/my-child` | parent |

### Announcements (`/api/announcements`)
| Method | Path | Roles |
|---|---|---|
| POST | `/` | admin, teacher |
| GET | `/` | All (filtered by scope/target) |
| DELETE | `/:id` | admin or author |

### Messages (`/api/messages`)
| Method | Path |
|---|---|
| GET | `/inbox` |
| GET | `/contacts` |
| GET | `/thread/:userId` |
| POST | `/send` |
| PUT | `/:id/read` |
| POST | `/ai-draft` |
| DELETE | `/:id` |

### Complaints (`/api/complaints`)
| Method | Path | Notes |
|---|---|---|
| POST | `/` | Parent files |
| GET | `/my` | Parent's own |
| GET | `/all` | Admin |
| GET | `/:id` | Admin / Parent / Assignee |
| PUT | `/:id/assign` | Admin → staff |
| PUT | `/:id/status` | Status flow: pending → assigned → resolved |

### Lost & Found (`/api/lost-found`)
| Method | Path | Notes |
|---|---|---|
| POST | `/items` | Staff posts found item |
| GET | `/items` | Browse unclaimed |
| PUT | `/items/:id/collected` | Mark collected |
| DELETE | `/items/:id` | Remove |
| POST | `/reports` | Parent reports lost |
| GET | `/reports/my` | Parent's reports |
| PUT | `/reports/:id/recovered` | Mark recovered |
| GET | `/reports` | Staff view all |

### Results (`/api/results`)
| Method | Path | Roles |
|---|---|---|
| GET | `/terms` | teacher, admin |
| POST | `/terms` | teacher, admin |
| PATCH | `/terms/:termId` | teacher, admin |
| DELETE | `/terms/:termId` | teacher, admin |
| GET | `/class/:classId?term_id=...` | teacher, admin — auto-creates if missing |
| PATCH | `/:resultSetId` | teacher — save modules + grades |
| POST | `/:resultSetId/publish` | teacher |
| POST | `/:resultSetId/unpublish` | teacher |
| GET | `/my-child` | parent |

### RAG (`/api/rag`)
| Method | Path | Roles | Rate |
|---|---|---|---|
| POST | `/documents` | admin | — |
| GET | `/documents` | admin | — |
| DELETE | `/documents/:id` | admin | — |
| POST | `/query` | admin, teacher, parent | 10/min |
| GET | `/eval/report` | admin | — |

---

## The RAG Pipeline (How the Chatbot Works)

### Ingestion (admin uploads policy PDF)

```
POST /api/rag/documents  (multipart, file=<PDF>)
  ├─ Save to Supabase Storage → return storage_path
  ├─ Compute SHA-256 hash → reject if already exists (file_hash UNIQUE)
  ├─ INSERT PolicyDocument (is_processed=false)
  ├─ Background: pdf-parse extract text
  ├─ chunker.service.ts split into ~500-token chunks (recursive_character)
  ├─ embedder.service.ts: Gemini "gemini-embedding-2" in batches of 100
  │    → 3072-dim → TRUNCATE to first 768 dims (pgvector index limit)
  ├─ INSERT DocumentChunk rows with embedding vector(768)
  └─ UPDATE PolicyDocument SET is_processed=true, chunk_count=N
```

### Query (user asks question)

```
POST /api/rag/query { question, top_k:5 }
  ├─ Rate limit check (10/min)
  ├─ Cache lookup: Redis key sha256(question.lower)
  │    → IF hit: return cached { answer, sources, confidence }
  ├─ embedder.embedQuery(question) → 768-dim vector
  ├─ retrieval.service.ts:
  │    1. pgvector: SELECT ... ORDER BY embedding <-> $query LIMIT k*2
  │    2. tsvector BM25: full-text search on chunk_text
  │    3. Merge + dedupe by chunk_id
  │    4. Re-rank: boost chunks with high term frequency of question words
  │    5. Return top_k (default 5)
  ├─ generation.service.ts:
  │    Build prompt:
  │      "You are a school policy assistant. Use ONLY the context below.
  │       If the answer is not in context, say 'I don't know'."
  │      + retrieved chunks
  │    Call Gemini "gemini-2.5-flash-lite"
  │    Parse answer + extract source citations
  ├─ eval.service.ts: INSERT EvaluationLog (query, chunks, answer, confidence)
  ├─ Cache for 1 hour
  └─ 200 { answer, sources:[{document, snippet, score}], confidence }
```

### Why 768 dims, not 3072?

PgVector's HNSW/IVFFlat indexes have a **2000-dim cap**. Gemini's `gemini-embedding-2` returns 3072 dims with **Matryoshka representation learning**, meaning the first N dims contain the most important information. Truncating to 768 preserves ~95% of semantic quality while making vector indexing feasible.

---

## Scheduled Jobs

### Gate Auto-Checkout — `gate.scheduler.ts`

```typescript
// Runs daily at 18:00 (6 PM) school time
cron.schedule('0 18 * * *', async () => {
  // Find all students with last GateEvent direction="IN" today
  // INSERT GateEvent { student_id, direction:"OUT", method:"manual",
  //                    manual_reason:"Auto-checkout at end of day", scanned_by_id:null }
  // FCM notify parents: "Day ended — please verify your child is home"
});
```

---

## Caching Strategy (Redis)

| Key Pattern | TTL | Purpose |
|---|---|---|
| `rag:answer:<sha256(question)>` | 3600s (1 hr) | RAG answer cache |
| `pending_reg:<email>` | ~600s | Pending registration during OTP window |
| `online:<userId>` | 35s | Refreshed on every authenticated request — used to show "online now" |
| `gate:stats:<scope>` | 60s | Dashboard stats; invalidated on scan |

**Graceful degradation:** If `REDIS_URL` is not set, all `getCache`/`setCache` calls return null/no-op. App keeps working without cache.

---

## External Integrations

| Service | Purpose | File |
|---|---|---|
| **Gemini API** | `gemini-embedding-2` (embeddings) + `gemini-2.5-flash-lite` (LLM) | `rag/services/embedder.service.ts`, `generation.service.ts` |
| **Firebase Admin** | FCM push notifications: `sendFcmNotification`, `sendMulticastFcmNotification` | `config/firebase.ts` |
| **Resend** | Transactional email; from `noreply@mg.methum.space` | `utils/email.ts` |
| **Supabase JS** | Storage (student photos, PDFs) via admin client | `config/supabase.ts` |
| **Anthropic SDK** | Imported, reserved for future use (message AI draft fallback) | — |

---

## Testing Strategy

**Framework:** Jest 29 + ts-jest preset + supertest

### Layout

```
tests/
├── setup.ts                    ← Global jest.mock() for all externals
├── unit/
│   ├── hash.test.ts            ← bcrypt round-trip, compare wrong password
│   ├── jwt.test.ts             ← sign + verify, expired tokens, tampered
│   ├── otp.test.ts             ← length, randomness
│   └── schemas.test.ts         ← Zod schema validation cases
└── integration/
    ├── auth.test.ts            ← POST /api/auth/register edge cases
    ├── attendance.test.ts      ← Session create + batch submit
    └── gate.test.ts            ← Scan flow, parent notification mocking
```

### Mocks (`tests/setup.ts`)

```typescript
jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    attendanceSession: { upsert: jest.fn() },
    attendanceRecord: { findMany: jest.fn() },
    gateLog: { create: jest.fn() }
  }
}));

jest.mock('../src/config/firebase', () => ({
  sendFcmNotification: jest.fn().mockResolvedValue(true),
  sendMulticastFcmNotification: jest.fn().mockResolvedValue({ successCount: 1 })
}));

jest.mock('../src/utils/email', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(true),
  sendApprovalEmail: jest.fn().mockResolvedValue(true)
}));
```

### Config (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/common/utils/**/*.ts',
    'src/modules/auth/**/*.ts'
  ],
  coverageThreshold: { global: { lines: 70 } }
};
```

### Running

```bash
npm run test              # all
npm run test:unit         # tests/unit only
npm run test:integration  # tests/integration only
npm run test:coverage     # generate coverage/ folder
npm run test:watch        # watch mode
```

---

## Environment Variables

Defined in `.env.example` and validated by Zod in `src/config/env.ts` on startup.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (5000) | HTTP port |
| `NODE_ENV` | No | development \| production \| test |
| `DATABASE_URL` | **Yes** | Pooled Postgres connection (PgBouncer) |
| `DIRECT_URL` | **Yes** | Direct Postgres for Prisma migrations |
| `REDIS_URL` | No | Redis connection; disables cache if absent |
| `REDIS_DEFAULT_TTL` | No (120) | Default cache TTL seconds |
| `JWT_SECRET` | **Yes** (≥32 chars) | JWT signing |
| `SUPABASE_URL` | **Yes** | Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | Public key |
| `SUPABASE_SERVICE_KEY` | **Yes** | Service role (storage admin) |
| `RESEND_API_KEY` | **Yes** | Email transactional |
| `RESEND_FROM_EMAIL` | No | Default `noreply@mg.methum.space` |
| `GEMINI_API_KEY` | **Yes** | Embeddings + LLM |
| `ANTHROPIC_API_KEY` | No | Future Claude integration |
| `OPENAI_API_KEY` | No | Optional fallback |
| `FIREBASE_PROJECT_ID` | **Yes** | FCM |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Yes** | Stringified service account JSON |
| `WEB_URL` | **Yes** | CORS allow origin |
| `FLUTTER_ORIGIN` | **Yes** | CORS allow origin |

---

## NPM Scripts

```json
{
  "dev":                       "nodemon",
  "build":                     "tsc -p tsconfig.build.json",
  "start":                     "node dist/server.js",
  "lint":                      "echo 'No linting yet'",
  "test":                      "jest",
  "test:unit":                 "jest tests/unit",
  "test:integration":          "jest tests/integration",
  "test:coverage":             "jest --coverage",
  "test:watch":                "jest --watch",
  "prisma:generate":           "prisma generate",
  "prisma:migrate:dev":        "prisma migrate dev",
  "prisma:migrate:deploy":     "prisma migrate deploy",
  "prisma:push":               "prisma db push",
  "prisma:studio":             "prisma studio",
  "postinstall":               "prisma generate"
}
```

---

## Error Handling & Response Format

### Success Envelope

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "user": { ... } }
}
```

### Error Envelope

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error":   "Specific detail (dev only stack trace)"
}
```

### HTTP Status Codes

| Code | Used For |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation failure (Zod) |
| 401 | Missing/invalid token |
| 403 | Authenticated but role denied (RBAC) |
| 404 | Not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limit exceeded |
| 500 | Internal error |
| 503 | Database temporarily unreachable |

---

**Next:** [03-FRONTEND-WEB-APP.md](03-FRONTEND-WEB-APP.md) — Next.js 16 admin/teacher/security dashboard.
