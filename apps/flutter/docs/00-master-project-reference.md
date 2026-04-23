# 00 — Master Project Reference



---

## Document Index

| # | Document | Description |
|---|----------|-------------|
| 00 | [00-master-project-reference](./00-master-proje> School Connect — AI-Powered School-to-Parent Communication Platform
> Student: Wedin Pathirana | Plymouth Index: 10952453
> Module: PUSL3190 Final Year Project
> Supervisor: Ms. Dulanjali Wijesekara
> Last Updated: March 2026ct-reference.md) | This file — project overview and quick reference |
| 01 | [01-system-architecture](./01-system-architecture.md) | Full system overview, tech stack, deployment |
| 02 | [02-database-schema](./02-database-schema.md) | All Supabase tables, relationships, indexes |
| 03 | [03-api-endpoints](./03-api-endpoints.md) | All REST API endpoints with request/response |
| 04 | [04-backend-structure](./04-backend-structure.md) | Fastify backend folder structure and patterns |
| 05 | [05-realtime-channels](./05-realtime-channels.md) | Supabase Realtime + Firebase FCM strategy |
| 06 | [06-auth-flow](./06-auth-flow.md) | Full authentication flows for all roles |
| 07 | [07-data-flow](./07-data-flow.md) | How data moves through each major feature |
| 08 | [08-flutter-app-structure](./08-flutter-app-structure.md) | MVVM Flutter structure for parent app |
| 09 | [09-sprint-timeline](./09-sprint-timeline.md) | Week-by-week development plan |
| 10 | [10-production-readiness](./10-production-readiness.md) | Deployment, security, and production checklist |

---

## Project Summary

School Connect is an AI-powered school-to-parent communication and monitoring platform designed for the Sri Lankan school context. It connects teachers and school administration directly with parents through real-time attendance tracking, gate entry/exit notifications, structured messaging, and an AI school policy assistant powered by RAG.

The system was pivoted from a university communication platform (Universe) and is purpose-built for the Sri Lankan school environment where students are prohibited from using mobile phones on school premises.

---

## Confirmed Tech Stack

```
Backend  : Node.js + Fastify (TypeScript)
Web      : Next.js 14 + shadcn/ui + Tailwind CSS (TypeScript)
Mobile   : Flutter (Dart) — MVVM architecture
Database : Supabase (PostgreSQL + pgvector + Auth + Storage + Realtime)
Push     : Firebase FCM
AI       : OpenAI (gpt-4o-mini + text-embedding-3-small)
Deploy   : Vercel (web) + Railway (backend) + Supabase Cloud
```

---

## Confirmed User Roles

| Role | Platform | Created By | Notes |
|------|----------|------------|-------|
| admin | Next.js web dashboard | DB seed (first) / Admin promotes | Highest privilege |
| teacher | Next.js web dashboard | Self-register → admin promotes + assigns class | |
| security | Next.js web — gate page only | Self-register → admin promotes | Gate page only, middleware-enforced |
| parent | Flutter mobile app | Self-register → Student ID + email OTP | Primary mobile user |

> **No student role.** Students are banned from using mobile phones during school hours in Sri Lanka. All student-related data is accessed by parents through their linked parent account.

---

## Role Feature Summary

### Admin (Next.js Web — 37 features)
- Auth: login, forgot password, change password, all-sessions logout
- User management: approve pending accounts (teacher/security/admin), suspend, delete, re-link parent
- School structure: grades, classes, student records (auto-generates student_id_no + qr_code), terms, lock terms
- Gate oversight: school-wide log with late/manual filters, analytics, discrepancy alerts, student profile
- Attendance oversight: grade/class/all filter, AI 3+ consecutive absence alerts
- Announcements: 3 audience targets (School Wide / Parents Only / Staff Only), RAG upload+edit+delete, content moderation (delete any teacher post or L&F post)
- Complaints: assign to teacher, resolve directly, audit trail
- Student profile: unified view of gate log + attendance + published grades

