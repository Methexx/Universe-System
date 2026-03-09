# 00 — Master Project Reference

> Universe Platform — AI-Powered University Communication System
> Last Updated: March 2026

---

## Quick Reference

| Document | Description |
|----------|-------------|
| [01-system-architecture](./01-system-architecture.md) | Full system overview, tech stack, deployment |
| [02-database-schema](./02-database-schema.md) | All Supabase tables, relationships, indexes |
| [03-api-endpoints](./03-api-endpoints.md) | All REST API endpoints with request/response |
| [04-backend-structure](./04-backend-structure.md) | Fastify backend folder structure |
| [05-realtime-channels](./05-realtime-channels.md) | Supabase Realtime + Firebase FCM strategy |
| [06-auth-flow](./06-auth-flow.md) | Full authentication flows for all roles |
| [07-data-flow](./07-data-flow.md) | How data moves through each feature |
| [08-flutter-app-structure](./08-flutter-app-structure.md) | MVVM Flutter structure |
| [09-sprint-timeline](./09-sprint-timeline.md) | Week by week development plan |
| [10-production-readiness](./10-production-readiness.md) | Deployment + security checklist |

---

## Confirmed Tech Stack

```
Backend  : Node.js + Fastify (TypeScript)
Web      : Next.js 14 + shadcn/ui + Tailwind (TypeScript)
Mobile   : Flutter (Dart) — MVVM architecture
Database : Supabase (PostgreSQL + pgvector + Auth + Storage + Realtime)
Push     : Firebase FCM
AI       : OpenAI (gpt-4o-mini + text-embedding-3-small)
Deploy   : Vercel (web) + Railway (backend) + Supabase Cloud
```

---

## Confirmed User Roles

| Role | Description | Created By |
|------|-------------|------------|
| demo | Newly registered, unverified | Self-register |
| student | Verified university student | OTP verified |
| lecturer | Teaching staff | Admin promoted |
| admin | System administrator | Seeded / Admin promoted |

---

## Confirmed Features

### Student (Flutter Mobile)
- [x] Register with @students.nsbm.ac.lk email + OTP
- [x] Academic profile setup (mandatory)
- [x] Dashboard with auto-sliding announcements
- [x] Ask questions with AI RAG answers
- [x] Escalate questions to lecturer
- [x] View public Q&A knowledge base
- [x] Scan QR code for attendance
- [x] View own attendance history
- [x] Submit complaints with category
- [x] View own complaint history
- [x] Receive push notifications
- [x] AI chat (local, private)
- [x] 5 color themes (device-local)
- [x] Biometric login (after setup)
- [x] Request academic profile change
- [x] Settings screen (full)

### Lecturer (Next.js Web Dashboard)
- [x] Register + OTP + admin promotion
- [x] Upload module PDFs (for RAG)
- [x] View and answer escalated questions
- [x] Create QR attendance sessions
- [x] View live + historical attendance
- [x] Create module announcements
- [x] Send notifications to module students
- [x] View assigned complaints
- [x] AI chat
- [x] Dark/light theme

### Admin (Next.js Web Dashboard)
- [x] Seeded first admin
- [x] Manage users (role promotion)
- [x] Create faculties, degrees, modules
- [x] Assign lecturers to modules
- [x] View all complaints + assign to lecturer
- [x] Approve/reject academic change requests
- [x] Post university-wide announcements
- [x] Send notifications (all students / all lecturers / all users)
- [x] View attendance charts (per module per day)
- [x] Dark/light theme

---

## Confirmed Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Backend framework | Fastify | Performance, native TypeScript |
| Database | Supabase only | Replaces PostgreSQL + MongoDB + Auth |
| Push notifications | Firebase FCM | Industry standard for Flutter |
| Mobile architecture | MVVM | Clean, industry standard |
| Monorepo vs separate | Two repos | Familiar, practical |
| Web UI library | shadcn/ui | Industry standard, accessible |
| AI model | gpt-4o-mini | Cost effective, sufficient quality |
| Embeddings | text-embedding-3-small | Best cost/quality ratio |

---

## Repo Structure

```
universe-platform/          → GitHub Repo 1
├── frontend/               → Next.js web dashboard
├── backend/                → Fastify API
├── docker-compose.yml
├── docker-compose.dev.yml
└── Doc/                    → All documents here

universe-flutter/           → GitHub Repo 2
└── lib/                    → Flutter mobile app
```

---

## Key Business Objectives (From PID)

1. Improve student satisfaction by 15% in one academic year
2. Reduce staff communication workload by 30% in 6 months
3. Achieve median first-response under 24 hours for 85% of queries
4. Ensure 90% of complaints logged and resolved within 10 working days
5. AI assistant answers 60-70% of routine questions without lecturer
6. Support quality assurance and accreditation documentation

---

## Viva Preparation — Key Questions to Prepare

```
Architecture:
Q: Why Fastify over Express?
A: Native TypeScript, 2x faster, built-in schema validation,
   better performance test results

Q: Why Supabase over separate PostgreSQL + MongoDB?
A: Single service, pgvector built-in, Auth + Storage included,
   Realtime out of the box, reduces infrastructure complexity

Q: Why two repos instead of monorepo?
A: Familiar workflow, clear separation, Docker handles
   orchestration, simpler CI/CD

Auth:
Q: How does OTP verification work?
A: 6-digit code, 10 min expiry, 3 max attempts,
   sent via Supabase Auth email

Q: How is RBAC implemented?
A: JWT payload contains role, middleware checks role
   against route permission matrix before every request

RAG:
Q: How does the AI answer student questions?
A: PDF → extract → chunk → embed → store in pgvector
   Question → embed → similarity search → top 5 chunks
   → GPT prompt with context → answer

Q: What if AI gives wrong answer?
A: Student can escalate to lecturer, fallback message shown,
   lecturer answer overrides AI answer publicly
```
