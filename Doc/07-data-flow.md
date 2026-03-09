# 07 — Data Flow

## Overview

This document describes how data flows through the Universe platform for each major feature. Every flow starts from a client action and ends at a data store or response.

---

## 1. Authentication Data Flow

```
[Flutter/Next.js]
User enters email + password
        │
        ▼
[Fastify Backend]
POST /api/auth/login
    → Validate input (Zod)
    → Query Supabase: SELECT * FROM users WHERE email = ?
    → Compare password hash (bcrypt)
    → Generate JWT { userId, role, email }
        │
        ▼
[Client]
Store JWT:
    Flutter  → flutter_secure_storage
    Next.js  → HTTP-only cookie
        │
        ▼
[All subsequent requests]
Authorization: Bearer <JWT>
    → authenticate middleware verifies
    → rbac middleware checks role
    → Request proceeds to controller
```

---

## 2. Student Registration + OTP Data Flow

```
[Flutter]
Enter @students.nsbm.ac.lk email
        │
        ▼
[Backend] POST /api/auth/register
    → Validate email domain
    → Generate 6-digit OTP
    → Set expiry (NOW + 10 mins)
    → INSERT into otp_verifications
    → Send email via Supabase Auth
        │
        ▼
[Student receives email]
Enters OTP in app
        │
        ▼
[Backend] POST /api/auth/verify-otp
    → SELECT from otp_verifications WHERE email = ?
    → Check expiry, check attempts
    → Mark otp as used
    → CREATE user in Supabase Auth
    → INSERT into users table
    → Return JWT (role: demo)
        │
        ▼
[Flutter]
Academic Profile Setup screen
        │
        ▼
[Backend] POST /api/academic/profile
    → INSERT into academic_profiles
    → Auto-enroll: INSERT into student_modules
      (all modules matching faculty + degree + year)
    → UPDATE users SET role = 'student'
        │
        ▼
[Flutter] Student Dashboard unlocked
```

---

## 3. Ask Question + RAG Data Flow

```
[Flutter]
Student selects module → types question
        │
        ▼
[Backend] POST /api/questions
    → Save question to DB
    → Convert question to embedding (OpenAI)
    → Vector similarity search in document_chunks:
        SELECT chunk_text FROM document_chunks
        WHERE module_id = ?
        ORDER BY embedding <=> query_embedding
        LIMIT 5
    → Build prompt:
        "Context: {chunks}\nQuestion: {question}"
    → Send to OpenAI Chat API
    → Receive AI answer
    → UPDATE questions SET ai_answer = ?
        │
        ▼
[Flutter]
Display AI answer to student
        │
        ├── Student marks resolved
        │       → UPDATE questions SET status = 'resolved'
        │
        └── Student escalates
                → UPDATE questions SET status = 'escalated'
                → INSERT into notifications (lecturer)
                → Firebase FCM → Lecturer notified
```

---

## 4. PDF Upload + Embedding Data Flow

```
[Next.js Dashboard]
Lecturer uploads PDF
        │
        ▼
[Backend] POST /api/ai/upload-document
    → Receive multipart file
    → Upload to Supabase Storage
    → INSERT into module_documents
        │
        ▼ (background processing)
[Backend] RAG Pipeline
    → Download PDF from Supabase Storage
    → Extract text (pdf-parse)
    → Split into chunks (500 tokens, 50 overlap)
    → For each chunk:
        → Generate embedding (OpenAI text-embedding-3-small)
        → INSERT into document_chunks { chunk_text, embedding, module_id }
    → UPDATE module_documents SET is_processed = true
```

---

## 5. QR Attendance Data Flow

```
[Next.js Dashboard - Lecturer]
Create attendance session
        │
        ▼
[Backend] POST /api/attendance/session
    → Generate unique QR string (UUID)
    → INSERT into attendance_sessions
        { qr_code, module_id, expires_at: NOW + 15min }
    → Return QR data to lecturer
        │
        ▼
[Next.js] Display QR code on screen
[Firebase FCM] Notify module students

[Flutter - Student]
Opens attendance screen → scans QR
        │
        ▼
[Backend] POST /api/attendance/scan
    → SELECT from attendance_sessions WHERE qr_code = ?
    → Check expires_at > NOW (else: QR_EXPIRED error)
    → Check student enrolled in module
    → Check not already scanned (ALREADY_SCANNED error)
    → INSERT into attendance_records { session_id, student_id, status: 'present' }
        │
        ▼ (Supabase Realtime)
[Next.js - Lecturer]
Live attendance list updates instantly
```

---

## 6. Complaint Submission Data Flow

```
[Flutter]
Student submits complaint
        │
        ▼
[Backend] POST /api/complaints
    → Validate input (Zod)
    → INSERT into complaints
        { student_id, category, description }
    → Return success message
        │
        ▼
[Next.js - Admin]
Views complaints list
        │
        ▼
Admin assigns to lecturer
        │
        ▼
[Backend] PUT /api/complaints/:id/assign
    → UPDATE complaints SET assigned_to = lecturerId
    → INSERT into notifications (for lecturer)
    → Firebase FCM → Lecturer notified
        │
        ▼
[Next.js - Lecturer]
Views assigned complaints
```

---

## 7. Push Notification Data Flow

```
[Backend] Any trigger event
        │
        ▼
notifications.service.ts
    → INSERT into notifications table (for in-app)
    → Call firebase-admin sendToDevice / sendToTopic
        │
        ▼
[Firebase FCM]
    → Deliver to device
        │
        ▼
[Flutter]
    App open   → Supabase Realtime updates badge + panel
    Background → System push notification shown
    Closed     → System push notification shown
        │
        ▼
User taps notification
    → Navigate to relevant screen based on type
```

---

## 8. AI Chat Data Flow

```
[Flutter / Next.js]
User sends message
        │
        ▼
[Backend] POST /api/ai/chat
    → Receive message + conversation history
    → Build messages array for OpenAI
    → POST to OpenAI Chat API (gpt-4o-mini)
    → Return AI reply
        │
        ▼
[Client]
Display reply in chat UI
Store conversation history LOCALLY only
    Flutter  → device local storage
    (Never stored on backend)
```

---

## 9. Announcement Data Flow

```
[Next.js - Admin/Lecturer]
Create announcement
        │
        ▼
[Backend] POST /api/announcements
    → INSERT into announcements
    → Determine recipients:
        University → all students
        Module     → module students only
        Lecturer   → all lecturers (admin only)
    → INSERT into notifications for each recipient
    → Firebase FCM → send to topic
        │
        ▼
[Flutter - Student]
    Dashboard → new card appears (Supabase Realtime)
    Background → push notification received
```
