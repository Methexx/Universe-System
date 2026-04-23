# 09 — Sprint Timeline

> School Connect — Development Plan
> Total: 14 weeks | Backend-first approach

---

## Development Phases Overview

```
Phase 1 (Weeks 1–2)   → Foundation + Auth
Phase 2 (Weeks 3–5)   → Core Backend Modules
Phase 3 (Weeks 6–7)   → AI/RAG + Notifications
Phase 4 (Weeks 8–9)   → Next.js Web Dashboard (Admin + Teacher)
Phase 5 (Weeks 10–12) → Flutter Mobile App (Parent)
Phase 6 (Week 13)     → Integration + Testing
Phase 7 (Week 14)     → Documentation + Submission
```

---

## Phase 1 — Foundation + Auth (Weeks 1–2)

### Week 1 — Infrastructure Setup
```
Tasks:
  ✅ Supabase project created (dev + prod)
  ✅ All database tables created (02-database-schema.md)
  ✅ pgvector + uuid-ossp extensions enabled
  ✅ First admin seeded via SQL script
  ✅ Firebase project created, FCM configured
  ✅ OpenAI API key obtained, usage limits set
  ✅ Backend folder structure created (04-backend-structure.md)
  ✅ config/ files: supabase.ts, firebase.ts, openai.ts, env.ts
  ✅ Common middleware: authenticate.ts, rbac.ts, errorHandler.ts
  ✅ Common utils: jwt.ts, otp.ts, studentId.ts, gradeCalc.ts, fcm.ts
  ✅ Docker dev environment working
  ✅ ESLint, Prettier, Husky configured

Deliverable: Backend running, DB connected, middleware verified
```

### Week 2 — Auth Module Complete
```
Tasks:
  → POST /api/auth/register + OTP flow
  → POST /api/auth/verify-otp
  → POST /api/auth/login (email + password + JWT)
  → POST /api/auth/logout + logout-all (token_version bump)
  → POST /api/auth/forgot-password + reset-password
  → PUT /api/auth/link-child (Student ID + email OTP)
  → PUT /api/auth/fcm-token
  → All-sessions logout (token_version)
  → Users module (GET/PUT me, admin user management)
  → Admin: promote pending account to teacher/security/admin

Deliverable: Full auth flow tested in Postman
             Register → OTP → login → JWT working
             Parent: Student ID → email OTP → linked
             Admin: promote pending → staff gets email
```

---

## Phase 2 — Core Backend Modules (Weeks 3–5)

### Week 3 — School Structure + Gate
```
Tasks:
  → School module: grades, classes, student records
  → Student auto-generate: student_id_no + qr_code on CREATE
  → Student photo upload to Supabase Storage
  → Gate module:
      POST /api/gate/scan (QR + manual)
      GET /api/gate/photo/:studentId
      GET /api/gate/log (with filters: late, manual, reason, class, date)
      GET /api/gate/discrepancies
      GET /api/gate/analytics
  → FCM notification on gate scan → parent
  → Supabase Realtime: gate_events channel for live gate log

Deliverable: Gate scan → FCM fires to parent phone (tested end-to-end)
```

### Week 4 — Attendance + Messaging
```
Tasks:
  → Attendance module:
      POST /api/attendance/session (create daily session)
      GET session with gate_status per student
      PUT session (submit P/A/L records)
      Auto FCM on absent mark → parent
      Gate vs attendance discrepancy detection
      AI absence alert (3+ consecutive days) → admin
      PUT excuse note from parent
      GET attendance history (class + student + date range)
  → Messages module:
      GET inbox / thread
      POST send message (+ FCM to receiver)
      PUT mark as read
      POST ai-draft (attendance-context-aware)
  → Supabase Realtime: notifications channel per user

Deliverable: Attendance session created → gate-aware list →
             absent FCM fires → parent views history
```

