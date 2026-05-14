# Universe System — Project Overview & Architecture

> **Document 1 of 5** — Complete project overview, monorepo structure, tech stack, features, and high-level architecture.

---

## Table of Contents

1. [What is Universe System?](#what-is-universe-system)
2. [Monorepo Structure](#monorepo-structure)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Complete Feature List](#complete-feature-list)
5. [Tech Stack Summary](#tech-stack-summary)
6. [System Architecture Diagram](#system-architecture-diagram)
7. [Data Flow Across Apps](#data-flow-across-apps)
8. [Module-by-Module Working Style](#module-by-module-working-style)
9. [Existing Documentation Map](#existing-documentation-map)

---

## What is Universe System?

**Universe System** (also referred to as *School Connect*) is a **full-stack, multi-platform School Management Information System** that connects four user types — **Administrators, Teachers, Security Officers, and Parents** — through a single backend serving both a web dashboard (Next.js) and a parent-facing mobile app (Flutter).

The platform digitizes the day-to-day life of a school — from gate entry/exit tracking via QR scans, to attendance, term results, complaints, lost & found, push notifications, AI-powered policy chatbot, and a real-time messaging system between teachers and parents.

### Core Capabilities

| Capability | Description |
|---|---|
| **Gate Tracking** | QR-based check-in/out at the school gate with real-time parent notifications |
| **Attendance** | Daily attendance sessions per class with parent visibility |
| **Results & Grades** | Teachers publish term results; parents view child's grades |
| **Messaging** | Direct messages between teachers and parents with AI draft suggestion |
| **Announcements** | School-wide or class-scoped notices |
| **Complaints** | Parent-filed complaints triaged to admin, then assigned to staff |
| **Lost & Found** | Parents report lost items; staff post found items |
| **RAG Chatbot** | AI-powered Q&A over school policy PDFs (Gemini-embedded vectors) |
| **Push Notifications** | Firebase FCM alerts to parent's phone for gate scans, messages, etc. |
| **Role-Based Dashboards** | Distinct UIs for Admin / Teacher / Security / Parent |

---

## Monorepo Structure

The repository is an **npm workspace monorepo** with three application workspaces:

```
Universe-System/                          ← Repository root
│
├── apps/
│   ├── backend/                          ← Fastify + Prisma REST API (port 5000)
│   │   ├── src/
│   │   │   ├── server.ts                 ← App entry: startup, Redis, Firebase init
│   │   │   ├── app.ts                    ← Fastify config: plugins, routes, errors
│   │   │   ├── config/                   ← env, prisma, redis, supabase, firebase
│   │   │   ├── common/                   ← middleware, utils (jwt, hash, otp, email)
│   │   │   ├── modules/                  ← 11 feature modules (auth/users/gate/...)
│   │   │   └── scripts/seedAdmin.ts      ← DB seeding
│   │   ├── prisma/
│   │   │   ├── schema.prisma             ← 20 models, pgvector + uuid-ossp extensions
│   │   │   └── migrations/               ← Generated migration history
│   │   ├── tests/                        ← Jest unit + integration tests
│   │   ├── Dockerfile.dev
│   │   ├── jest.config.js
│   │   └── package.json
│   │
│   ├── frontend/                         ← Next.js 16 + React 19 web dashboard (port 3000)
│   │   ├── src/
│   │   │   ├── app/                      ← App Router: admin/, teacher/, security/, auth pages
│   │   │   ├── features/                 ← 10 feature modules (auth/messages/gate/rag/...)
│   │   │   ├── shared/                   ← components, hooks, lib
│   │   │   └── core/                     ← config, constants
│   │   ├── public/                       ← Static assets
│   │   ├── Dockerfile.dev
│   │   ├── eslint.config.mjs
│   │   └── package.json
│   │
│   └── flutter/                          ← Flutter parent mobile app (Android/iOS)
│       ├── lib/
│       │   ├── main.dart                 ← Entry: Firebase, ServiceLocator setup
│       │   ├── app.dart                  ← MultiProvider + MaterialApp.router
│       │   ├── core/                     ← api, di, navigation, services, storage
│       │   ├── features/                 ← 15 feature modules (auth/dashboard/results/...)
│       │   └── shared/                   ← themes, reusable widgets
│       ├── android/                      ← Native Android project
│       ├── ios/                          ← Native iOS project
│       ├── test/                         ← Widget tests
│       └── pubspec.yaml
│
├── Doc/                                  ← Existing detailed reference docs (10 files)
├── Documentation/                        ← THIS folder (5 comprehensive guides)
│
├── .github/workflows/                    ← CI/CD (ci.yml, flutter-release.yml)
├── .husky/                               ← Git hooks (pre-commit, pre-push, commit-msg)
├── .vscode/, .claude/, .mcp.json         ← IDE & AI configs
│
├── docker-compose.yml                    ← Prod stack (redis, backend, frontend)
├── docker-compose.dev.yml                ← Dev stack with hot reload volumes
├── package.json                          ← Root workspace scripts
├── package-lock.json                     ← Single root lockfile
├── commitlint.config.js                  ← Conventional Commits enforcement
├── .prettierrc                           ← Code formatting rules
├── .eslintignore, .gitignore, .dockerignore
└── vercel.json                           ← Next.js Vercel deployment config
```

### Workspace Linking

`package.json` (root) declares:

```json
{
  "workspaces": ["apps/frontend", "apps/backend"]
}
```

`apps/flutter` is **not** a Node workspace — it has its own `pubspec.yaml` and is managed independently via the Dart/Flutter toolchain.

---

## User Roles & Permissions

The system supports **5 roles**, with `pending` being a transitional state.

| Role | Description | Sign-up Path | Approval Required |
|---|---|---|---|
| **pending** | Account created, awaiting admin approval | Self-registers (teacher/security) | Yes — admin promotes |
| **admin** | Full system control: user management, students, classes, RAG policies | Seeded or promoted by another admin | — |
| **teacher** | Mark attendance, post notices, message parents, publish results | Self-registers → admin approves | Yes |
| **security** | Scan QR at gate, view gate logs, message parents | Self-registers → admin approves | Yes |
| **parent** | View child's gate/attendance/results, file complaints, chat with teachers | Multi-step OTP + 2FA verification | No — auto-active after OTP |

### Parent Registration is Special (2FA)

Parents go through a **2-factor identity check** to prove they own the child:
1. Submit email + student ID number → backend validates `parent_email` matches school records
2. OTP sent via Resend
3. After OTP verification, the parent must answer profile questions: **grade, class, admission year, gender** — server-side validation against the Student record
4. On success, parent user + `ParentStudent` link created atomically in a Prisma transaction

---

## Complete Feature List

### Backend Feature Modules (11)

| Module | Path | Purpose |
|---|---|---|
| **auth** | `apps/backend/src/modules/auth/` | Registration, OTP, login, password reset, JWT refresh, FCM token, 2FA for parents |
| **users** | `apps/backend/src/modules/users/` | User profile, admin user management (approve/suspend/delete) |
| **school** | `apps/backend/src/modules/school/` | Grades, classes, students, student photo upload, overview stats |
| **gate** | `apps/backend/src/modules/gate/` | QR scan IN/OUT, manual entry, time-series stats, parent's child history, auto-checkout scheduler |
| **attendance** | `apps/backend/src/modules/attendance/` | Daily attendance sessions, batch submit, calendar dates, summaries |
| **announcements** | `apps/backend/src/modules/announcements/` | School-wide or class-scoped notices with image upload |
| **messages** | `apps/backend/src/modules/messages/` | Inbox, threads, contacts, send/read, AI draft suggestion |
| **complaints** | `apps/backend/src/modules/complaints/` | Parent files → admin triages → staff assignment → resolution |
| **lost-found** | `apps/backend/src/modules/lost-found/` | Found items (posted by staff), lost reports (filed by parents) |
| **results** | `apps/backend/src/modules/results/` | Terms, result sets per class/term, modules + student grades, publish/unpublish |
| **rag** | `apps/backend/src/modules/rag/` | Policy PDF ingestion (chunk + embed), hybrid search, LLM answer generation, eval logs |

### Frontend Web Feature Modules (10)

| Module | Path | Used By |
|---|---|---|
| **auth** | `apps/frontend/src/features/auth/` | All roles |
| **attendance** | `apps/frontend/src/features/attendance/` | Admin, Teacher |
| **gate** | `apps/frontend/src/features/gate/` | Security, Admin |
| **messages** | `apps/frontend/src/features/messages/` | All roles |
| **notices** | `apps/frontend/src/features/notices/` | Admin, Teacher |
| **complaints** | `apps/frontend/src/features/complaints/` | Admin, Teacher |
| **results** | `apps/frontend/src/features/results/` | Teacher |
| **rag** | `apps/frontend/src/features/rag/` | Admin (policy chatbot in overview) |
| **school** | `apps/frontend/src/features/school/` | Admin |

### Flutter Mobile Feature Modules (15)

| Module | Path | Description |
|---|---|---|
| **splash** | `lib/features/splash/` | Splash + welcome onboarding screen |
| **auth** | `lib/features/auth/` | Login, multi-step registration with OTP, forgot password, biometric login |
| **dashboard** | `lib/features/dashboard/` | Home grid with action cards, animated bubble effects, announcements carousel, live clock |
| **profile** | `lib/features/profile/` | Parent + child + teacher info, profile setup |
| **attendance** | `lib/features/attendance/` | Paginated attendance records for child |
| **gate** | `lib/features/gate/` | Child's gate IN/OUT history + currently-inside-school status |
| **results** | `lib/features/results/` | Per-term grades, modules, average score, grade letter (A+, A, B+...) |
| **messages** | `lib/features/messages/` | Inbox + contacts tab, conversations with teachers |
| **contact_teacher** | `lib/features/contact_teacher/` | Direct chat with class teacher |
| **support** | `lib/features/support/` | File complaints/suggestions, view status (pending/assigned/resolved) |
| **notices** | `lib/features/notices/` | School & class announcements |
| **notifications** | `lib/features/notifications/` | Notification history |
| **chatbot** | `lib/features/chatbot/` | RAG-powered policy Q&A |
| **lost_and_found** | `lib/features/lost_and_found/` | Lost item reporting (stub) |
| **settings** | `lib/features/settings/` | Theme, logout, preferences |

---

## Tech Stack Summary

### Backend

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 20-alpine |
| **Framework** | Fastify | 5.7.4 |
| **Language** | TypeScript | 5.9.3 (strict mode, ES2020) |
| **Database** | PostgreSQL via Supabase | with `pgvector` & `uuid-ossp` |
| **ORM** | Prisma | 6.16.3 |
| **Cache** | Redis (optional) | 7-alpine |
| **Validation** | Zod | 4.3.6 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | 9.0.3 / 3.0.3 |
| **AI** | Google Gemini, Anthropic Claude SDK | 0.24.1 / 0.93.0 |
| **Email** | Resend | 6.12.2 |
| **Push** | Firebase Admin | 13.8.0 |
| **Logging** | Pino + pino-pretty | 10.3.1 / 13.1.3 |
| **Scheduling** | node-cron | 4.2.1 |
| **PDF** | pdf-parse | 2.4.5 |
| **Testing** | Jest + ts-jest + supertest | 29.7.0 / 29.4.9 / 7.2.2 |

### Frontend (Next.js)

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x (strict) |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Forms** | react-hook-form + Zod | 7.73.1 / 4.3.6 |
| **Charts** | Recharts | 3.8.1 |
| **Animation** | Framer Motion | 12.38.0 |
| **Icons** | lucide-react | 1.8.0 |
| **QR** | qrcode + react-qr-code | 1.5.4 / 2.0.18 |
| **QR Scan** | @zxing/browser + @zxing/library | 0.2.0 / 0.22.0 |
| **Database SDK** | @supabase/supabase-js | 2.105.1 |
| **Lint** | ESLint 9 + next/core-web-vitals + next/typescript | — |

### Flutter (Mobile)

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Flutter | 3.32.0 |
| **Language** | Dart | SDK ^3.10.1 |
| **State** | provider | 6.1.5 |
| **Routing** | go_router | 16.2.1 |
| **HTTP** | dio | 5.9.0 |
| **Storage** | flutter_secure_storage + shared_preferences | 9.2.4 / 2.5.3 |
| **Biometric** | local_auth | 3.0.1 |
| **Firebase** | firebase_core + firebase_messaging | 3.0.0 / 15.0.0 |
| **Notifications** | flutter_local_notifications | 21.0.0 |
| **Fonts** | google_fonts (Plus Jakarta Sans) | 6.2.1 |
| **OTP UI** | pinput | 6.0.2 |
| **Animation** | animations | 2.0.11 |

### DevOps

| Tool | Purpose |
|---|---|
| **Docker Compose** | Local stack (Redis + Backend + Frontend) |
| **GitHub Actions** | CI tests (ci.yml) + Flutter APK release (flutter-release.yml) |
| **Husky** | Git hooks: pre-commit, pre-push, commit-msg |
| **commitlint** | Conventional Commits enforcement |
| **lint-staged** | Run ESLint --fix on staged files |
| **Prettier** | Code formatting (singleQuote, 2 tab, 100 width) |
| **Vercel** | Web frontend hosting (vercel.json) |
| **Railway** | Backend production hosting (referenced in CI secrets) |
| **Supabase Cloud** | Managed PostgreSQL + Auth + Storage |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER DEVICES                                   │
│                                                                         │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐   ┌────────────┐   │
│   │   Admin    │    │  Teacher   │    │  Security  │   │   Parent   │   │
│   │  Browser   │    │  Browser   │    │  Browser   │   │  Phone/App │   │
│   │ (Next.js)  │    │ (Next.js)  │    │ (Next.js)  │   │ (Flutter)  │   │
│   └─────┬──────┘    └─────┬──────┘    └─────┬──────┘   └─────┬──────┘   │
└─────────┼─────────────────┼─────────────────┼────────────────┼──────────┘
          │                 │                 │                │
          │ HTTPS/Cookies   │                 │                │ HTTPS/JWT
          │                 │                 │                │
          └─────────────────┴─────┬───────────┴────────────────┘
                                  │
                  ┌───────────────▼────────────────┐
                  │      Fastify API (5000)        │
                  │  ┌──────────────────────────┐  │
                  │  │ helmet + cors + rate-lim │  │
                  │  ├──────────────────────────┤  │
                  │  │ authenticate + rbac      │  │
                  │  ├──────────────────────────┤  │
                  │  │ 11 modules:              │  │
                  │  │ auth, users, school,     │  │
                  │  │ gate, attendance,        │  │
                  │  │ announcements, messages, │  │
                  │  │ complaints, lost-found,  │  │
                  │  │ results, rag             │  │
                  │  └──────┬──────────┬────────┘  │
                  └─────────┼──────────┼───────────┘
                            │          │
                ┌───────────▼─┐    ┌──▼──────────────┐
                │  Redis 7    │    │  Prisma Client  │
                │  (cache,    │    └──────┬──────────┘
                │   sessions, │           │
                │   online)   │   ┌───────▼────────────┐
                └─────────────┘   │  PostgreSQL        │
                                  │  (Supabase)        │
                                  │  + pgvector        │
                                  │  + uuid-ossp       │
                                  │  20 models         │
                                  └────────────────────┘

                  ┌────────────────┐    ┌─────────────────┐
                  │ Gemini API     │    │  Resend Email   │
                  │ (embed + LLM)  │    │  (OTP/Approval) │
                  └────────────────┘    └─────────────────┘

                  ┌────────────────┐    ┌─────────────────┐
                  │ Firebase FCM   │    │  Supabase       │
                  │ (push notif)   │    │  Storage        │
                  └────────────────┘    └─────────────────┘
```

---

## Data Flow Across Apps

### Example 1: Gate Scan → Parent Notification

```
1. Security Officer (Frontend /security/dashboard) scans QR code
2. POST /api/gate/scan { student_id, direction:"IN", method:"qr" }
3. Fastify: authenticate → rbac(['admin','teacher','security']) → controller
4. Controller:
   a. Prisma: insert GateEvent
   b. Redis: cache invalidate (delCacheByPattern('gate:*'))
   c. Fetch Student → ParentStudent[] → User.fcm_token
   d. Firebase Admin: sendMulticastFcmNotification(tokens, "Child checked in", body)
5. Parent (Flutter app):
   - FCM listener (FirebaseMessaging.onMessage) fires
   - flutter_local_notifications shows OS notification
   - GateViewModel pulls latest events on next refresh
```

### Example 2: Parent Files Complaint

```
1. Parent (Flutter /support/submit) types complaint, selects category
2. POST /api/complaints { category, description, student_id }
3. Backend: authenticate → controller → Prisma.complaint.create({ status:'pending' })
4. Admin (Frontend /admin/complaints):
   - Sees new complaint with status badge
   - PUT /api/complaints/:id/assign { assigned_to_id: teacherId }
   - Status updates to 'assigned'
5. Teacher (Frontend /teacher/complaints):
   - Sees assigned complaint
   - PUT /api/complaints/:id/status { status:'resolved', reply_note }
6. Parent app refreshes — sees resolution + reply note in detail screen
```

### Example 3: RAG Chatbot Query

```
1. User (Flutter /chatbot OR Frontend /admin/overview/policies) types question
2. POST /api/rag/query { question, top_k:5 }
3. Rate limit: 10/min per IP
4. Cache check: Redis key based on question hash → if hit, return cached
5. Pipeline:
   a. Embed query via Gemini gemini-embedding-2 (768-dim)
   b. Hybrid search: pgvector cosine similarity + tsvector BM25
   c. Re-rank top chunks by term frequency
   d. Build prompt + call Gemini 2.5 Flash Lite
   e. Cache answer for 1 hour
   f. Log to EvaluationLog table (query, chunks, answer, confidence)
6. Return { answer, sources, confidence }
```

---

## Module-by-Module Working Style

Every backend module follows the same **4-file pattern**:

```
modules/<feature>/
├── <feature>.routes.ts       ← Fastify route registration
├── <feature>.controller.ts   ← Request handlers
├── <feature>.service.ts      ← Business logic (sometimes inline in controller for small modules)
└── <feature>.schema.ts       ← Zod validation schemas
```

### Why This Pattern?

| File | Responsibility |
|---|---|
| **routes** | URL paths, HTTP method, schema validation in `preHandler`, RBAC guards, rate limits |
| **controller** | Parse `request`, call service, format response, set status code |
| **service** | Pure business logic — Prisma queries, external API calls, transformations |
| **schema** | Zod schemas; types are inferred via `z.infer<typeof schema>['body']` |

### Frontend (Next.js) Pattern

```
src/features/<feature>/
├── lib/
│   └── <feature>-api.ts      ← fetch wrappers returning { ok, data } | { ok:false, error }
├── components/               ← Feature-specific React components
├── context/                  ← Optional ContextProvider for shared state
└── types/                    ← TypeScript interfaces (mirror backend)
```

### Flutter Pattern (MVVM + Repository)

```
lib/features/<feature>/
├── models/                   ← Pure data classes with fromJson/toJson
├── repositories/             ← Abstract + Api implementation (Dio calls)
├── viewmodels/               ← extends ChangeNotifier; loading/error/data state
└── views/                    ← Widget tree consuming ViewModel via Provider
```

---

## Existing Documentation Map

The repository already contains an extensive `Doc/` folder with **10 deep-dive references**. Use this guide alongside them:

| File | Purpose |
|---|---|
| `Doc/00-master-project-reference.md` | Master reference: roles, terminology, glossary |
| `Doc/01-system-architecture.md` | Architecture diagrams, deployment topology |
| `Doc/02-database-schema.md` | Every table, every column, relationships |
| `Doc/03-api-endpoints.md` | Detailed REST API reference |
| `Doc/04-backend-structure.md` | Backend folder structure & patterns |
| `Doc/05-realtime-channels.md` | Realtime + Firebase push channels |
| `Doc/06-auth-flow.md` | Step-by-step auth flow by role |
| `Doc/07-data-flow.md` | Feature-by-feature data movement |
| `Doc/08-flutter-app-structure.md` | Flutter MVVM architecture |
| `Doc/09-sprint-timeline.md` | Week-by-week development log |
| `Doc/10-production-readiness.md` | Deployment checklist, security hardening |

The 5 docs in `Documentation/` (this folder) are designed to be **standalone and comprehensive** — giving a reader the whole picture without needing the `Doc/` folder, while `Doc/` provides deeper drill-downs for specific topics.

### Reading Order

| If you want to... | Read |
|---|---|
| Understand the whole system | `Documentation/01-PROJECT-OVERVIEW.md` (this file) |
| Build / modify the backend | `Documentation/02-BACKEND-DEEP-DIVE.md` |
| Build / modify the web app | `Documentation/03-FRONTEND-WEB-APP.md` |
| Build / modify the mobile app | `Documentation/04-FLUTTER-MOBILE-APP.md` |
| Deploy / run locally / CI | `Documentation/05-DEVOPS-DOCKER-CICD.md` |

---

## Quick-Start Commands

```bash
# Install everything (npm workspaces)
npm install

# Generate Prisma client
npm run prisma:generate --prefix apps/backend

# Run dev (without Docker)
npm run backend:dev          # Terminal 1 — http://localhost:5000
npm run frontend:dev         # Terminal 2 — http://localhost:3000

# Run dev (with Docker)
docker compose -f docker-compose.dev.yml up --build

# Flutter
cd apps/flutter
flutter pub get
flutter run                  # Connects to http://10.0.2.2:5000 on emulator
```

---

**Next:** [02-BACKEND-DEEP-DIVE.md](02-BACKEND-DEEP-DIVE.md) — Fastify, Prisma, all API endpoints, auth, RAG pipeline.
