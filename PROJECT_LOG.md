# Universe System — Project Log

A running log of what this project is, where it came from, and every significant setup step taken. Updated as major changes are made.

---

## Project Overview

**Name:** School Connect (formerly "Universe")
**Purpose:** AI-powered school-to-parent communication platform for Sri Lankan schools.
**Problem solved:** Students in Sri Lanka are prohibited from using mobile phones on school premises. This platform enables all parent-teacher communication (attendance, gate entry/exit, messaging, grades, complaints, AI policy bot) through parent accounts — no student accounts exist.

**Four user roles:**
- `admin` — web only; created via DB seed; approves and promotes all other accounts
- `teacher` — web only; self-register → pending → admin promotes and assigns a class
- `security` — web only; self-register → pending → admin promotes; locked to `/gate` route
- `parent` — mobile (Flutter) only; self-register + Student ID + email OTP to link child; multi-child support

**Tech stack:**
| Layer | Choice |
|---|---|
| Web frontend | Next.js 14 + shadcn/ui + Tailwind CSS (TypeScript) |
| Mobile frontend | Flutter + MVVM + Provider |
| Backend API | Node.js + Fastify (TypeScript) |
| Database | Supabase (PostgreSQL + pgvector + Realtime + Storage) |
| ORM | Prisma |
| Auth | Custom JWT (7-day, silent refresh) + bcrypt |
| Push notifications | Firebase FCM (background) + Supabase Realtime (foreground) |
| AI / RAG | OpenAI gpt-4o-mini + text-embedding-3-small + pgvector |
| Deployment | Vercel (frontend) · Railway (backend) · Supabase Cloud |

Full design docs are in the [`Doc/`](Doc/) folder (00 through 10).

---

## Origin: Polyrepo Era

The project started as two separate Git repositories:

```
UniVerse-Platform/    (Next.js frontend + Fastify backend)
UniVerse-App/         (Flutter mobile app)
```

Both located at `C:\Users\Methum-PC\OneDrive\Desktop\Universe\`

**UniVerse-Platform branches:** `dev`, `frontend/admin`, `frontend/auth`, `frontend/security`, `frontend/teacher`, `release/development`
**UniVerse-App branches:** `dev`, `release/development`

---

## Monorepo Migration (2026-04)

Both repos were consolidated into a single `Universe-System` monorepo while preserving all 72 commits of history from both repos.

**GitHub repo:** `https://github.com/Methexx/Universe-System`
**Default branch:** `release/development`

### Migration steps

1. Created new empty repo at `C:\Users\Methum-PC\OneDrive\Desktop\Finalized\Universe-System` with an initial commit.
2. Imported `UniVerse-Platform` history via `git merge --allow-unrelated-histories platform/dev`.
   - Resolved single README.md conflict (kept monorepo README).
3. Moved frontend + backend into `apps/` subdirectories:
   ```
   git mv frontend apps/frontend
   git mv backend apps/backend
   ```
4. Imported Flutter app history via `git read-tree --prefix=apps/flutter/ -u flutter/dev`.
5. Removed temporary remotes, added `origin` pointing to GitHub.
6. Pushed all five `frontend/*` branches from UniVerse-Platform to GitHub.

**Result:**
```
Universe-System/
├── apps/
│   ├── backend/    ← Fastify API (TypeScript + Prisma)
│   ├── frontend/   ← Next.js 14 web dashboard
│   └── flutter/    ← Flutter mobile app (parent-facing)
├── Doc/            ← Full design documentation (10 files)
└── ...
```

---

## Post-Migration Fixes (2026-04-24)

### Fix 1 — Workspace paths in `package.json`

**Problem:** Root `package.json` still referenced `frontend/` and `backend/` (old paths) in `workspaces`, `scripts`, and `lint-staged`. All root-level npm commands failed with ENOENT.

**Files changed:** [`package.json`](package.json)

**Changes:**
- `name`: `universe-platform` → `universe-system`
- `workspaces`: `["frontend", "backend"]` → `["apps/frontend", "apps/backend"]`
- All `--prefix frontend` → `--prefix apps/frontend` (and same for backend)
- `lint-staged` globs: `frontend/**` → `apps/frontend/**`, `backend/**` → `apps/backend/**`
- Added `.ts` to backend lint-staged glob (backend is TypeScript; the old glob only matched `.js/.mjs/.cjs`)

**Also fixed:** `.gitignore` stale lockfile paths (`frontend/package-lock.json` → `apps/frontend/package-lock.json`)

### Fix 2 — Docker Compose paths

**Problem:** Both `docker-compose.dev.yml` and `docker-compose.yml` referenced `./backend` and `./frontend` in `build.context`, `volumes`, and `env_file`. `docker compose up` would fail with build-path errors.

**Files changed:** [`docker-compose.dev.yml`](docker-compose.dev.yml), [`docker-compose.yml`](docker-compose.yml)

