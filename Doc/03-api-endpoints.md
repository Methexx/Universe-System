# 03 — API Endpoints

> School Connect — Fastify REST API

---

## Base URL
```
Development : http://localhost:5000/api
Production  : https://api.school-connect.lk/api
```

## Auth Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🔐 Auth — /api/auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | public | Register new account (teacher, security, parent) |
| POST | /auth/verify-otp | public | Verify OTP — complete registration |
| POST | /auth/resend-otp | public | Resend OTP (60s cooldown) |
| POST | /auth/login | public | Login with email + password |
| POST | /auth/logout | all | Logout current session |
| POST | /auth/logout-all | all | Logout all active sessions |
| POST | /auth/forgot-password | public | Send password reset OTP |
| POST | /auth/reset-password | public | Reset password with OTP |
| POST | /auth/refresh | all | Silent JWT refresh |
| PUT | /auth/link-child | parent | Enter Student ID + OTP to link child |
| PUT | /auth/fcm-token | all | Update Firebase FCM token |

### POST /auth/register
```json
Request:
{
  "full_name": "Kumari Silva",
  "email": "kumari@gmail.com",
  "password": "securepassword"
}

Response 200:
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### POST /auth/verify-otp
```json
Request:
{
  "email": "kumari@gmail.com",
  "otp": "123456"
}

Response 200:
{
  "success": true,
  "token": "jwt_token",
  "role": "pending",
  "user": { "id": "uuid", "email": "...", "full_name": "..." }
}
```

### PUT /auth/link-child (parent)
```json
Request:
{
  "student_id_no": "SCH-2026-0042",
  "verification_method": "email"
}
// Backend retrieves parent_email from student record
// Sends OTP to that email

Response 200:
{
  "success": true,
  "student": { "full_name": "Amal Silva", "class": "Grade 8A" },
  "message": "OTP sent to stored email"
}
```

---

## 👤 Users — /api/users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users/me | all | Get current user profile |
| PUT | /users/me | all | Update name / avatar |
| PUT | /users/me/password | all | Change password |
| GET | /users | admin | Get all users (filter by role/status) |
| GET | /users/pending | admin | Get pending accounts |
| PUT | /users/:id/promote | admin | Promote pending account to role |
| PUT | /users/:id/suspend | admin | Suspend account |
| PUT | /users/:id/unsuspend | admin | Unsuspend account |
| DELETE | /users/:id | admin | Permanently delete account |
| PUT | /users/:id/class | admin | Reassign teacher to different class |

### PUT /users/:id/promote
```json
Request:
{
  "role": "teacher",
  "class_id": "uuid",
  "subject": "Mathematics"
}
// role: 'teacher' | 'security' | 'admin'
// class_id required only if role = 'teacher'

Response 200:
{
  "success": true,
  "message": "Account promoted to teacher. Email notification sent."
}
```

---

## 🏫 School Structure — /api/school

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /school/grades | admin | Create school grade level |
| GET | /school/grades | admin, teacher | Get all grade levels |
| PUT | /school/grades/:id | admin | Edit grade level |
| DELETE | /school/grades/:id | admin | Delete grade level |
| POST | /school/classes | admin | Create class |
| GET | /school/classes | admin | Get all classes |
| GET | /school/classes/mine | teacher | Get teacher's assigned classes |
| PUT | /school/classes/:id | admin | Edit class |
| DELETE | /school/classes/:id | admin | Delete class |
| GET | /school/classes/:id/students | teacher, admin | Get students in class |
| POST | /school/students | admin | Create student record |
| GET | /school/students/:id | admin, teacher | Get student details |
| PUT | /school/students/:id | admin | Edit student record |
| PUT | /school/students/:id/class | admin | Move student to different class |
| DELETE | /school/students/:id | admin | Deactivate student |
| GET | /school/students/:id/profile | admin | Unified student profile (gate + attendance + grades) |
| GET | /school/students/search | admin, teacher | Search students by name or ID |

### POST /school/students
```json
Request:
{
  "full_name": "Amal Bandara",
  "date_of_birth": "2012-04-15",
  "class_id": "uuid",
  "parent_email": "kumari@gmail.com",
  "parent_mobile": "+94771234567"
}

Response 200:
{
  "success": true,
  "student": {
    "id": "uuid",
    "student_id_no": "SCH-2026-0042",
    "qr_code": "uuid",
    "full_name": "Amal Bandara"
  }
}
```

---

## 🚪 Gate — /api/gate

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /gate/scan | security, admin | Record gate entry or exit |
| GET | /gate/photo/:studentId | security, admin | Get student photo for verification |
| GET | /gate/log | admin | School-wide gate log with filters |
| GET | /gate/log/today | security | Today's gate log (security view) |
| GET | /gate/analytics | admin | Arrival time analytics |
| GET | /gate/discrepancies | admin | Gate vs attendance discrepancies |

### POST /gate/scan
```json
Request (QR scan):
{
  "qr_code": "student-uuid-from-card",
  "direction": "IN"
}

