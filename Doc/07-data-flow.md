# 07 — Data Flow

> School Connect — Feature-by-Feature Data Flows

---

## 1. Parent Account Creation & Child Linking

```
[Flutter App]
Parent downloads app → taps Register
    → enters email + password → POST /api/auth/register
        ↓
[Backend]
    → INSERT into otp_verifications
    → Send OTP email
        ↓
[Flutter]
Parent enters OTP → POST /api/auth/verify-otp
    → account created, role: pending (actually 'parent' but unlinked)
        ↓
"Link Your Child" screen shown
Parent types Student ID from physical card (e.g. SCH-2026-0042)
    → POST /api/auth/link-child { student_id_no }
        ↓
[Backend]
    → SELECT * FROM students WHERE student_id_no = ? (indexed lookup)
    → Returns student name + class
        ↓
[Flutter]
Shows: "Is this your child? — Amal Bandara, Grade 8A"
Parent confirms YES
    ↓
[Backend]
    → Retrieve parent_email from student record
    → INSERT into otp_verifications
    → Send OTP to parent_email
        ↓
[Flutter]
Parent enters OTP from inbox
    ↓
[Backend]
    → Verify OTP
    → INSERT into parent_students { parent_id, student_id }
    → UPDATE students SET is_parent_linked = true
    → Return JWT with role: parent
        ↓
[Flutter]
Home dashboard unlocked
```

---

## 2. Gate Entry Scan (QR Card)

```
[Gate PC — Security Guard]
Student holds physical QR card to USB scanner
    → Scanner reads QR UUID → auto-fills input field
        ↓
POST /api/gate/scan { qr_code: "uuid", direction: "IN" }
        ↓
[Backend — gate.service]
    → SELECT * FROM students WHERE qr_code = ?
    → Student found?
        No  → return 404 NOT_FOUND
        Yes → continue
    → INSERT into gate_events {
          student_id, direction: 'IN',
          method: 'qr_scan', scanned_by: guard_user_id,
          is_late: (current_time > SCHOOL_START_TIME)
        }
    → Fetch parent FCM token:
        SELECT u.fcm_token FROM users u
        JOIN parent_students ps ON ps.parent_id = u.id
        WHERE ps.student_id = ?
    → INSERT into notifications { user_id: parent_id, type: 'gate_in' }
    → sendFCM(parent_token, "Amal entered school", "7:42 AM")
        ↓
[Supabase Realtime]
    → gate_events INSERT broadcasts to gate page channel
    → Security guard's live log updates instantly
        ↓
[Firebase FCM → Parent phone]
    → Push notification delivered within seconds
    → Parent taps → Flutter app navigates to gate log screen
```

---

## 3. Gate Entry — Manual (Forgot Card)

```
[Gate PC — Security Guard]
Student arrives without card → guard switches to Manual tab
    → Types student name → search results appear
    → Selects student → student photo loaded from Supabase Storage
    → Guard visually verifies face matches photo
    → Selects reason: 'forgot_card'
    → Taps "Yes — Record Entry"
        ↓
POST /api/gate/scan {
  student_id: "uuid",
  direction: "IN",
  method: "manual",
  manual_reason: "forgot_card"
}
        ↓
[Backend]
    → Same flow as QR scan from this point
    → gate_events INSERT with method: 'manual', manual_reason: 'forgot_card'
    → Parent FCM notification fires same as QR scan
    → Supabase Realtime broadcasts to gate page
```

---

## 4. Teacher Marks Attendance (Gate-Aware)

```
[Next.js — Teacher]
Teacher opens Attendance → clicks "Create Session for Today"
        ↓
POST /api/attendance/session { class_id }
        ↓
[Backend — attendance.service]
    → INSERT into attendance_sessions { class_id, teacher_id, session_date: today }
    → SELECT students WHERE class_id = ?
    → For each student: check gate_events today
        SELECT direction FROM gate_events
        WHERE student_id = ? AND scanned_at::date = today
        ORDER BY scanned_at DESC LIMIT 1
    → Returns student list with gate_status: 'in_school' | 'not_scanned'
        ↓
[Next.js]
Shows student list with gate status indicators
Teacher marks each student: Present / Absent / Late
    → All default to Present
    → Teacher changes exceptions only
        ↓
PUT /api/attendance/session/:id
  { records: [{ student_id, status }] }
        ↓
[Backend]
    → INSERT into attendance_records for each student
    → For each student with status = 'absent':
        → Fetch parent FCM token
        → INSERT into notifications (parent)
        → sendFCM(parent_token, "Amal marked absent", "Mathematics 9:00 AM")
    → Check for gate_vs_attendance discrepancy:
        → If any student has gate_status: 'in_school' BUT status: 'absent'
        → INSERT into notifications (admin) type: 'discrepancy_alert'
    → Check for 3+ consecutive absences:
        → If found: INSERT into notifications (admin) type: 'absence_alert'
```

---

## 5. Parent Asks AI Policy Question (RAG)

