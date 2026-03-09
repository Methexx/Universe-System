# 03 — API Endpoints

## Base URL
```
Development : http://localhost:5000/api
Production  : https://api.universe-platform.com/api
```

## Auth Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🔐 Auth Module — /api/auth

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /auth/register | public | Register new account |
| POST | /auth/verify-otp | public | Verify OTP code |
| POST | /auth/resend-otp | public | Resend OTP |
| POST | /auth/login | public | Login with email/password |
| POST | /auth/logout | all | Logout and invalidate token |
| POST | /auth/refresh | all | Refresh JWT token |

### POST /auth/register
```json
Request:
{
  "email": "student@students.nsbm.ac.lk",
  "password": "securepassword",
  "full_name": "Wedin Pathirana"
}

Response 200:
{
  "success": true,
  "message": "OTP sent to your email"
}

Response 400:
{
  "success": false,
  "error": "Invalid university email domain"
}
```

### POST /auth/verify-otp
```json
Request:
{
  "email": "student@students.nsbm.ac.lk",
  "otp": "123456"
}

Response 200:
{
  "success": true,
  "token": "jwt_token",
  "role": "demo",
  "user": { "id": "uuid", "email": "...", "full_name": "..." }
}
```

### POST /auth/login
```json
Request:
{
  "email": "student@students.nsbm.ac.lk",
  "password": "securepassword"
}

Response 200:
{
  "success": true,
  "token": "jwt_token",
  "role": "student",
  "user": { "id": "uuid", "email": "...", "full_name": "..." }
}
```

---

## 👤 Users Module — /api/users

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /users/me | all | Get current user profile |
| PUT | /users/me | all | Update name/avatar |
| GET | /users | admin | Get all users |
| PUT | /users/:id/role | admin | Promote/change user role |
| DELETE | /users/:id | admin | Deactivate user |

---

## 🎓 Academic Profile — /api/academic

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /academic/profile | demo/student | Create/update academic profile |
| GET | /academic/profile | student | Get own academic profile |
| POST | /academic/change-request | student | Request profile change |
| GET | /academic/change-requests | admin | Get all change requests |
| PUT | /academic/change-requests/:id | admin | Approve/reject request |

### POST /academic/profile
```json
Request:
{
  "faculty_id": "uuid",
  "degree_id": "uuid",
  "batch": "23.1",
  "academic_year": "Year 2",
  "student_id_no": "10952453"
}

Response 200:
{
  "success": true,
  "message": "Academic profile saved",
  "profile": { ... }
}
```

---

## 🏫 Faculties & Modules — /api/admin

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /admin/faculties | admin | Create faculty |
| GET | /admin/faculties | all | Get all faculties |
| POST | /admin/degrees | admin | Create degree |
| GET | /admin/degrees/:facultyId | all | Get degrees by faculty |
| POST | /admin/modules | admin | Create module |
| GET | /admin/modules | all | Get modules |
| POST | /admin/modules/:id/assign-lecturer | admin | Assign lecturer to module |

---

## ❓ Questions Module — /api/questions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /questions | student | Ask a question |
| GET | /questions/module/:moduleId | student/lecturer | Get questions by module |
| GET | /questions/public/:moduleId | student | Get public answered questions |
| PUT | /questions/:id/resolve | student | Mark as resolved |
| PUT | /questions/:id/escalate | student | Escalate to lecturer |
| POST | /questions/:id/answer | lecturer | Answer escalated question |
| GET | /questions/escalated | lecturer | Get escalated questions |

### POST /questions
```json
Request:
{
  "module_id": "uuid",
  "question_text": "What is polymorphism?"
}

Response 200:
{
  "success": true,
  "question_id": "uuid",
  "ai_answer": "Polymorphism is...",
  "source_chunks": ["chunk1", "chunk2"]
}
```

### POST /questions/:id/answer
```json
Request:
{
  "answer_text": "Here is the detailed explanation...",
  "is_public": true
}

Response 200:
{
  "success": true,
  "message": "Answer posted"
}
```

---

## 🤖 AI Module — /api/ai

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /ai/upload-document | lecturer | Upload module PDF |
| DELETE | /ai/documents/:id | lecturer | Delete document |
| GET | /ai/documents/:moduleId | lecturer | List module documents |
| POST | /ai/chat | all | General AI chat |

### POST /ai/upload-document
```
Content-Type: multipart/form-data
Body:
  file: <PDF file>
  module_id: "uuid"
```

### POST /ai/chat
```json
Request:
{
  "message": "I feel anxious about my exams",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response 200:
{
  "success": true,
  "reply": "I understand how you feel..."
}
```

---

## 📷 Attendance Module — /api/attendance

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /attendance/session | lecturer | Create QR session |
| GET | /attendance/session/:id/qr | lecturer | Get QR code |
| POST | /attendance/scan | student | Scan QR to mark attendance |
| GET | /attendance/module/:moduleId | lecturer/admin | Get attendance by module |
| GET | /attendance/student/history | student | Get own attendance history |
| GET | /attendance/module/:moduleId/stats | admin | Attendance chart data |

### POST /attendance/session
```json
Request:
{
  "module_id": "uuid"
}

Response 200:
{
  "success": true,
  "session_id": "uuid",
  "qr_code": "unique_qr_string",
  "expires_at": "2026-03-01T10:15:00Z"
}
```

### POST /attendance/scan
```json
Request:
{
  "qr_code": "unique_qr_string"
}

Response 200:
{
  "success": true,
  "message": "Attendance recorded"
}

Response 400:
{
  "success": false,
  "error": "QR code expired"
}
```

---

## 📢 Announcements Module — /api/announcements

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /announcements | lecturer/admin | Create announcement |
| GET | /announcements | student | Get relevant announcements |
| GET | /announcements/:id | all | Get single announcement |
| DELETE | /announcements/:id | lecturer/admin | Delete announcement |

### POST /announcements
```json
Request:
{
  "title": "Assignment deadline extended",
  "content": "The deadline has been moved to...",
  "type": "module",
  "module_id": "uuid",
  "target_role": "student"
}
```

---

## 📝 Complaints Module — /api/complaints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /complaints | student | Submit complaint |
| GET | /complaints/my | student | Get own complaints |
| GET | /complaints | admin | Get all complaints |
| PUT | /complaints/:id/assign | admin | Assign to lecturer |
| GET | /complaints/assigned | lecturer | Get assigned complaints |

---

## 🔔 Notifications Module — /api/notifications

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /notifications | all | Get own notifications |
| PUT | /notifications/:id/read | all | Mark as read |
| PUT | /notifications/read-all | all | Mark all as read |
| POST | /notifications/send | lecturer/admin | Send push notification |

### POST /notifications/send
```json
// Admin → can send to all students or all lecturers
{
  "title": "System maintenance tonight",
  "body": "The system will be down from 11pm-1am",
  "target": "all_students" | "all_lecturers" | "all_users"
}

// Lecturer → can only send to own module students
{
  "title": "Lab cancelled tomorrow",
  "body": "Please check the announcement for details",
  "module_id": "uuid"
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

## Standard Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| UNAUTHORIZED | 401 | Invalid/missing token |
| FORBIDDEN | 403 | Insufficient role |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| OTP_EXPIRED | 400 | OTP expired |
| OTP_INVALID | 400 | Wrong OTP |
| DOMAIN_INVALID | 400 | Non-university email |
| QR_EXPIRED | 400 | QR session expired |
| ALREADY_SCANNED | 400 | Student already marked |