### Week 5 — Announcements + Complaints + Grades
```
Tasks:
  → Announcements module:
      POST with scope (school_wide / class) + target
      GET filtered by user role
      DELETE (admin can delete any)
      FCM on new announcement
  → Complaints module:
      POST submit (parent)
      GET all with filters (admin)
      PUT assign to teacher + FCM
      PUT status update with reply note
  → Grades module:
      POST/PUT/DELETE teacher modules
      POST/PUT terms (admin)
      PUT activate/lock term (admin)
      GET/PUT grade sheet (draft)
      POST publish → FCM to parents
  → Terms: admin creates, teacher selects from dropdown

Deliverable: Full complaints flow, grade publish with FCM
```

---

## Phase 3 — AI/RAG + Notifications + Lost & Found (Weeks 6–7)

### Week 6 — RAG Pipeline + Lost & Found
```
Tasks:
  → RAG module:
      POST upload PDF (admin) → Supabase Storage
      Background pipeline: pdf-parse → chunk → embed → pgvector
      GET document list + processing status
      PUT rename / DELETE document + vector chunks
      POST query (parent) → embed → cosine search → GPT → answer
      Fallback if confidence < threshold
      GET public Q&A knowledge base
  → Lost & Found module:
      POST found item (teacher/admin) + FCM to parents with reports
      GET items board (parent)
      PUT collected
      POST lost report (parent)
      GET my reports
      PUT recovered

Deliverable: Upload PDF → ask question → AI answers correctly
             Lost item posted → parent with report gets FCM
```

### Week 7 — Notifications + Final Backend Testing
```
Tasks:
  → Notifications module (GET list, mark read, read-all)
  → All FCM trigger points verified and tested
  → Supabase Realtime channels verified
  → Jest unit tests for all modules
  → API integration tests (Postman collection exported)
  → Bug fixes and edge cases
  → Rate limiting on auth endpoints
  → Input sanitisation review

Deliverable: Backend 100% complete, all endpoints tested
```

---

## Phase 4 — Next.js Web Dashboard (Weeks 8–9)

### Week 8 — Admin Dashboard
```
Tasks:
  → shadcn/ui setup, Tailwind config, dark/light theme
  → Auth pages: login, forgot password
  → Pending approval screen (teacher/security waiting)
  → Admin dashboard layout + sidebar navigation
  → Users: pending list, approve + assign role, suspend, delete
  → School Structure: grades, classes, student records, terms
  → Student ID card export (QR + ID number)
  → Gate oversight: log with filters (late, manual, reason), analytics
  → Gate vs attendance discrepancy alerts
  → Student unified profile page (gate + attendance + grades)
  → Attendance: school-wide dashboard with grade/class filter
  → AI absence alerts on dashboard
  → Announcements: post with 3 targets, manage own, delete any teacher post
  → RAG: upload + rename + delete documents, processing status
  → Lost & Found: post items, delete any post, view parent reports

Deliverable: Full admin workflow working in browser
```

### Week 9 — Teacher Dashboard + Security Gate Page
```
Tasks:
  → Teacher dashboard layout (same shell as admin)
  → My Classrooms: assigned class cards, student list, student details
  → Parent link status indicator per student
  → Attendance: create daily session, gate-aware screen, submit
  → Attendance: view by date, search by student + date range
  → Messages: inbox, thread view, send, AI draft
  → Announcements: post class, view School Wide + Staff Only
  → Grades: manage modules, grade entry table, draft/publish/unpublish
  → Complaints: assigned list, FCM, update status with reply note
  → Lost & Found: post item, manage own posts, mark collected
  → Security guard: /gate page with QR + manual entry
  → Next.js middleware: security role → /gate redirect
  → Photo verification on manual entry

Deliverable: Teacher full workflow + security gate page working
```

---

## Phase 5 — Flutter Mobile App (Weeks 10–12)

### Week 10 — Auth + Home + Gate
```
Tasks:
  → Flutter project setup, dependencies installed
  → MVVM folder structure created
  → Splash screen (JWT check → home or login)
  → Login screen + Register screen
  → OTP screen (email + mobile fallback)
  → Link child screen (Student ID entry)
  → Confirm child screen ("Is this your child?")
  → Home screen (announcement feed + quick stats)
  → Child switcher header widget
  → Bottom navigation bar (5 tabs)
  → Theme system (5 colours + SharedPreferences)
  → Gate log screen (IN/OUT history per day, filter by date)
  → FCM setup (firebase_messaging)

Deliverable: Login → link child → home screen → gate log working
```

