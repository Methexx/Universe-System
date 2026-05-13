# UniVerse Platform — Complete Tech Stack Reference

> Quick-reference for all technologies, packages, services, and tools used across the entire monorepo.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Backend — Runtime & Framework](#backend--runtime--framework)
3. [Backend — All NPM Packages](#backend--all-npm-packages)
4. [Database & ORM](#database--orm)
5. [Caching](#caching)
6. [Authentication & Security](#authentication--security)
7. [AI & Machine Learning](#ai--machine-learning)
8. [Email & Notifications](#email--notifications)
9. [Web Frontend — Next.js](#web-frontend--nextjs)
10. [Web Frontend — All NPM Packages](#web-frontend--all-npm-packages)
11. [Mobile — Flutter](#mobile--flutter)
12. [Flutter — All Packages (pubspec.yaml)](#flutter--all-packages-pubspecyaml)
13. [DevOps & Containerization](#devops--containerization)
14. [Code Quality & Tooling](#code-quality--tooling)
15. [Testing](#testing)
16. [External APIs & Cloud Services](#external-apis--cloud-services)
17. [Environment Variables Reference](#environment-variables-reference)

---

## System Overview

| Property | Value |
|----------|-------|
| Project Name | UniVerse |
| Type | Full-Stack School Management Platform |
| Repo Structure | NPM Workspace Monorepo |
| Apps | Backend (Fastify) + Web (Next.js) + Mobile (Flutter) |
| Backend Port | 5000 |
| Frontend Port | 3000 |
| Cache Port | 6379 |

---

## Backend — Runtime & Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20 (Alpine) | JavaScript runtime |
| TypeScript | 5.9.3 | Static typing |
| Fastify | 5.7.4 | HTTP web framework |
| ts-node | 10.9.2 | TypeScript execution (dev) |
| tsc | 5.9.3 | TypeScript compiler (build) |
| nodemon | 3.1.14 | Hot reload in development |

---

## Backend — All NPM Packages

### Production Dependencies

| Package | Version | Category | Purpose |
|---------|---------|----------|---------|
| fastify | 5.7.4 | Framework | Core HTTP server |
| @fastify/cors | 11.2.0 | Framework | CORS policy |
| @fastify/helmet | 13.0.2 | Framework | HTTP security headers |
| @fastify/jwt | 9.1.0 | Framework | JWT signing & verification |
| @fastify/cookie | 11.0.2 | Framework | Cookie parsing & setting |
| @fastify/multipart | 10.0.0 | Framework | File upload handling |
| @fastify/rate-limit | 10.3.0 | Framework | Request rate limiting |
| @prisma/client | 6.16.3 | Database | Prisma ORM runtime client |
| @supabase/supabase-js | 2.97.0 | Database | Supabase SDK |
| redis | 4.7.1 | Cache | Redis client |
| @google/generative-ai | 0.24.1 | AI | Google Gemini API SDK |
| @anthropic-ai/sdk | 0.93.0 | AI | Anthropic Claude API SDK |
| firebase-admin | 13.8.0 | Notifications | Firebase Cloud Messaging |
| resend | 6.12.2 | Email | Transactional email API |
| bcryptjs | 3.0.3 | Security | Password hashing |
| jsonwebtoken | 9.0.3 | Security | JWT utility |
| zod | 4.3.6 | Validation | Runtime schema validation |
| axios | 1.14.0 | HTTP | Outbound HTTP client |
| pdf-parse | 2.4.5 | AI/RAG | PDF text extraction |
| node-cron | 4.2.1 | Scheduling | Cron job scheduling |
| pino | 10.3.1 | Logging | Structured JSON logger |
| pino-pretty | 13.1.3 | Logging | Human-readable log output |
| dotenv | 17.3.1 | Config | Environment variable loading |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | 5.9.3 | TypeScript compiler |
| ts-node | 10.9.2 | TypeScript execution |
| nodemon | 3.1.14 | Hot reload |
| jest | 29.7.0 | Test runner |
| ts-jest | 29.4.9 | TypeScript → Jest bridge |
| supertest | 7.2.2 | HTTP integration testing |
| @types/node | latest | Node.js type definitions |
| @types/bcryptjs | latest | bcryptjs type definitions |
| @types/jest | latest | Jest type definitions |
| @types/supertest | latest | Supertest type definitions |
| prisma | 6.16.3 | Prisma CLI (migrations, studio) |
| ndb | latest | Node.js debugger |

---

## Database & ORM

| Technology | Version | Purpose |
|-----------|---------|---------|
| Supabase | Managed | PostgreSQL hosting platform |
| PostgreSQL | 15+ | Relational database |
| Prisma ORM | 6.16.3 | Database ORM & migration tool |
| PgBouncer | Supabase-managed | Connection pooling (port 6543) |
| pgvector | PostgreSQL extension | 768-dim vector embeddings for RAG |
| uuid-ossp | PostgreSQL extension | UUID generation |
| Prisma Studio | 6.16.3 | Database GUI browser |

**Connection types:**

| Connection | URL Variable | Used For |
|-----------|-------------|---------|
| Pooled (PgBouncer) | `DATABASE_URL` | Prisma Client runtime queries |
| Direct | `DIRECT_URL` | Prisma Migrate schema migrations |

---

## Caching

| Technology | Version | Purpose |
|-----------|---------|---------|
| Redis | 7-Alpine (Docker) | In-memory cache store |
| redis (npm) | 4.7.1 | Node.js Redis client |

| Property | Value |
|----------|-------|
| Port | 6379 |
| Default TTL | 120 seconds |
| Persistence | Volume-mounted (`redis_data`) |
| Use Cases | Session cache, rate limit counters, response cache |

---

## Authentication & Security

| Tool | Version | Layer | Purpose |
|------|---------|-------|---------|
| @fastify/jwt | 9.1.0 | Backend | JWT issuance & verification |
| @fastify/cookie | 11.0.2 | Backend | HTTP-only cookie tokens |
| @fastify/helmet | 13.0.2 | Backend | Security headers |
| @fastify/cors | 11.2.0 | Backend | CORS policy |
| @fastify/rate-limit | 10.3.0 | Backend | Request throttling |
| bcryptjs | 3.0.3 | Backend | Password hashing (salt rounds: 10) |
| jsonwebtoken | 9.0.3 | Backend | JWT utility functions |
| zod | 4.3.6 | Backend + Web | Input validation |
| Supabase Auth | Managed | Backend + Web | OAuth & managed auth |
| flutter_secure_storage | 9.2.4 | Flutter | Encrypted token storage (Keystore/Keychain) |
| local_auth | 3.0.1 | Flutter | Biometric auth (fingerprint/face ID) |

---

## AI & Machine Learning

| Provider | SDK Package | Version | Key Env Var |
|---------|------------|---------|------------|
| OpenAI (GPT) | Direct HTTP / openai | — | `OPENAI_API_KEY` |
| Google Gemini | @google/generative-ai | 0.24.1 | `GEMINI_API_KEY` |
| Anthropic Claude | @anthropic-ai/sdk | 0.93.0 | `ANTHROPIC_API_KEY` |

**RAG Pipeline Components:**

| Component | Tool/Package | Purpose |
|-----------|-------------|---------|
| PDF ingestion | pdf-parse 2.4.5 | Extract text from uploaded PDFs |
| Text chunking | Custom service | Split documents into ~500 token chunks |
| Vector embeddings | AI embedding model | 768-dim vectors per chunk |
| Vector storage | pgvector (PostgreSQL) | Cosine similarity search |
| Semantic search | pgvector SQL | Top-K chunk retrieval |
| Answer generation | Gemini / Claude / GPT | Context-grounded response |
| Evaluation logging | `EvaluationLog` table | Query/answer quality tracking |

---

## Email & Notifications

### Email

| Tool | Version | Purpose |
|------|---------|---------|
| Resend | 6.12.2 (npm) | Transactional email delivery |
| Custom domain | mg.methum.space | Sender domain for deliverability |

### Push Notifications (Backend)

| Tool | Version | Purpose |
|------|---------|---------|
| firebase-admin | 13.8.0 | FCM HTTP v1 API for push delivery |

### Push Notifications (Flutter)

| Package | Version | Purpose |
|---------|---------|---------|
| firebase_core | 3.0.0 | Firebase SDK initialization |
| firebase_messaging | 15.0.0 | FCM token + message receiving |
| flutter_local_notifications | 21.0.0 | In-app notification banners |

---

## Web Frontend — Next.js

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Static typing |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| autoprefixer | 10.4.27 | CSS prefix automation |
| PostCSS | — | CSS pipeline |
| Vercel | Managed | Hosting & deployment |

---

## Web Frontend — All NPM Packages

### Production Dependencies

| Package | Version | Category | Purpose |
|---------|---------|----------|---------|
| next | 16.1.6 | Framework | Next.js |
| react | 19.2.3 | Framework | React |
| react-dom | 19.2.3 | Framework | React DOM renderer |
| typescript | 5.x | Language | TypeScript |
| tailwindcss | 3.4.19 | Styling | Tailwind CSS |
| autoprefixer | 10.4.27 | Styling | CSS vendor prefixes |
| framer-motion | 12.38.0 | UI | Animations & transitions |
| recharts | 3.8.1 | UI | Charts & data visualization |
| lucide-react | 1.8.0 | UI | Icon components |
| clsx | 2.1.1 | Utilities | Conditional className helper |
| tailwind-merge | 3.5.0 | Utilities | Tailwind class conflict resolver |
| react-hook-form | 7.73.1 | Forms | Form state management |
| @hookform/resolvers | 5.2.2 | Forms | Zod → React Hook Form bridge |
| zod | 4.3.6 | Validation | Schema validation |
| @supabase/supabase-js | 2.105.1 | Auth/DB | Supabase client |
| react-qr-code | 2.0.18 | QR | QR code display component |
| qrcode | 1.5.4 | QR | QR code generation |
| @zxing/browser | 0.2.0 | QR | Browser-based QR scanner |
| @zxing/library | 0.22.0 | QR | ZXing barcode decoding |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | 9.x | JavaScript/TypeScript linter |
| eslint-config-next | 16.x | Next.js ESLint ruleset |
| @typescript-eslint/* | latest | TypeScript ESLint rules |
| prettier | 3.3.3 | Code formatter |
| husky | latest | Git hooks |
| lint-staged | 16.2.7 | Pre-commit file linting |
| commitlint | latest | Commit message validation |

---

## Mobile — Flutter

| Property | Value |
|----------|-------|
| Framework | Flutter |
| Version | 3.10.1+ |
| Language | Dart 3.10.1+ |
| State Management | Provider pattern |
| HTTP Client | Dio |
| Navigation | go_router |
| Build Targets | Android, iOS |

---

## Flutter — All Packages (pubspec.yaml)

### Dependencies

| Package | Version | Category | Purpose |
|---------|---------|----------|---------|
| flutter | SDK | Framework | Flutter SDK |
| provider | 6.1.5 | State | ChangeNotifier state management |
| dio | 5.9.0 | Networking | HTTP client with interceptors |
| go_router | 16.2.1 | Navigation | Declarative URL-based routing |
| firebase_core | 3.0.0 | Firebase | Firebase SDK base |
| firebase_messaging | 15.0.0 | Firebase | Push notifications (FCM) |
| flutter_local_notifications | 21.0.0 | Notifications | Local in-app notifications |
| flutter_secure_storage | 9.2.4 | Security | Encrypted token storage |
| local_auth | 3.0.1 | Security | Biometric authentication |
| shared_preferences | 2.5.3 | Storage | Key-value persistent storage |
| google_fonts | 6.2.1 | UI | Google Fonts integration |
| animations | 2.0.11 | UI | Material motion transitions |
| pinput | 6.0.2 | UI | OTP pin input component |
| cupertino_icons | 1.0.8 | UI | iOS-style icon set |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| flutter_test | SDK | Flutter testing framework |
| flutter_lints | latest | Recommended lint rules |

---

## DevOps & Containerization

### Docker

| Component | Image/Tool | Version | Purpose |
|-----------|-----------|---------|---------|
| Docker Engine | — | Latest | Container runtime |
| Docker Compose | — | Latest | Multi-container orchestration |
| backend image | node:20-alpine | 20-alpine | Backend container base |
| frontend image | node:20-alpine | 20-alpine | Frontend container base |
| redis image | redis:alpine | 7-alpine | Redis container |

### Docker Compose Files

| File | Environment | Features |
|------|-------------|---------|
| `docker-compose.dev.yml` | Development | Volume mounts, hot reload, debug ports |
| `docker-compose.yml` | Production | Compiled output, no source mounts |

### Exposed Ports

| Service | Internal Port | External Port |
|---------|-------------|--------------|
| backend | 5000 | 5000 |
| frontend | 3000 | 3000 |
| redis | 6379 | 6379 |

### Docker Volumes

| Volume | Purpose |
|--------|---------|
| `redis_data` | Redis data persistence across restarts |
| Source mounts (dev only) | Live code reload during development |

---

## Code Quality & Tooling

| Tool | Version | Scope | Purpose |
|------|---------|-------|---------|
| ESLint | 9.x | Frontend | JavaScript/TypeScript linting |
| eslint-config-next | 16.x | Frontend | Next.js specific rules |
| @typescript-eslint | latest | Frontend | TypeScript lint rules |
| Prettier | 3.3.3 | All (JS/TS) | Opinionated code formatting |
| Husky | latest | Root | Git hooks manager |
| lint-staged | 16.2.7 | Root | Run linters on staged files only |
| commitlint | latest | Root | Enforce Conventional Commits |
| TypeScript | 5.9.3 | Backend + Web | Static type checking |
| flutter_lints | latest | Flutter | Dart/Flutter lint rules |

### Pre-commit Hook Flow

```
git commit
  → husky pre-commit
    → lint-staged
      → ESLint --fix (*.ts, *.tsx)
      → Prettier --write (all staged files)
  → commitlint (commit message check)
```

### Conventional Commit Types

| Type | Use Case |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependency updates |
| `docs` | Documentation |
| `style` | Formatting (no logic change) |
| `refactor` | Code restructure |
| `test` | Adding/updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

---

## Testing

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 29.7.0 | Test runner + assertion library |
| ts-jest | 29.4.9 | TypeScript → Jest transpiler |
| supertest | 7.2.2 | HTTP integration tests |
| flutter_test | SDK | Flutter unit & widget tests |

### Coverage Thresholds (Backend)

| Metric | Minimum |
|--------|---------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

---

## External APIs & Cloud Services

| Service | Category | Usage |
|---------|----------|-------|
| **Supabase** | Database + Auth + Storage | Managed PostgreSQL, user auth, file storage |
| **Firebase / FCM** | Push Notifications | Mobile push notification delivery |
| **OpenAI API** | AI | GPT models for chat completions |
| **Google Gemini API** | AI | Gemini Pro for RAG Q&A |
| **Anthropic Claude API** | AI | Claude for policy document interpretation |
| **Resend** | Email | Transactional email (OTP, notifications) |
| **Vercel** | Hosting | Next.js frontend deployment + CDN |

---

## Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable | Required | Purpose |
|---------|---------|---------|
| `PORT` | Yes | Server listen port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | Supabase PgBouncer connection URL |
| `DIRECT_URL` | Yes | Supabase direct connection URL (migrations) |
| `REDIS_URL` | Yes | Redis connection string |
| `REDIS_DEFAULT_TTL` | No | Default cache TTL (seconds, default: 120) |
| `JWT_SECRET` | Yes | JWT signing key (min 32 characters) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin) |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `RESEND_FROM_EMAIL` | Yes | Sender email (noreply@mg.methum.space) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project identifier |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Firebase service account JSON (stringified) |
| `WEB_URL` | Yes | Frontend URL (for CORS + email links) |
| `FLUTTER_ORIGIN` | Yes | Flutter app origin (for CORS) |

### Frontend (`apps/frontend/.env.local`)

| Variable | Required | Purpose |
|---------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client-side) |

---

## Package Count Summary

| Layer | Production Deps | Dev Deps | Total |
|-------|----------------|---------|-------|
| Backend (npm) | 23 | 13 | 36 |
| Frontend (npm) | 19 | 8 | 27 |
| Flutter (pub) | 14 | 2 | 16 |
| **Total** | **56** | **23** | **79** |

---

*Generated from live codebase — May 2026*