**Changes:** All `./backend` → `./apps/backend`, all `./frontend` → `./apps/frontend`.

### Fix 3 — Separate dev vs prod Docker Compose

**Problem:** Both compose files were byte-identical — no distinction between dev and production.

**Files changed:** [`docker-compose.yml`](docker-compose.yml)

**`docker-compose.dev.yml`** (dev) keeps:
- Source code bind mounts (`./apps/backend:/app`)
- `Dockerfile.dev`
- No `restart` policy

**`docker-compose.yml`** (prod) now has:
- No bind mounts (image is fully built, not live-reload)
- `restart: unless-stopped` on all services
- `NODE_ENV=production` injected

> **TODO:** Production Dockerfiles (`apps/backend/Dockerfile` and `apps/frontend/Dockerfile`) don't exist yet. Both prod compose services temporarily reference `Dockerfile.dev` until they're created (multi-stage builds for production).

### Fix 4 — Jest missing in backend

**Problem:** `apps/backend/package.json` declared `"test": "jest"` but `jest` was not in `devDependencies`. `npm run backend:test` failed with `'jest' is not recognized`.

**Files changed:** [`apps/backend/package.json`](apps/backend/package.json), added [`apps/backend/jest.config.js`](apps/backend/jest.config.js)

**Changes:**
- Added `jest@^29.7.0` and `@types/jest@^29.5.14` to `devDependencies`
- Added `jest.config.js` with `passWithNoTests: true` and testMatch restricted to `*.test.js / *.spec.js / *.test.ts / *.spec.ts`
- Added `"test:integration"` script for running the existing integration scripts against a live server

> **Note:** The existing files in `apps/backend/tests/` (`test_gate.js`, `test_attendance.js`, etc.) are **Node.js integration scripts** that call a running API with `fetch()`. They are NOT Jest test suites (no `describe`/`test`/`it` blocks). Run them individually with `node tests/<name>.js` while the backend server is running. The `test` script (Jest) is for future unit tests.

### Fix 5 — .env files

**Problem:** `.env` files are gitignored and were not migrated with the repo. `docker compose up` failed on missing env files.

**Files copied:**
- `UniVerse-Platform/backend/.env` → `apps/backend/.env`
- `UniVerse-Platform/frontend/.env.local` → `apps/frontend/.env.local`

> **Important:** These files contain placeholder values for secrets (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `OPENAI_API_KEY`, `FIREBASE_PROJECT_ID`). Fill in real values before running the backend. The `DATABASE_URL` points to the Supabase project `universe-platform` — update if the project is re-created or renamed.

---

## Backend Audit (2026-04-24)

Full read of `apps/backend/src/` and `apps/backend/prisma/` revealed the backend is significantly further along than expected.

### Already fully implemented

| Area | Files |
|---|---|
| JWT auth (sign/verify, 7-day expiry, Bearer extraction) | `src/common/utils/jwt.ts` |
| RBAC middleware (`authorize(roles[])` factory) | `src/common/middleware/rbac.ts` |
| JWT authenticate middleware | `src/common/middleware/authenticate.ts` |
| bcrypt password hashing (10 rounds) | `src/common/utils/hash.ts` |
| OTP generator + DB tracking | `src/common/utils/otp.ts` |
| Redis cache with TTL + pattern invalidation | `src/common/utils/cache.ts`, `src/config/redis.ts` |
| Standardized response format | `src/common/utils/response.ts` |
| Global Zod + Fastify error handler | `src/common/middleware/errorHandler.ts` |
| Zod-validated environment config | `src/config/env.ts` |
| Prisma singleton | `src/config/prisma.ts` |
| Supabase public + admin clients | `src/config/supabase.ts` |
| Fastify server (CORS, Helmet, rate-limit 100/min) | `src/app.ts`, `src/server.ts` |
| **Prisma schema** — all models: User, OtpVerification, SchoolGrade, Class, Student, ParentStudent, GateEvent, AttendanceRecord, Announcement, Message, Complaint | `prisma/schema.prisma` |
| **Auth module** — register, verify-OTP, login, forgot/reset password, refresh, logout, link-child, FCM token | `src/modules/auth/` |
| **Admin seed script** — creates `admin@school.lk` | `src/scripts/seedAdmin.ts` |

### Scaffolded (routes + controller + schema wired, service logic partial)

| Module | What's there | What's missing |
|---|---|---|
| `users` | Get/update profile, promote user | — |
| `school` | Grade, class, student CRUD with cache | — |
| `gate` | QR scan IN/OUT recording | Realtime emit, photo upload |
| `attendance` | Mark status, fetch records with cache | Excuse notes, session management |
| `announcements` | Create + fetch with scope filter | FCM push on create |
| `messages` | Inbox, send, AI draft endpoint | OpenAI integration in AI draft |
| `complaints` | Create, assign, update status | — |

### Not yet implemented (W3–W5 work)