Request (manual entry):
{
  "student_id": "uuid",
  "direction": "IN",
  "method": "manual",
  "manual_reason": "forgot_card"
}

Response 200:
{
  "success": true,
  "student": {
    "full_name": "Amal Bandara",
    "class": "Grade 8A",
    "photo_url": "https://..."
  },
  "fcm_sent": true,
  "message": "Gate event recorded"
}

Response 404:
{
  "success": false,
  "error": "Student not found"
}
```

### GET /gate/log
```
Query params:
  ?date=2026-03-20
  &class_id=uuid
  &grade_id=uuid
  &method=manual          (filter manual entries only)
  &late=true              (filter late arrivals only)
  &direction=IN
```

---

## 📅 Attendance — /api/attendance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /attendance/session | teacher | Create today's attendance session |
| GET | /attendance/session/today/:classId | teacher | Get today's session with gate status |
| PUT | /attendance/session/:id | teacher | Submit or update session (same day only) |
| GET | /attendance/class/:classId | teacher, admin | Get attendance by class + date range |
| GET | /attendance/student/:studentId | admin, teacher, parent | Get student attendance history |
| PUT | /attendance/record/:id/excuse | parent | Submit excuse note for absence |
| GET | /attendance/dashboard | admin | School-wide attendance dashboard |

### POST /attendance/session
```json
Request:
{
  "class_id": "uuid"
}

Response 200:
{
  "success": true,
  "session": {
    "id": "uuid",
    "session_date": "2026-03-20",
    "students": [
      {
        "student_id": "uuid",
        "full_name": "Amal Bandara",
        "gate_status": "in_school",
        "default_status": "present"
      }
    ]
  }
}
```

### PUT /attendance/session/:id (submit)
```json
Request:
{
  "records": [
    { "student_id": "uuid", "status": "present" },
    { "student_id": "uuid", "status": "absent" },
    { "student_id": "uuid", "status": "late" }
  ]
}

Response 200:
{
  "success": true,
  "absent_fcm_sent": 2,
  "message": "Attendance submitted. FCM sent to 2 parents."
}
```

---

## 💬 Messages — /api/messages

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /messages/inbox | teacher, parent | Get all message threads |
| GET | /messages/thread/:userId | teacher, parent | Get messages with a specific user |
| POST | /messages/send | teacher, parent | Send a message |
| PUT | /messages/:id/read | teacher, parent | Mark message as read |
| POST | /messages/ai-draft | teacher | Generate AI draft based on student context |

### POST /messages/send
```json
Request:
{
  "receiver_id": "uuid",
  "student_id": "uuid",
  "content": "Amal has been struggling with attendance this week."
}

Response 200:
{
  "success": true,
  "message_id": "uuid",
  "fcm_sent": true
}
```

### POST /messages/ai-draft
```json
Request:
{
  "student_id": "uuid"
}

Response 200:
{
  "success": true,
  "draft": "Dear Parent, I wanted to reach out regarding Amal's attendance. Over the past week, Amal has been marked absent on 3 occasions..."
}
```

---

## 📢 Announcements — /api/announcements

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /announcements | admin, teacher | Create announcement |
| GET | /announcements | teacher, parent | Get relevant announcements |
| GET | /announcements/:id | all | Get single announcement |
| DELETE | /announcements/:id | admin, author | Delete announcement |

### POST /announcements
```json
Request (admin — school wide):
{
  "title": "School Sports Day",
  "content": "Sports day will be held on 25th March...",
  "scope": "school_wide",
  "target": "all"
  // target: 'all' | 'parents_only' | 'staff_only'
}