### Week 11 — Attendance + Messages + AI Bot
```
Tasks:
  → Attendance screen: history per subject, monthly summary
  → Excuse note screen: submit for absent record
  → Messages screen: inbox, thread list
  → Message thread screen: send/receive + read receipts
  → AI Bot screen: natural language question → answer display
  → Public Q&A screen: browse past answered questions
  → Low-confidence fallback display
  → Notification panel screen: full list, mark read
  → Tap-to-navigate from notification to relevant screen
  → Supabase Realtime: notifications channel subscription

Deliverable: Attendance, messaging, AI bot working end-to-end
```

### Week 12 — Complaints + Lost & Found + Profile
```
Tasks:
  → Complaints screen: my list, status display
  → Submit complaint screen: category + description form
  → Complaint detail screen: full status trail + reply note
  → Lost & Found screen: found items board + my reports tabs
  → Report lost item screen: form + optional photo
  → Announcement detail screen
  → Profile screen: name/avatar, children list, grades, timetable
  → Edit profile screen
  → Change password screen
  → Add child screen (repeat Student ID + OTP flow)
  → Settings screen: biometric toggle, 5 themes, notification preferences
  → Biometric login (local_auth)
  → Logout + all-sessions logout

Deliverable: Complete Flutter app, all features working
```

---

## Phase 6 — Integration + Testing (Week 13)

```
Tasks:
  → End-to-end testing: full flows for all 4 roles
  → Gate scan → FCM to parent (manual viva demo flow)
  → Teacher marks absent → FCM to parent
  → Admin uploads PDF → parent asks question → AI answers
  → Teacher publishes grades → parent notified
  → Performance: 50+ concurrent API requests
  → Security: JWT verification, RBAC bypass attempts
  → User acceptance: 3-5 test users if available
  → Bug fixes

Deliverable: Stable, tested system ready for demo
```

---

## Phase 7 — Documentation + Submission (Week 14)

```
Tasks:
  → Final project report (dissertation)
  → Update all 10 .md reference documents
  → API documentation review (03-api-endpoints.md)
  → Code cleanup, comments, unused code removed
  → Deploy: Vercel (Next.js), Railway (Fastify), Supabase Cloud
  → Viva demo script prepared (see 00-master-project-reference.md)
  → Demo seed data loaded (test students, parents, teachers)
  → Presentation slides prepared

Deliverable: Submission-ready project + viva demo ready
```

---

## Priority Order (If Time Gets Tight)

```
MUST COMPLETE (core marks):
  1. Auth system (all 4 roles)
  2. Gate scan → parent FCM notification
  3. Teacher marks attendance → absent FCM to parent
  4. Parent-teacher messaging
  5. Admin approval + school structure
  6. RAG: upload PDF → parent asks question → AI answers

SHOULD COMPLETE:
  7. Grades: enter + publish
  8. Complaints full flow
  9. All-sessions logout
  10. Admin discrepancy alerts + absence alerts

NICE TO HAVE (if time allows):
  11. Lost & Found
  12. Gate analytics dashboard
  13. AI message drafting
  14. Student ID card export
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| RAG confidence too low | High | Test with real school PDFs early in Week 6, tune chunk size |
| OpenAI API costs | Medium | gpt-4o-mini, set monthly spend limit, cache frequent answers |
| FCM delivery issues | Medium | Test on real Android + iOS devices, not emulator |
| Flutter-backend integration | Medium | Test all API endpoints in Postman before Flutter |
| Gate page Next.js middleware | Low | Test role-based redirect early in Week 9 |
| Time overrun on Flutter | High | Flutter is Week 10-12, keep Phase 4 tight |
| Supabase free tier limits | Low | Monitor storage and row counts during dev |
