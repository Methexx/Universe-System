# UniVerse Platform — Technical Project Report

**Project Title:** UniVerse — Unified School Management & Communication Platform  
**Type:** University Final Year Project  
**Platform:** Full-Stack (REST API + Web + Mobile)  
**Author:** Methexx  
**Date:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Backend — Fastify REST API](#3-backend--fastify-rest-api)
4. [Database Layer — Supabase & Prisma](#4-database-layer--supabase--prisma)
5. [Caching — Redis](#5-caching--redis)
6. [Authentication & Security](#6-authentication--security)
7. [AI & Retrieval-Augmented Generation (RAG)](#7-ai--retrieval-augmented-generation-rag)
8. [Push Notifications — Firebase](#8-push-notifications--firebase)
9. [Email Service — Resend](#9-email-service--resend)
10. [File Storage](#10-file-storage)
11. [Web Frontend — Next.js](#11-web-frontend--nextjs)
12. [Mobile Application — Flutter](#12-mobile-application--flutter)
13. [DevOps & Containerization](#13-devops--containerization)
14. [Code Quality & Developer Experience](#14-code-quality--developer-experience)
15. [Testing](#15-testing)
16. [Environment Configuration](#16-environment-configuration)
17. [Key Features](#17-key-features)
18. [Conclusion](#18-conclusion)

---

## 1. Project Overview

**UniVerse** is a comprehensive, production-grade school management and communication platform built to unify the digital operations of an educational institution. It serves four distinct user roles:

| Role | Platform Access | Primary Functions |
|------|----------------|-------------------|
| **Admin** | Web + Mobile | System configuration, user management, announcements, reports |
| **Teacher** | Web + Mobile | Attendance, results entry, messaging, complaints |
| **Student** | Mobile | View attendance, results, announcements, AI chatbot |
| **Parent** | Mobile | Monitor child's attendance, results, receive notifications |

The system is delivered across three layers:

- A **REST API** built with Fastify (Node.js/TypeScript) serving as the backbone
- A **Next.js web application** for administrative and teacher dashboards
- A **Flutter mobile application** for students, parents, and on-the-go teacher access

The platform integrates cutting-edge technologies including multi-provider AI (OpenAI, Gemini, Claude), a full RAG (Retrieval-Augmented Generation) pipeline, QR-based attendance, biometric authentication, real-time push notifications, and containerized deployment.

---

## 2. System Architecture

### 2.1 Monorepo Structure

The entire project lives in a single repository managed as an **NPM Workspace monorepo**, keeping backend and web frontend in sync while the Flutter app resides as a sibling workspace.

```
Universe-System/
├── apps/
│   ├── backend/          # Fastify REST API (Node.js 20 + TypeScript 5)
│   │   ├── src/
│   │   │   ├── modules/  # 12 feature modules
│   │   │   ├── common/   # Shared middleware, utilities
│   │   │   └── config/   # Environment & plugin configuration
│   │   ├── prisma/       # Prisma schema + migrations
│   │   └── tests/        # Jest test suites
│   ├── frontend/         # Next.js 16 web application
│   │   └── src/app/      # App Router pages & components
│   └── flutter/          # Flutter 3 mobile application
│       └── lib/          # Feature-based Dart source
├── docker-compose.yml         # Production Docker Compose
├── docker-compose.dev.yml     # Development Docker Compose
└── package.json               # Workspace root
```

### 2.2 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   ┌──────────────────┐          ┌───────────────────────┐  │
│   │  Next.js 16 Web  │          │  Flutter 3 Mobile App │  │
│   │  (React 19 +     │          │  (Android / iOS)      │  │
│   │   Tailwind CSS)  │          │                       │  │
│   └────────┬─────────┘          └───────────┬───────────┘  │
└────────────┼───────────────────────────────┼───────────────┘
             │  HTTP/REST                     │  HTTP/REST
             ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Port 5000)                  │
│                                                             │
│              Fastify 5 — Node.js 20 — TypeScript 5          │
│                                                             │
│   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│   │  Auth  │ │Attendance│ │ Results  │ │  RAG / AI     │  │
│   └────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│   │ Users  │ │  Gate    │ │Messages  │ │  Complaints   │  │
│   └────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│   │School  │ │ Storage  │ │Lost&Found│ │Announcements  │  │
│   └────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
│  DATA LAYER    │  │  CACHE LAYER     │  │ EXTERNAL     │
│                │  │                  │  │ SERVICES     │
│ Supabase       │  │ Redis 7          │  │              │
│ (PostgreSQL)   │  │ (Docker)         │  │ Firebase FCM │
│                │  │ Port 6379        │  │ Resend Email │
│ Prisma ORM     │  │ TTL: 120s        │  │ OpenAI API   │
│ PgBouncer      │  │                  │  │ Gemini API   │
│ Connection     │  │                  │  │ Claude API   │
│ Pooling        │  │                  │  │ Vercel       │
└────────────────┘  └──────────────────┘  └──────────────┘
```

### 2.3 Communication Flow

- **Web Frontend → Backend:** Configured via `NEXT_PUBLIC_API_URL` environment variable. Runs on `http://backend:5000` within Docker network, or a deployed URL in production.
- **Flutter → Backend:** Uses Dio HTTP client pointing to `http://10.0.2.2:5000` for Android emulator, or the production backend URL.
- **Backend → Database:** Prisma client manages all SQL via the Supabase connection pool (PgBouncer on port 6543) and direct connection (port 5432) for migrations.
- **Backend → Cache:** Redis client (`ioredis`/`redis` npm package) on port 6379 for session and response caching.

---

## 3. Backend — Fastify REST API

### 3.1 Runtime & Framework

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 20 (Alpine) | JavaScript runtime |
| TypeScript | 5.9.3 | Type safety, compile-time checks |
| Fastify | 5.7.4 | HTTP framework |
| ts-node / tsc | 10.9.2 / 5.9.3 | TypeScript execution & compilation |

**Why Fastify over Express?**  
Fastify was chosen for its significantly higher throughput (benchmarks show 2–3x faster than Express on identical hardware), built-in JSON schema validation, plugin-based architecture that enforces encapsulation, and native TypeScript support. Its `@fastify/` plugin ecosystem provides production-ready solutions for CORS, JWT, cookies, rate limiting, and file uploads with minimal boilerplate.

### 3.2 Plugin Architecture

The backend bootstraps via a central plugin loader that registers the following Fastify plugins:

| Plugin | Version | Purpose |
|--------|---------|---------|
| @fastify/cors | 11.2.0 | Cross-Origin Resource Sharing |
| @fastify/helmet | 13.0.2 | HTTP security headers (XSS, clickjacking protection) |
| @fastify/jwt | 9.1.0 | JWT signing, verification, and decoration |
| @fastify/cookie | 11.0.2 | HTTP cookie parsing & setting |
| @fastify/multipart | 10.0.0 | File upload handling (multipart/form-data) |
| @fastify/rate-limit | 10.3.0 | Per-IP request throttling |

### 3.3 Feature Modules

The backend is organized into **12 self-contained feature modules**, each with its own routes, controllers, services, and validation schemas:

| Module | Responsibilities |
|--------|----------------|
| **auth** | Registration, login, OTP verification, JWT issuance & refresh, password reset |
| **users** | User CRUD, profile management, FCM token registration |
| **school** | School structure — grades, classes, academic terms |
| **students** | Student enrollment, profile linking to parents |
| **attendance** | QR session creation, attendance marking, report generation |
| **gate** | Gate scan events (entry/exit tracking), real-time gate logs |
| **results** | Result sets, grade entry, per-student grade retrieval |
| **announcements** | Notice board — create, publish, role-targeted delivery |
| **messages** | Inter-user direct messaging system |
| **complaints** | Student/parent complaint submission, status tracking |
| **lost-found** | Lost item reports, found item matching, image upload |
| **rag** | Policy document ingestion, vector chunking, AI-powered Q&A chatbot |
| **storage** | File upload proxy to Supabase Storage |

### 3.4 Key Utilities

- **Zod 4.3.6** — Runtime schema validation for all request bodies and query parameters
- **node-cron 4.2.1** — Scheduled background jobs (e.g., cleanup, reminders)
- **axios 1.14.0** — HTTP client for outbound calls to external AI APIs
- **pino 10.3.1 + pino-pretty 13.1.3** — Structured JSON logging with human-readable dev output
- **dotenv 17.3.1** — Environment variable loading from `.env` files
- **nodemon 3.1.14** — Hot reload during development

---

## 4. Database Layer — Supabase & Prisma

### 4.1 Supabase (Managed PostgreSQL)

Supabase provides the hosted PostgreSQL 15 database with several production features enabled:

- **Connection Pooling:** PgBouncer pooler on port 6543 handles connection limits under load
- **Direct Connection:** Port 5432 used exclusively by Prisma Migrate for schema migrations
- **Extensions Enabled:**
  - `uuid-ossp` — UUID generation for primary keys
  - `vector` — pgvector extension for 768-dimensional AI embeddings used in the RAG pipeline
- **Supabase Auth:** Used alongside custom JWT for a layered authentication approach
- **Supabase Storage:** Used for storing uploaded files (profile images, lost & found photos, policy PDFs)
- **SDK:** `@supabase/supabase-js 2.97.0` on backend, `2.105.1` on frontend

### 4.2 Prisma ORM

| Feature | Detail |
|---------|--------|
| Version | 6.16.3 |
| Generator | prisma-client-js |
| Datasource | postgresql (Supabase) |
| Migration Tool | `prisma migrate dev` / `prisma migrate deploy` |
| GUI | Prisma Studio (`prisma studio`) |

**Key Prisma Models (20+ total):**

| Model | Description |
|-------|-------------|
| `User` | Core user entity (all roles) with role enum, FCM token, profile data |
| `OtpVerification` | OTP codes with expiry for email/phone verification |
| `Student` | Student profile linked to User and parent |
| `ParentStudent` | Many-to-many linking parents to children |
| `Class` | Class entity linked to SchoolGrade |
| `SchoolGrade` | Grade/year levels (e.g., Grade 10, Grade 11) |
| `Term` | Academic term periods |
| `AttendanceSession` | A QR-based attendance session per class per day |
| `AttendanceRecord` | Individual student attendance mark per session |
| `GateEvent` | Entry/exit scan events for gate tracking |
| `ResultSet` | A batch of results (e.g., Term 1 Exam) |
| `StudentGrade` | Per-student grade per subject in a ResultSet |
| `Announcement` | School notice board items |
| `Message` | Direct messages between users |
| `Complaint` | Submitted complaints with status tracking |
| `LostFoundItem` | Lost or found item reports |
| `LostFoundReport` | Match reports for lost & found |
| `PolicyDocument` | Uploaded school policy PDFs for RAG |
| `DocumentChunk` | Chunked text segments from policy documents |
| `EvaluationLog` | Logs of AI query-answer pairs for RAG evaluation |

---

## 5. Caching — Redis

Redis 7 runs as a Docker container providing fast in-memory caching to reduce database load and improve response times.

| Property | Value |
|----------|-------|
| Version | Redis 7 (Alpine) |
| Port | 6379 |
| Default TTL | 120 seconds (configurable via `REDIS_DEFAULT_TTL`) |
| Persistence | Volume-mounted (`redis_data`) for data survival across restarts |
| npm Package | `redis 4.7.1` |

**Use Cases:**
- **Session/token caching** — Avoids repeated JWT verification database lookups
- **Rate limit counters** — `@fastify/rate-limit` uses Redis as its backing store for distributed rate limiting
- **Response caching** — Frequently-read data (e.g., announcements, class lists) are cached to reduce Supabase query load

---

## 6. Authentication & Security

### 6.1 Authentication Flow

```
Client Request
     │
     ▼
[Fastify Route Handler]
     │
     ▼
[@fastify/jwt verify hook]  ←── JWT Secret (min 32 chars, env var)
     │
     ▼
[Role-based guard middleware]
     │
     ▼
[Module Controller]
```

1. **Registration:** User submits credentials → bcryptjs hashes password (salt rounds: 10) → stored in DB → OTP email sent via Resend
2. **OTP Verification:** User submits OTP → checked against `OtpVerification` table with expiry validation → account activated
3. **Login:** Credentials verified → bcrypt.compare → JWT access token + refresh token issued via `@fastify/jwt` → tokens stored in HTTP-only cookies via `@fastify/cookie`
4. **Supabase Auth:** Used in parallel for Supabase Storage and real-time features requiring Supabase RLS (Row Level Security)

### 6.2 Security Layers

| Layer | Tool | Protection |
|-------|------|------------|
| Password hashing | bcryptjs 3.0.3 | Brute-force resistance |
| JWT tokens | @fastify/jwt 9.1.0 | Stateless auth |
| Security headers | @fastify/helmet 13.0.2 | XSS, clickjacking, MIME sniffing |
| CORS policy | @fastify/cors 11.2.0 | Controlled origin access |
| Rate limiting | @fastify/rate-limit 10.3.0 | DoS / brute-force mitigation |
| Input validation | Zod 4.3.6 | Injection & malformed input prevention |
| Cookie security | @fastify/cookie 11.0.2 | HTTP-only, Secure flag on tokens |

### 6.3 Mobile Security (Flutter)

- **flutter_secure_storage 9.2.4** — Stores JWT tokens in platform Keystore (Android) / Keychain (iOS), not in plain SharedPreferences
- **local_auth 3.0.1** — Biometric authentication (fingerprint, face ID) as an app-lock layer

---

## 7. AI & Retrieval-Augmented Generation (RAG)

### 7.1 Multi-Provider AI Integration

UniVerse integrates **three separate AI providers**, giving the system flexibility and redundancy:

| Provider | SDK | Version | Use Case |
|---------|-----|---------|---------|
| OpenAI | openai (API direct) | — | GPT models for chat & completion |
| Google Gemini | @google/generative-ai | 0.24.1 | Gemini Pro for document Q&A |
| Anthropic Claude | @anthropic-ai/sdk | 0.93.0 | Claude for policy interpretation |

### 7.2 RAG Pipeline Architecture

The RAG system enables students, teachers, and parents to query school policy documents in natural language.

```
PDF Upload (Admin)
       │
       ▼
[pdf-parse 2.4.5]          ← Extract raw text from PDF
       │
       ▼
[Chunking Service]          ← Split text into ~500 token chunks
       │                       with overlap for context preservation
       ▼
[Embedding Model]           ← Generate 768-dim vector per chunk
       │
       ▼
[Supabase PostgreSQL]       ← Store chunks + vectors in
[pgvector extension]           DocumentChunk table
       │
── Query Time ──────────────────────────────────────────────────
       │
       ▼
User Question (Natural Language)
       │
       ▼
[Embed Question]            ← Same embedding model
       │
       ▼
[pgvector similarity search]← Find top-K most relevant chunks
       │
       ▼
[Context Assembly]          ← Combine retrieved chunks as context
       │
       ▼
[AI Provider (Gemini/Claude/OpenAI)]  ← Generate answer
       │
       ▼
Answer + EvaluationLog entry (question, answer, chunks used)
```

### 7.3 Evaluation Logging

Every RAG query is logged to the `EvaluationLog` table, storing the original question, generated answer, retrieved chunks, and response latency. This enables ongoing quality monitoring and fine-tuning.

---

## 8. Push Notifications — Firebase

### 8.1 Backend (firebase-admin)

| Component | Detail |
|-----------|--------|
| Package | firebase-admin 13.8.0 |
| Auth Method | Service Account JSON (env var `FIREBASE_SERVICE_ACCOUNT_JSON`) |
| Project | Configured via `FIREBASE_PROJECT_ID` |
| Delivery | Firebase Cloud Messaging (FCM) HTTP v1 API |

**Notification triggers:**
- New announcement published
- Attendance session opened
- Result set released
- New message received
- Complaint status updated
- Gate entry/exit event (for parents)

FCM tokens are stored per `User` record in the database and updated each time the mobile app is opened.

### 8.2 Mobile (Flutter)

| Package | Version | Role |
|---------|---------|------|
| firebase_core | 3.0.0 | Firebase SDK initialization |
| firebase_messaging | 15.0.0 | FCM token retrieval, background/foreground message handling |
| flutter_local_notifications | 21.0.0 | Display notification banners locally when app is in foreground |

---

## 9. Email Service — Resend

Transactional emails are delivered via **Resend**, a developer-first email API.

| Property | Value |
|----------|-------|
| Package | resend 6.12.2 |
| From Address | noreply@mg.methum.space |
| Sending Domain | mg.methum.space (custom domain) |
| Auth | `RESEND_API_KEY` environment variable |

**Email use cases:**
- OTP verification codes during registration
- Password reset links
- Welcome emails for new accounts
- Announcement digest notifications (if enabled)

---

## 10. File Storage

File uploads are handled in two stages:

1. **Inbound:** `@fastify/multipart 10.0.0` parses multipart form data from HTTP requests
2. **Outbound:** `@supabase/supabase-js` SDK uploads the buffer to Supabase Storage buckets

**Storage Buckets:**
- `profile-images` — User profile photos
- `lost-found-images` — Photos attached to lost & found reports
- `policy-documents` — PDF files ingested by the RAG pipeline

Public URLs are generated via Supabase's CDN and stored in the relevant database records.

---

## 11. Web Frontend — Next.js

### 11.1 Framework & Core

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 16.1.6 | Full-stack React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| autoprefixer | 10.4.27 | CSS vendor prefix automation |

The frontend uses Next.js **App Router** (introduced in Next.js 13+), providing:
- File-system-based routing with layouts
- React Server Components for reduced client-side JS
- Streaming and Suspense for progressive loading
- Built-in API routes for lightweight server actions

### 11.2 UI & Interaction Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| framer-motion | 12.38.0 | Smooth page transitions, component animations |
| recharts | 3.8.1 | Data visualization (attendance charts, result graphs) |
| lucide-react | 1.8.0 | Icon library |
| clsx | 2.1.1 | Conditional className merging |
| tailwind-merge | 3.5.0 | Tailwind class conflict resolution |

### 11.3 Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | 7.73.1 | Performant form state management |
| @hookform/resolvers | 5.2.2 | Connects Zod schemas to React Hook Form |
| zod | 4.3.6 | Schema-based runtime validation |

### 11.4 QR Code System

| Package | Version | Purpose |
|---------|---------|---------|
| react-qr-code | 2.0.18 | QR code display component |
| qrcode | 1.5.4 | Server-side QR code generation |
| @zxing/browser | 0.2.0 | In-browser QR scanning via webcam |
| @zxing/library | 0.22.0 | ZXing barcode decoding core library |

The attendance QR system works as follows:
1. Teacher opens an attendance session → backend generates a unique session token
2. Frontend renders a QR code containing the session token (auto-refreshes every 30s)
3. Students scan with their Flutter app → backend validates the token and marks attendance

### 11.5 Deployment

The frontend is deployed to **Vercel** with a `vercel.json` configuration file defining build settings and environment variable overrides. Vercel provides:
- Automatic preview deployments per branch
- Edge network CDN
- Serverless function hosting for API routes

---

## 12. Mobile Application — Flutter

### 12.1 Framework

| Property | Value |
|----------|-------|
| Framework | Flutter 3.10.1+ |
| Language | Dart 3.10.1+ |
| Targets | Android, iOS |
| Base URL | `http://10.0.2.2:5000` (emulator) / production URL |

### 12.2 State Management

**Provider 6.1.5** is used for application state management, following the recommended pattern for medium-complexity Flutter apps. Each feature has its own `ChangeNotifier` provider (e.g., `AuthProvider`, `AttendanceProvider`, `ResultProvider`) injected via `MultiProvider` at the app root.

### 12.3 Networking

**Dio 5.9.0** serves as the HTTP client with:
- A `BaseOptions` instance setting the base URL and default headers
- Interceptors for automatic JWT token attachment on every request
- Interceptors for 401 handling and token refresh logic
- JSON serialization/deserialization

### 12.4 Navigation

**go_router 16.2.1** provides:
- Declarative, URL-based routing
- Deep link support for push notification taps
- Role-based route guards (redirect unauthorized users to login)
- Nested navigation for bottom navigation bar flows

### 12.5 Flutter Package Breakdown

**Authentication & Security:**

| Package | Version | Purpose |
|---------|---------|---------|
| flutter_secure_storage | 9.2.4 | Encrypted Keystore/Keychain token storage |
| local_auth | 3.0.1 | Biometric authentication (fingerprint / face ID) |

**Firebase:**

| Package | Version | Purpose |
|---------|---------|---------|
| firebase_core | 3.0.0 | Firebase SDK base initialization |
| firebase_messaging | 15.0.0 | Push notification handling |
| flutter_local_notifications | 21.0.0 | Local notification display |

**Storage & Preferences:**

| Package | Version | Purpose |
|---------|---------|---------|
| shared_preferences | 2.5.3 | Lightweight key-value persistent storage |

**UI/UX:**

| Package | Version | Purpose |
|---------|---------|---------|
| google_fonts | 6.2.1 | Google Fonts integration (no manual font files) |
| animations | 2.0.11 | Material Design motion transitions |
| pinput | 6.0.2 | OTP pin input field component |
| cupertino_icons | 1.0.8 | iOS-style icon set |

**Navigation & Routing:**

| Package | Version | Purpose |
|---------|---------|---------|
| go_router | 16.2.1 | Declarative URL-based navigation |

**Networking:**

| Package | Version | Purpose |
|---------|---------|---------|
| dio | 5.9.0 | HTTP client with interceptors |

---

## 13. DevOps & Containerization

### 13.1 Docker Architecture

The entire backend infrastructure runs in Docker containers managed by Docker Compose. Two compose files exist for different environments:

**`docker-compose.dev.yml` (Development):**
- Backend with volume mounts for hot reload via `nodemon`
- Redis with persistent data volume
- Source code mounted directly into container
- `NODE_ENV=development`

**`docker-compose.yml` (Production):**
- Backend runs compiled TypeScript output
- Redis with production-grade configuration
- No source code mounts
- `NODE_ENV=production`

### 13.2 Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `backend` | node:20-alpine | 5000 | Fastify REST API |
| `frontend` | node:20-alpine | 3000 | Next.js web app |
| `redis` | redis:7-alpine | 6379 | Cache & rate limiting |

### 13.3 Docker Configuration Details

```yaml
# Base image: node:20-alpine
# Chosen for minimal size (~50MB vs ~900MB for full node image)
# Alpine Linux provides security-hardened minimal base

# Redis volume for data persistence:
volumes:
  redis_data:   # Named volume — survives docker-compose down

# Backend health check connects to:
# http://backend:5000 within the Docker bridge network
# (service name "backend" resolves to container IP automatically)
```

### 13.4 Build Process

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build

# Backend standalone build
npm run build   # runs: tsc (TypeScript compile)
npm start       # runs: node dist/server.js
```

---

## 14. Code Quality & Developer Experience

### 14.1 Linting — ESLint 9

The web frontend uses **ESLint 9** with the new flat config format (`eslint.config.mjs`), configured with:
- Next.js recommended ruleset (`eslint-config-next`)
- TypeScript-aware rules via `@typescript-eslint`
- Import ordering and unused variable detection

```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix fixable issues
```

### 14.2 Code Formatting — Prettier 3

**Prettier 3.3.3** enforces a consistent code style across the entire codebase:
- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- Print width: 100 characters
- Semicolons: true

Prettier runs automatically on staged files before every commit via `lint-staged`.

### 14.3 Pre-commit Hooks — Husky + lint-staged

**Husky** installs Git hooks into `.husky/` so that every `git commit` triggers automated checks:

```
git commit
    │
    ▼
[husky pre-commit hook]
    │
    ▼
[lint-staged 16.2.7]
    ├── *.{ts,tsx} → ESLint --fix → Prettier --write
    ├── *.{js,jsx} → Prettier --write
    └── *.{json,md} → Prettier --write
    │
    ▼
Commit proceeds only if all checks pass
```

This enforces code quality at the source — no unformatted or lint-failing code can enter the repository.

### 14.4 Commit Standards — commitlint

**commitlint** enforces the **Conventional Commits** specification on every commit message:

```
<type>(<scope>): <description>

Examples:
feat(auth): add OTP verification endpoint
fix(attendance): resolve session expiry bug
chore(deps): update Prisma to 6.16.3
docs(api): add rate limiting documentation
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`

### 14.5 TypeScript Configuration

- **Strict mode enabled** — catches null pointer bugs, implicit `any`, and unsafe operations at compile time
- **Path aliases** — `@/` maps to `src/` for clean imports
- **Target:** ESNext for both backend and frontend
- **Source maps** enabled for debugging

---

## 15. Testing

### 15.1 Backend Testing Stack

| Tool | Version | Role |
|------|---------|------|
| Jest | 29.7.0 | Test runner and assertion library |
| ts-jest | 29.4.9 | TypeScript transpilation for Jest |
| supertest | 7.2.2 | HTTP integration testing against Fastify server |

### 15.2 Test Structure

```
apps/backend/tests/
├── unit/
│   ├── auth.service.test.ts
│   ├── attendance.service.test.ts
│   └── ...
└── integration/
    ├── auth.routes.test.ts
    ├── attendance.routes.test.ts
    └── ...
```

### 15.3 Coverage Requirements

Jest is configured with a **70% coverage threshold** across all metrics (branches, functions, lines, statements). The CI pipeline fails if coverage drops below this threshold, enforcing maintained test quality as the codebase grows.

```json
// jest.config.ts coverage thresholds
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### 15.4 Test Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode during development
npm run test:coverage # Generate coverage report
```

---

## 16. Environment Configuration

The system uses separate `.env` files at each layer, following the **12-factor app** principle of externalizing configuration.

### Backend Environment Variables

| Variable | Purpose |
|---------|---------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment mode (development/production) |
| `DATABASE_URL` | Supabase PgBouncer pooled connection (Prisma runtime) |
| `DIRECT_URL` | Supabase direct connection (Prisma migrations only) |
| `REDIS_URL` | Redis connection string |
| `REDIS_DEFAULT_TTL` | Default cache TTL in seconds |
| `JWT_SECRET` | JWT signing secret (minimum 32 characters) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin access) |
| `RESEND_API_KEY` | Resend email service API key |
| `RESEND_FROM_EMAIL` | Sender email address |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `FIREBASE_PROJECT_ID` | Firebase project identifier |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account credentials (JSON string) |
| `WEB_URL` | Frontend web URL (for CORS and email links) |
| `FLUTTER_ORIGIN` | Flutter app origin (for CORS) |

### Frontend Environment Variables

| Variable | Purpose |
|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) |

---

## 17. Key Features

### 17.1 QR Attendance System
Teachers generate time-limited QR codes for each attendance session. Students scan via the Flutter app. The backend validates the QR token, checks session validity, and records attendance in real time. The web dashboard shows live attendance status.

### 17.2 Gate Tracking
A dedicated `gate` module processes entry/exit scan events from a physical gate scanner. Events are logged per student with timestamps, and parents receive push notifications on entry/exit.

### 17.3 Academic Results
Teachers enter grades via the web dashboard into `ResultSet` objects. Students and parents can view results on the mobile app. Results support multiple term periods and subject-level granularity.

### 17.4 AI Policy Chatbot (RAG)
Admins upload school policy PDFs. The RAG pipeline chunks, embeds, and indexes them. Any user can ask natural language questions (e.g., "What is the late arrival policy?") and receive accurate, document-grounded answers from Gemini, Claude, or GPT.

### 17.5 Messaging System
Direct messaging between users (teacher ↔ parent, admin ↔ teacher) with message history persisted in the database and push notification delivery.

### 17.6 Complaints & Feedback
Parents and students submit complaints or feedback through the mobile app. Admins track complaint status (open/in-progress/resolved) via the web dashboard.

### 17.7 Lost & Found
Students report lost items with photos. Admins post found items. The system supports matching reports and notifications.

### 17.8 Announcements
Admins post announcements targeted to specific roles (all students, specific grade, all parents). Announcements are delivered via push notification and displayed in-app.

---

## 18. Conclusion

UniVerse represents a production-grade, full-stack school management platform built with modern, industry-standard technologies. The architecture demonstrates:

- **Scalability** — Stateless REST API, connection pooling, Redis caching, and containerized deployment
- **Security** — Multi-layer authentication, encrypted token storage, rate limiting, security headers, and OTP verification
- **AI Integration** — A complete RAG pipeline with three AI provider options and evaluation logging
- **Cross-Platform Delivery** — Simultaneous web (Next.js) and mobile (Flutter) clients from a single backend
- **Developer Excellence** — TypeScript throughout, ESLint + Prettier + Husky hooks, conventional commits, and 70%+ test coverage
- **Operational Readiness** — Docker Compose for both development and production, separate environment config, structured logging with Pino

The monorepo structure, modular backend architecture, and consistent tooling choices make UniVerse maintainable, extensible, and ready for real-world deployment.

---

*Report generated from live codebase analysis — May 2026*