Request (teacher — class):
{
  "title": "Mathematics Exam Next Week",
  "content": "Please ensure your child has revised chapters 5-8...",
  "scope": "class",
  "class_id": "uuid"
}
```

---

## 📝 Complaints — /api/complaints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /complaints | parent | Submit complaint or suggestion |
| GET | /complaints/my | parent | Get own complaints |
| GET | /complaints/:id | parent, teacher (assigned), admin | Get complaint detail |
| GET | /complaints | admin | Get all complaints with filters |
| PUT | /complaints/:id/assign | admin | Assign complaint to teacher |
| PUT | /complaints/:id/status | admin, teacher (assigned) | Update status with reply note |

### PUT /complaints/:id/status
```json
Request:
{
  "status": "resolved",
  "reply_note": "We have spoken with the teacher and the issue has been addressed."
}
// status: 'assigned' | 'in_progress' | 'resolved' | 'rejected'
```

---

## 🎓 Grades — /api/grades

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /grades/modules | teacher | Get teacher's own modules |
| POST | /grades/modules | teacher | Create a new module |
| PUT | /grades/modules/:id | teacher | Edit module name |
| DELETE | /grades/modules/:id | teacher | Delete module (removes all grades) |
| GET | /grades/terms | all | Get all terms (active auto-indicated) |
| POST | /grades/terms | admin | Create new term |
| PUT | /grades/terms/:id/activate | admin | Set term as active |
| PUT | /grades/terms/:id/lock | admin | Lock term (no more edits) |
| GET | /grades/sheet/:classId/:termId | teacher | Get grade sheet for class + term |
| PUT | /grades/sheet/:classId/:termId | teacher | Save draft grades |
| POST | /grades/sheet/:classId/:termId/publish | teacher | Publish grades to parents |
| PUT | /grades/sheet/:classId/:termId/unpublish | teacher | Unpublish (before term lock) |
| GET | /grades/student/:studentId | admin, parent | Get student's published grades |

### PUT /grades/sheet/:classId/:termId (save draft)
```json
Request:
{
  "grades": [
    {
      "student_id": "uuid",
      "module_id": "uuid",
      "score": 76,
      "remarks": "Good improvement this term"
    },
    {
      "student_id": "uuid",
      "module_id": "uuid",
      "score": 88,
      "remarks": null
    }
  ]
}

Response 200:
{
  "success": true,
  "saved": 32,
  "is_published": false
}
```

---

## 🔔 Notifications — /api/notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /notifications | all | Get own notification list |
| PUT | /notifications/:id/read | all | Mark as read |
| PUT | /notifications/read-all | all | Mark all as read |

---

## 🤖 RAG — /api/rag

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /rag/documents | admin | Upload policy PDF |
| GET | /rag/documents | admin | List uploaded documents |
| PUT | /rag/documents/:id | admin | Edit document name |
| DELETE | /rag/documents/:id | admin | Delete document + vector chunks |
| POST | /rag/query | parent | Ask school policy question |
| GET | /rag/qa | parent | Get public Q&A knowledge base |

### POST /rag/query
```json
Request:
{
  "question": "What are the school fee payment dates?"
}

Response 200:
{
  "success": true,
  "answer": "According to the school fee policy, Term 1 fees are due by 15th January...",
  "confidence": 0.87,
  "is_fallback": false
}

Response 200 (low confidence):
{
  "success": true,
  "answer": null,
  "confidence": 0.21,
  "is_fallback": true,
  "fallback_message": "We could not find an answer in our documents. Please contact the school office directly."
}
```

---

## 🔍 Lost & Found — /api/lost-found

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /lost-found/items | teacher, admin | Post a found item |
| GET | /lost-found/items | parent | Browse found items board |
| PUT | /lost-found/items/:id | teacher, admin (own post), admin | Edit found item |
| DELETE | /lost-found/items/:id | admin | Delete any post |
| PUT | /lost-found/items/:id/collected | teacher, admin | Mark as collected |
| POST | /lost-found/reports | parent | Report a lost item |
| GET | /lost-found/reports/my | parent | Get own lost reports |
| PUT | /lost-found/reports/:id/recovered | parent | Mark own report as recovered |
| GET | /lost-found/reports | admin | View all parent lost reports |

---

## Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Invalid or missing JWT |
| FORBIDDEN | 403 | Insufficient role for this route |
| NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 400 | Invalid request body (Zod) |
| OTP_EXPIRED | 400 | OTP has expired |
| OTP_INVALID | 400 | Wrong OTP entered |
| OTP_MAX_ATTEMPTS | 400 | Too many failed OTP attempts |
| ALREADY_LINKED | 409 | Student already has a linked parent |
| STUDENT_NOT_FOUND | 404 | Student ID number not recognised |
| SESSION_EXISTS | 409 | Attendance session already created for today |
| TERM_LOCKED | 403 | Cannot edit grades — term is locked |
| ACCOUNT_SUSPENDED | 403 | Account has been suspended by admin |
| ACCOUNT_PENDING | 403 | Account pending admin approval |

---

## ?? Attendance � /api/attendance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /attendance/mark | admin, teacher | Upsert student attendance ('present', 'absent', 'late', 'excused') |
| GET | /attendance | admin, teacher, security | Fetch attendance records with optional ?date=YYYY-MM-DD & ?class_id=X filters |
