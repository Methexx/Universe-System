# 09 — Sprint Timeline

## Overview

6-week backend-first development plan followed by parallel frontend development. Each sprint is one week with clear deliverables. Agile approach with daily progress tracking.

---

## Development Phases

```
Phase 1 (Weeks 1-6)  → Backend API complete
Phase 2 (Weeks 7-9)  → Next.js Web Dashboard
Phase 3 (Weeks 10-12)→ Flutter Mobile App
Phase 4 (Week 13)    → Integration + Testing
Phase 5 (Week 14)    → Documentation + Submission
```

---

## Phase 1 — Backend (Weeks 1–6)

### Week 1 — Foundation
```
Tasks:
    ✅ Supabase project setup
    ✅ Database schema creation (all tables)
    ✅ pgvector extension enabled
    ✅ Supabase Auth configured
    ✅ Environment variables configured
    ✅ Backend folder structure created
    ✅ config/ files (supabase.ts, openai.ts, firebase.ts)
    ✅ Common middleware (authenticate.ts, rbac.ts, errorHandler.ts)
    ✅ Common utils (jwt.ts, otp.ts, response.ts)

Deliverable: Backend running, DB connected, middleware working
```

### Week 2 — Auth + Users + Academic
```
Tasks:
    → Auth module (register, OTP, login, logout, refresh)
    → Email domain validation (@students.nsbm.ac.lk)
    → OTP generation and verification
    → JWT generation and validation
    → Users module (CRUD, role management)
    → Academic profile module
    → Auto module enrollment on profile setup
    → Account expiry logic
    → Academic change request flow

Deliverable: Full auth flow working end-to-end
             POST /auth/register → OTP → login → JWT
```

### Week 3 — Admin + Faculty + Modules
```
Tasks:
    → Admin module (faculty CRUD, degree CRUD, module CRUD)
    → Lecturer assignment to modules
    → Admin seed script
    → Role promotion endpoints
    → User management endpoints

Deliverable: Admin can manage full academic structure
```

### Week 4 — Questions + RAG Pipeline
```
Tasks:
    → Questions module (ask, escalate, resolve, answer)
    → PDF upload to Supabase Storage
    → PDF text extraction (pdf-parse)
    → Text chunking logic
    → OpenAI embeddings integration
    → pgvector similarity search
    → RAG answer generation
    → Fallback when no context found

Deliverable: Full RAG pipeline working
             Upload PDF → ask question → get AI answer
```

### Week 5 — Attendance + Complaints + Announcements
```
Tasks:
    → Attendance session creation
    → QR code generation (qrcode package)
    → QR scan validation (15 min expiry)
    → Attendance records
    → Attendance history endpoints
    → Complaints submission and assignment
    → Announcements CRUD
    → Target audience filtering

Deliverable: Attendance, complaints, announcements all working
```

### Week 6 — Notifications + AI Chat + Testing
```
Tasks:
    → Firebase Admin SDK integration
    → FCM token management
    → Topic subscriptions
    → Push notification sending (all trigger points)
    → Supabase Realtime channel setup
    → AI chat endpoint (OpenAI gpt-4o-mini)
    → Jest unit tests for all modules
    → API integration tests
    → Bug fixes

Deliverable: Backend 100% complete and tested
             All endpoints documented and verified
```

---

## Phase 2 — Next.js Web Dashboard (Weeks 7–9)

### Week 7 — Auth + Layout + Dashboard
```
Tasks:
    → shadcn/ui setup
    → Dark/light theme
    → Auth pages (login, OTP verification)
    → Sidebar layout
    → Lecturer dashboard home
    → Admin dashboard home

Deliverable: Login working, dashboard layout complete
```

### Week 8 — Lecturer Features
```
Tasks:
    → My Modules page
    → PDF upload interface
    → Escalated questions management
    → Answer questions (public/private)
    → QR attendance session creation
    → Live attendance view (Supabase Realtime)
    → Module announcements
    → Send notifications to module students

Deliverable: Full lecturer workflow working
```

### Week 9 — Admin Features
```
Tasks:
    → User management (role promotion)
    → Faculty/degree/module management
    → Lecturer assignment
    → Complaints management + assignment
    → Attendance charts (per module per day)
    → Academic change request management
    → Send notifications (all users/lecturers)

Deliverable: Full admin workflow working
```

---

## Phase 3 — Flutter Mobile App (Weeks 10–12)

### Week 10 — Auth + Profile + Dashboard
```
Tasks:
    → Project setup, dependencies
    → MVVM structure
    → Splash screen
    → Login, register, OTP screens
    → Academic profile setup screen
    → Student dashboard (announcements, quick actions)
    → Bottom navigation
    → Theme system (5 colors)

Deliverable: Login → Profile setup → Dashboard working
```

### Week 11 — Core Student Features
```
Tasks:
    → Questions screen (module select, common Q&A)
    → Ask question + AI answer display
    → Escalate to lecturer
    → QR scanner screen
    → Attendance history screen
    → Complaints submission screen
    → Complaint history screen
    → Announcements detail screen

Deliverable: All core student features working
```

### Week 12 — Notifications + AI Chat + Settings
```
Tasks:
    → Notifications panel screen
    → Firebase FCM setup (receive)
    → Supabase Realtime subscriptions
    → Notification navigation on tap
    → AI chat screen
    → Local chat history storage
    → Profile screen
    → Settings screen (full implementation)
    → Biometric setup
    → Academic change request submission

Deliverable: Complete Flutter app working end-to-end
```

---

## Phase 4 — Integration + Testing (Week 13)

```
Tasks:
    → Full end-to-end testing (all three apps)
    → Performance testing (50-100 concurrent users)
    → RAG accuracy testing (target: 60%+)
    → Security testing (JWT, RBAC)
    → Bug fixes
    → User acceptance testing (5-10 test users)

Deliverable: Stable, tested system
```

---

## Phase 5 — Documentation + Submission (Week 14)

```
Tasks:
    → Final project report
    → Update all technical documents
    → API documentation review
    → Code cleanup + comments
    → Deployment to Vercel + Railway
    → Demo preparation for viva
    → Presentation preparation

Deliverable: Submission-ready project
```

---

## Priority Order (If Time Gets Tight)

```
MUST COMPLETE (core marks):
    1. Auth system
    2. Academic profile
    3. Ask question + RAG
    4. Announcements
    5. Complaint submission
    6. QR Attendance

SHOULD COMPLETE (extra marks):
    7. Push notifications
    8. AI Chat
    9. Admin analytics/charts
    10. Settings full implementation

NICE TO HAVE (if time allows):
    11. Biometric login
    12. Account expiry flow
    13. Language support
    14. Theme system
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| RAG accuracy below 60% | High | Test early in Week 4, tune chunking strategy |
| OpenAI API costs | Medium | Use gpt-4o-mini, set usage limits |
| Flutter-backend integration issues | Medium | Test API in Postman before Flutter |
| Time overrun on backend | High | Prioritize must-have features strictly |
| Firebase FCM setup complexity | Low | Follow official Flutter Firebase docs |