### Teacher (Next.js Web — 45 features)
- Auth: self-register, OTP once, pending lock, admin promotes + assigns class, 7-day JWT, all-sessions logout
- My Classrooms: assigned class list, student list, student details, parent link status, search, message parent shortcut
- Attendance: create daily session (no session = school holiday), gate-aware marking screen, P/A/L, auto FCM on absent, same-day edit, view by date, student range search, excuse note view
- Messaging: inbox, send/receive, FCM on reply, AI-assisted message drafting
- Announcements: post class announcements, view School Wide + Staff Only (NOT Parents Only)
- Grades: create/edit/delete own modules, enter 0-100 scores, auto letter grade (A/B/C/D/F), save draft, publish all, unpublish before term lock
- Complaints: view assigned, FCM when assigned, update status with reply note (no chat)
- Lost & Found: post found items, manage posts, mark as collected

### Parent (Flutter Mobile — 36 features)
- Auth: register + Student ID + email OTP (mobile fallback) + biometric + multi-child switcher + logout
- Gate: IN/OUT FCM push, gate log history
- Attendance: absent FCM, history, monthly summary, submit excuse note
- Messaging: inbox, send/receive messages with teacher, FCM on reply
- AI Policy Bot (RAG): natural language questions answered from school PDFs, public Q&A, low-confidence fallback
- Announcements: feed, FCM push, notification panel, tap-to-navigate, preferences
- Complaints: submit (6 categories), my list, complaint detail view
- Lost & Found: browse found items board, report lost item, my lost reports, FCM on new found item
- Profile: edit name/avatar, change password, biometric toggle, 5 colour themes, view child grades, view timetable

### Security Guard (Next.js Web — gate page only)
- Auth: self-register, OTP once, pending lock, admin promotes to security role, 7-day JWT
- Gate page: QR card scanning (auto-submit on scan), manual entry with student search + photo verification, confirm/deny entry, live gate log for today
- Middleware enforces: security role can only access /gate — all other routes redirect back to /gate

---

## Key Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Backend framework | Fastify | 2x Express performance, native TypeScript, built-in schema validation |
| Database | Supabase only | pgvector for RAG, Auth + Storage + Realtime in one service |
| Push notifications | Firebase FCM | Industry standard, Flutter native support |
| Mobile architecture | MVVM | Clean separation of concerns, industry standard |
| Repo structure | Two repos | Familiar workflow, clear separation, Docker orchestration |
| Web UI library | shadcn/ui | Accessible, composable, industry standard |
| AI model | gpt-4o-mini | Cost-effective, sufficient quality for school policy Q&A |
| Embeddings | text-embedding-3-small | Best cost/quality ratio, 1536 dimensions |
| Auth token — web | HTTP-only cookie | XSS protection |
| Auth token — mobile | flutter_secure_storage | Encrypted device storage |
| JWT expiry | 7 days + silent refresh | Stays logged in on school devices, 30-day is insecure |
| OTP | Registration only | No OTP on daily login — reduces friction for teachers |
| Gate authentication | Role-based JWT + middleware | Security role → /gate only, no PIN/kiosk needed |
| RAG involvement | Admin + Parent only | Teacher has no RAG involvement — clean responsibility boundary |

---

## Repo Structure

```
school-connect-platform/      → GitHub Repo 1
├── frontend/                 → Next.js web dashboard (admin, teacher, security)
├── backend/                  → Fastify API
├── docker-compose.yml
├── docker-compose.dev.yml
└── docs/                     → All .md reference documents (this folder)

school-connect-flutter/       → GitHub Repo 2
└── lib/                      → Flutter mobile app (parent)
```

---

## Database Overview (key tables)

```
users                   → all accounts across all roles
students                → student records (created by admin, not login accounts)
parent_students         → links parent accounts to student records (UNIQUE student_id)
gate_events             → every IN/OUT scan at gate
attendance_sessions     → one per class per day (teacher creates)
attendance_records      → P/A/L per student per session
modules                 → teacher-created grade modules (not school structure)
grades                  → scores per student per module per term
terms                   → academic terms (admin-managed)
messages                → parent ↔ teacher threads
announcements           → school-wide and class-level posts
complaints              → parent-submitted, admin-managed
policy_documents        → admin-uploaded PDFs for RAG
document_chunks         → pgvector embeddings from policy PDFs
lost_found_items        → found items posted by teacher/admin
lost_found_reports      → lost item reports from parents
notifications           → all in-app notification records
```

