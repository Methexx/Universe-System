# 01 — System Architecture

> School Connect — AI-Powered School-to-Parent Communication Platform

---

## Architecture Type

```
Client–Server RESTful Architecture
with Role-Based Access Control (RBAC)
```

---

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                │
│                                                                  │
│  ┌──────────────────┐        ┌──────────────────────────────┐   │
│  │  Flutter Mobile  │        │    Next.js Web Dashboard     │   │
│  │  (Parents only)  │        │  (Admin, Teacher, Security)  │   │
│  └────────┬─────────┘        └─────────────┬────────────────┘   │
│           │ REST API                        │ REST API           │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
            ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                       BACKEND API LAYER                          │
│                                                                  │
│                  Node.js + Fastify (TypeScript)                  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │   Auth   │ │  Users   │ │  Gate    │ │   Attendance     │   │
│  │  Module  │ │  Module  │ │  Module  │ │     Module       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Messages  │ │Announce- │ │Complaints│ │    AI / RAG      │   │
│  │  Module  │ │  ments   │ │  Module  │ │     Module       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Grades  │ │Lost+Found│ │Students  │ │  Notifications   │   │
│  │  Module  │ │  Module  │ │  Module  │ │     Module       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                                                                  │
│                  RBAC Middleware (all routes)                    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────────┐
│   Supabase   │ │ Firebase │ │      OpenAI API       │
│              │ │   FCM    │ │                       │
│ • PostgreSQL │ │          │ │  • text-embedding-    │
│ • pgvector   │ │  Push    │ │    3-small (RAG)      │
│ • Auth       │ │  Notif.  │ │  • gpt-4o-mini        │
│ • Storage    │ └──────────┘ │    (policy answers)   │
│ • Realtime   │              └──────────────────────┘
└──────────────┘
```

---

## Two Repository Structure

```
school-connect-platform/      → Web Dashboard + Backend API
├── frontend/                 → Next.js (Admin, Teacher, Security)
├── backend/                  → Node.js + Fastify API
├── docker-compose.yml
└── docker-compose.dev.yml

school-connect-flutter/       → Flutter Mobile App (Parents)
```

---

## Technology Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 | Server runtime |
| Framework | Fastify | HTTP framework — 2x Express performance |
| Language | TypeScript | Type safety throughout |
| Validation | Zod | Request schema validation |
| Auth | Custom JWT + bcrypt | JWT generation, password hashing |
| Email | Nodemailer | OTP email delivery |
| PDF | pdf-parse | Text extraction from policy PDFs |

### Frontend — Web (Admin, Teacher, Security)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Web dashboard |
| Language | TypeScript | Type safety |
| UI Library | shadcn/ui | Accessible component library |
| Styling | Tailwind CSS | Utility-first styling |
| Theme | Dark / Light | System preference + user toggle |
| Auth Storage | HTTP-only cookie | XSS-safe JWT storage |

### Frontend — Mobile (Parents)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Flutter (Dart) | Cross-platform mobile app |
| Architecture | MVVM | Clean separation of concerns |
| Auth Storage | flutter_secure_storage | Encrypted JWT storage |
| Biometric | local_auth | Fingerprint / face ID login |
| Notifications | firebase_messaging | Receive FCM push notifications |
| State | Provider | State management |
| HTTP | Dio | HTTP client |
| Routing | go_router | Declarative navigation |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| PostgreSQL + extensions | Supabase | Primary database |
| pgvector | Supabase extension | Vector similarity search for RAG |
| Auth | Supabase Auth | Email OTP delivery |
| Storage | Supabase Storage | PDF documents, student photos |
| Realtime | Supabase Realtime | Live gate log updates |
| Push notifications | Firebase FCM | Background push to parent phones |
| AI embeddings | OpenAI | text-embedding-3-small (1536 dim) |
| AI chat | OpenAI | gpt-4o-mini for RAG answers |
| Dev orchestration | Docker | Local development environment |
| Web hosting | Vercel | Next.js dashboard deployment |
| API hosting | Railway | Fastify backend deployment |

---

## Deployment Architecture

```
Production:

┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐
│     Vercel      │    │    Railway      │    │  Supabase    │
│                 │    │                 │    │   Cloud      │
│  Next.js 14     │───▶│  Fastify API    │───▶│              │
│  Web Dashboard  │    │  Node.js 20     │    │  PostgreSQL  │
│                 │    │  Docker         │    │  pgvector    │
└─────────────────┘    └────────┬────────┘    │  Storage     │
                                │             │  Realtime    │
                         ┌──────┴──────┐      └──────────────┘
                         │  Firebase   │
                         │    FCM      │      ┌──────────────┐
                         │             │      │  OpenAI API  │
                         └─────────────┘      └──────────────┘

Development:

docker-compose.dev.yml
├── frontend (Next.js)  → localhost:3000
└── backend (Fastify)   → localhost:5000
    └── connects to Supabase Cloud (dev project)
```

---

## Security Architecture

```
1. Transport       → HTTPS/TLS on all production connections
2. Authentication  → Custom JWT (7-day expiry, silent refresh)
3. Authorization   → RBAC middleware on every protected route
4. Token Storage   → HTTP-only cookie (web, sameSite: strict)
                     flutter_secure_storage (mobile, encrypted)
5. OTP             → 6-digit, 10-minute expiry, max 3 attempts, registration only
6. Biometric       → Device-level only (Flutter, local_auth)
7. File Upload     → Supabase Storage, signed URLs for access
8. Gate page       → Security role enforced by Next.js middleware
                     All non-/gate routes redirect to /gate
9. Gate API        → Gate JWT scope limited to scan + photo endpoints only
10. Password       → bcrypt hashed, never stored in plain text
```

---

## User Roles and Access

| Role | Platform | Created By | Middleware Enforcement |
|------|----------|------------|----------------------|
| admin | Next.js web — full dashboard | DB seed (first admin) or promoted by existing admin | Full access |
| teacher | Next.js web — full dashboard | Self-register → pending → admin promotes + assigns class | Full access |
| security | Next.js web — /gate only | Self-register → pending → admin promotes to security | Redirected to /gate on all routes |
| parent | Flutter mobile | Self-register → Student ID + OTP → linked | Mobile only |

---

## RBAC Permission Matrix (API Level)

| Endpoint Group | admin | teacher | security | parent |
|----------------|-------|---------|----------|--------|
| /api/auth/* | ✅ | ✅ | ✅ | ✅ |
| /api/gate/scan | ✅ | ❌ | ✅ | ❌ |
| /api/gate/photo | ✅ | ❌ | ✅ | ❌ |
| /api/gate/log | ✅ | ❌ | ❌ | ❌ |
| /api/attendance/session | ❌ | ✅ | ❌ | ❌ |
| /api/attendance/records | ✅ | ✅ own class | ❌ | ✅ own child |
| /api/messages | ✅ view | ✅ | ❌ | ✅ |
| /api/announcements/post | ✅ | ✅ class only | ❌ | ❌ |
| /api/announcements/read | ✅ | ✅ | ❌ | ✅ |
| /api/complaints/submit | ❌ | ❌ | ❌ | ✅ |
| /api/complaints/manage | ✅ | ✅ assigned | ❌ | ❌ |
| /api/rag/upload | ✅ | ❌ | ❌ | ❌ |
| /api/rag/query | ❌ | ❌ | ❌ | ✅ |
| /api/grades/enter | ❌ | ✅ own class | ❌ | ❌ |
| /api/grades/view | ✅ per student | ✅ own class | ❌ | ✅ own child |
| /api/students/* | ✅ | ✅ own class | ❌ | ❌ |
| /api/users/manage | ✅ | ❌ | ❌ | ❌ |
| /api/admin/* | ✅ | ❌ | ❌ | ❌ |