```
[Flutter — Parent]
Parent opens AI Bot → types question:
"What are the school fee payment dates?"
        ↓
POST /api/rag/query { question: "..." }
        ↓
[Backend — rag.service]

Step 1: Embed the question
    → OpenAI API: text-embedding-3-small
    → Input: question text
    → Output: 1536-dimension vector

Step 2: Similarity search in pgvector
    SELECT chunk_text FROM document_chunks
    ORDER BY embedding <=> question_embedding
    LIMIT 5
    → Returns top 5 most relevant chunks from uploaded policy PDFs

Step 3: Check confidence
    → If max similarity score < 0.5:
        → Return fallback message (no GPT call)

Step 4: Build prompt + call GPT
    → Prompt:
        "You are a helpful school assistant.
         Answer the parent's question using ONLY the context below.
         If the answer is not in the context, say you don't know.

         Context:
         [chunk1 text]
         [chunk2 text]
         ...

         Question: What are the school fee payment dates?"
    → POST to OpenAI Chat API (gpt-4o-mini)
    → Receive answer

Step 5: Return answer
    → { answer: "...", confidence: 0.87, is_fallback: false }
        ↓
[Flutter]
Displays answer to parent
```

---

## 6. Admin Uploads Policy PDF (RAG Pipeline)

```
[Next.js — Admin]
Admin selects PDF file → clicks Upload
        ↓
POST /api/rag/documents (multipart/form-data)
        ↓
[Backend — rag.service]
Step 1: Save to Supabase Storage
    → Upload to storage path: policy-docs/{uuid}.pdf
    → INSERT into policy_documents { file_name, storage_path, is_processed: false }

Step 2: Background RAG pipeline (rag.pipeline.ts)
    → Download PDF from Supabase Storage
    → Extract text: pdf-parse
    → Split into chunks:
        target size: 500 tokens
        overlap:     50 tokens
        strategy:    split on sentence boundaries
    → For each chunk:
        → OpenAI embeddings API: text-embedding-3-small
        → INSERT into document_chunks { document_id, chunk_text, embedding, chunk_index }
    → UPDATE policy_documents SET is_processed = true, chunk_count = N
        ↓
[Admin dashboard]
Document status changes from "Processing" to "Active"
```

---

## 7. Teacher Enters and Publishes Grades

```
[Next.js — Teacher]
Teacher goes to Grades → selects class + active term
    → GET /api/grades/sheet/:classId/:termId
    → Returns: all students in class + existing draft scores
        ↓
Teacher expands each student → enters scores per module
    → Score: 76 → auto-calculated letter grade: B shown
        ↓
Teacher clicks Save Draft
    → PUT /api/grades/sheet/:classId/:termId
    → UPSERT into grades for each student:
        { student_id, module_id, term_id, score, letter_grade, is_published: false }
    → No FCM, no parent visibility
        ↓
Teacher reviews → all students and modules filled → clicks Publish
    → POST /api/grades/sheet/:classId/:termId/publish
        ↓
[Backend]
    → UPDATE grades SET is_published = true, published_at = NOW()
        WHERE module_id IN (teacher's modules) AND term_id = ?
    → For each student in class:
        → Fetch parent FCM token
        → INSERT into notifications (parent) type: 'grade_published'
        → sendFCM(parent_token, "Term 2 results available", "Maths results published")
        ↓
[Flutter — Parent]
Parent taps notification → opens Grades screen
    → GET /api/grades/student/:studentId (published only)
    → Sees: "Science: 76 (B) | Maths: 88 (A) | English: 67 (B)"
```

---

## 8. Parent Submits Complaint

```
[Flutter — Parent]
Parent opens Complaints → Submit New
    → Selects category: "Teacher Conduct"
    → Types description → submits
        ↓
POST /api/complaints {
  category: 'teacher_conduct',
  description: '...',
  student_id: 'uuid'
}
        ↓
[Backend]
    → INSERT into complaints { parent_id, student_id, category, description, status: 'pending' }
    → INSERT into notifications (admin) type: 'new_complaint'
        ↓
[Next.js — Admin]
Admin sees new complaint in Complaints list
Admin opens it → selects teacher → clicks Assign
    → PUT /api/complaints/:id/assign { teacher_id }
    → UPDATE complaints SET assigned_to = ?, status = 'assigned', assigned_at = NOW()
    → INSERT into notifications (teacher) type: 'complaint_assigned'
    → sendFCM(teacher_token, "New complaint assigned", "Teacher Conduct complaint")
        ↓
[Next.js — Teacher]
Teacher opens complaint → updates status:
    → PUT /api/complaints/:id/status { status: 'resolved', reply_note: '...' }
    → UPDATE complaints SET status = 'resolved', reply_note = '...', resolved_by = ?, resolved_at = NOW()
        ↓
[Flutter — Parent]
Parent opens My Complaints → sees "Resolved" status + reply note
```

---

## 9. Message Flow (Parent ↔ Teacher)

```
[Flutter — Parent]
Parent opens Messages → compose → types message → sends
    → POST /api/messages/send {
        receiver_id: teacher_id,
        student_id: uuid,
        content: "..."
      }
        ↓
[Backend]
    → INSERT into messages { sender_id: parent_id, receiver_id: teacher_id, student_id, content }
    → Fetch teacher FCM token
    → INSERT into notifications (teacher) type: 'message'
    → sendFCM(teacher_token, "New message from parent", "Kumari Silva sent you a message")
        ↓
[Next.js — Teacher]
Teacher sees notification badge on Messages tab
Opens thread → reads message → types reply → sends
    → POST /api/messages/send { receiver_id: parent_id, ... }
        ↓
[Backend]
    → INSERT into messages
    → INSERT into notifications (parent) type: 'message'
    → sendFCM(parent_token, "Reply from teacher", "...")
        ↓
[Flutter — Parent]
FCM arrives → parent taps → message thread opens
```