---

## RAG System Overview

```
Admin uploads school policy PDFs (handbook, fees, uniform, term calendar)
        ↓
Backend pipeline:
    PDF → extract text (pdf-parse)
    → chunk (500 tokens, 50 overlap)
    → embed (text-embedding-3-small, 1536 dimensions)
    → store in pgvector (document_chunks table)
        ↓
Parent asks question in Flutter app
        ↓
Backend:
    embed question → cosine similarity search → top 5 chunks
    → build prompt with context → gpt-4o-mini → answer
        ↓
If similarity score below threshold → fallback message:
    "We could not find an answer in our documents.
     Please contact the school office directly."
        ↓
Public Q&A knowledge base shows past answered questions
```

> RAG is ONLY between admin (uploads) and parents (asks). Teachers have zero involvement.

---

## Gate System Overview

```
Admin creates student record → system auto-generates:
    student_id_no (e.g. SCH-2026-0042)  ← printed on physical ID card
    qr_code (UUID)                       ← printed as QR on physical ID card

Security guard logs into web app → middleware redirects to /gate only

Normal flow:
    Student holds card to USB QR scanner
    → Scanner auto-fills input field
    → POST /api/gate/scan
    → gate_events row inserted
    → FCM fires to linked parent instantly

Manual flow (forgot card):
    Security guard searches student by name or ID
    → Student photo from Supabase Storage shown on screen
    → Guard confirms face match
    → Selects reason (forgot card / lost card / damaged / new student)
    → POST /api/gate/scan with method: manual
    → Same gate_events row, parent FCM fires

Admin oversight:
    → View full gate log filtered by late arrivals, manual entries, reason
    → Gate vs attendance discrepancy alerts (scanned in but marked absent)
    → Student unified profile: gate log + attendance + grades
```

---

## Viva Preparation — Key Questions

```
Architecture:
Q: Why Fastify over Express?
A: Native TypeScript, built-in schema validation, 2x faster throughput,
   better performance under concurrent requests

Q: Why Supabase only (no MongoDB)?
A: pgvector handles vector storage for RAG, JSONB handles unstructured data,
   Auth + Storage + Realtime included — one service eliminates infrastructure complexity

Q: Why no student role?
A: Students are banned from phones in Sri Lankan schools.
   Every student-facing feature (attendance, grades, gate) is accessed by the parent
   through their linked account. Removing the student role produces a cleaner
   3+1 role system and is consistent with the no-phone policy.

Auth:
Q: Why OTP only at registration, not daily login?
A: OTP at registration proves email ownership once.
   Daily JWT with 7-day silent refresh keeps teachers logged in on
   their school computers without friction. This is how Gmail and Slack work.

Q: How is RBAC implemented?
A: JWT payload contains role. RBAC middleware on every protected route
   checks role against a permission matrix before the controller runs.
   Security role uses Next.js middleware to redirect all non-/gate routes.

Gate:
Q: Why physical QR card instead of phone-based QR?
A: Students cannot use phones on school premises.
   Physical card is the only viable option. Same security model as
   RFID school cards used globally. Photo verification on manual entries
   provides the identity check.

Q: How is the gate page secured?
A: Security guard logs in with their own credentials.
   Middleware checks role === 'security' and redirects all other routes to /gate.
   Gate page token only permits POST /api/gate/scan and GET /api/gate/photo.

RAG:
Q: How does the AI policy bot work?
A: Admin uploads school policy PDFs → pdf-parse extracts text →
   chunked (500 tokens, 50 overlap) → embedded (text-embedding-3-small) →
   stored in pgvector. Parent asks question → embedded → cosine similarity
   search → top 5 chunks → GPT prompt with context → answer.
   Low similarity score → fallback message, no hallucination.

Q: What stops the AI from hallucinating?
A: RAG grounds every answer in retrieved document chunks.
   If the similarity score is below a threshold, a fallback message is shown
   rather than allowing GPT to answer from general knowledge.
```