- RAG module (policy document upload, pgvector embeddings, Q&A)
- Grades module (modules, scores, draft/publish)
- Lost & Found module
- Notifications module
- Supabase Realtime emits on gate/attendance events
- FCM push trigger logic

### Integration test scripts (NOT Jest)

Files in `apps/backend/tests/` (`test_gate.js`, `test_attendance.js`, `test_complaints.js`, `test_messages.js`, `test_school.js`, `test_integration.js`) are plain Node.js scripts that call a live running API via `fetch()`. Run with `node tests/<name>.js` while `npm run backend:dev` is running.

---

## .env Audit (2026-04-24)

### `apps/backend/.env` — current state vs requirements

| Variable | Required by `env.ts` | Status |
|---|---|---|
| `PORT` | default 5000 | ✅ set |
| `DATABASE_URL` | required | ✅ real value (IPv4 non-pooler) |
| `DIRECT_URL` | required by Prisma | ✅ real value (same as DATABASE_URL) |
| `REDIS_URL` | optional | ✅ commented out — no local Redis; cache gracefully disabled |
| `REDIS_DEFAULT_TTL` | default 120 | ✅ set |
| `SUPABASE_URL` | required | ✅ real URL |
| `SUPABASE_ANON_KEY` | required | ✅ real publishable key |
| `SUPABASE_SERVICE_KEY` | required | ✅ real secret key |
| `JWT_SECRET` | required, min 32 chars | ✅ set |
| `OPENAI_API_KEY` | optional | ⚠️ placeholder — needed for RAG/AI draft features |
| `FIREBASE_PROJECT_ID` | optional | ⚠️ placeholder — needed for FCM push |
| `WEB_URL` | default `http://localhost:3000` | ✅ set |
| `FLUTTER_ORIGIN` | default `http://localhost:3001` | ✅ set |
| `NODE_ENV` | default `development` | ✅ set |

**Supabase project ref:** `aabjnadvxiexodbvmzuc`
**Key format:** Supabase new-style keys (`sb_publishable_*` / `sb_secret_*`) — compatible with supabase-js v2.

### To run the backend locally

```bash
cd apps/backend
npm run dev
# → Fastify server on http://localhost:5000
```

---

## Auth Setup (2026-04-24)

### What was done

1. **Filled `.env`** with real Supabase API keys (publishable + secret) and a generated `JWT_SECRET`.
2. **Verified DB schema** — ran `npx prisma db push`. Output: _"The database is already in sync with the Prisma schema."_ All 12 tables already existed in Supabase from the previous UniVerse-Platform project. No migration needed.
3. **Verified admin seed** — ran `npx ts-node src/scripts/seedAdmin.ts`. Output: _"Admin account already exists! Skipping seed."_ `admin@school.lk` was already seeded.
4. **Commented out `REDIS_URL`** — Redis isn't running locally; the Redis client was spamming retry errors. With `REDIS_URL` unset, the cache module gracefully disables itself (by design in `src/config/redis.ts`).
5. **Smoke-tested login** — confirmed `POST /api/auth/login` returns `200` with a valid JWT:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "eyJhbGci...",
       "role": "admin",
       "user": { "id": "a52c05cc-...", "email": "admin@school.lk", "role": "admin" }
     }
   }
   ```

### Current auth state

- ✅ Server starts cleanly (`npm run backend:dev`)
- ✅ JWT login works — 7-day tokens
- ✅ Admin account live: `admin@school.lk` / `adminpassword`
- ✅ All 12 DB tables confirmed in Supabase
- ✅ RBAC middleware ready (`authorize(['admin'])`, etc.)
- ⚠️ OTP delivery is `console.log` only — no email/SMS integration yet (fine for dev)
- ⚠️ Redis disabled locally — enable by un-commenting `REDIS_URL` when Redis is available

---

## Open TODOs (updated 2026-04-24)

| # | Item | Priority |
|---|---|---|
| 1 | Implement W3–W5 modules: RAG, Grades, Lost & Found, Notifications, Realtime, FCM | Next sprint |
| 2 | OTP email delivery — integrate SMTP or Supabase email for real OTP sending | High |
| 3 | Create `apps/backend/Dockerfile` (multi-stage production build) | Medium |
| 4 | Create `apps/frontend/Dockerfile` (multi-stage Next.js production build) | Medium |
| 5 | Enable Redis locally (or via Docker) and un-comment `REDIS_URL` in `.env` | Low |
| 6 | Write Jest unit tests for backend services | Low |

---

## Branches on GitHub

| Branch | Origin |
|---|---|
| `release/development` | Monorepo base (default) |
| `dev` | From UniVerse-Platform |
| `frontend/admin` | From UniVerse-Platform |
| `frontend/auth` | From UniVerse-Platform |
| `frontend/security` | From UniVerse-Platform |
| `frontend/teacher` | From UniVerse-Platform |
