# Universe Backend — API Reference

Base URL: `http://localhost:5000`  
All endpoints are prefixed with `/api` unless noted.  
Authenticated routes require `Authorization: Bearer <token>` header.

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Check if API is running |

---

## Auth `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user account |
| POST | `/api/auth/verify-otp` | No | Verify OTP sent to email |
| POST | `/api/auth/resend-otp` | No | Resend OTP to email |
| POST | `/api/auth/login` | No | Login with email + password |
| POST | `/api/auth/forgot-password` | No | Request password reset link |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/refresh` | Yes | Refresh access token |
| POST | `/api/auth/logout` | Yes | Logout current session |
| POST | `/api/auth/logout-all` | Yes | Logout all sessions |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/change-password` | Yes | Change password |
| PUT | `/api/auth/link-child` | Yes | Link child account to parent |
| PUT | `/api/auth/fcm-token` | Yes | Update Firebase push token |

---

## Users `/api/users`

All routes require auth.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users/me` | Yes | Any | Get own profile |
| PUT | `/api/users/me` | Yes | Any | Update own profile |
| DELETE | `/api/users/me` | Yes | Any | Delete own account |
| PUT | `/api/users/fcm-token` | Yes | Any | Update push token |
| GET | `/api/users/all` | Yes | Admin | Get all users |
| GET | `/api/users/pending` | Yes | Admin | Get pending registrations |
| GET | `/api/users/teachers` | Yes | Admin | Get all teachers |
| PUT | `/api/users/:id/promote` | Yes | Admin | Promote user role |
| PUT | `/api/users/:id/suspend` | Yes | Admin | Suspend user |
| PUT | `/api/users/:id/unsuspend` | Yes | Admin | Unsuspend user |
| DELETE | `/api/users/:id` | Yes | Admin | Delete user |

---

## School `/api/school`

All routes require auth.

### Grades

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/school/grades` | Yes | Admin | Create grade |
| GET | `/api/school/grades` | Yes | Admin, Teacher | Get all grades |
| DELETE | `/api/school/grades/:id` | Yes | Admin | Delete grade |

### Classes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/school/classes` | Yes | Admin | Create class |
| GET | `/api/school/classes` | Yes | Admin | Get all classes |
| PATCH | `/api/school/classes/:id` | Yes | Admin | Update class |
| DELETE | `/api/school/classes/:id` | Yes | Admin | Delete class |
| GET | `/api/school/grades-with-classes` | Yes | Admin | Get grades with their classes |
| GET | `/api/school/classes/mine` | Yes | Teacher | Get classes taught by me |
| GET | `/api/school/classes/:id/students` | Yes | Admin, Teacher | Get students in a class |

### Students

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/school/students` | Yes | Admin | Create student |
| GET | `/api/school/students` | Yes | Admin, Teacher | Get all students |
| PATCH | `/api/school/students/:id` | Yes | Admin | Update student |
| DELETE | `/api/school/students/:id` | Yes | Admin | Delete student |
| GET | `/api/school/students/next-id` | Yes | Admin | Get next available student ID |
| POST | `/api/school/students/photo` | Yes | Admin | Upload student photo |

### Overview

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/school/overview/stats` | Yes | Admin | School statistics dashboard |

---

## Gate `/api/gate`

All routes require auth.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/gate/scan` | Yes | Admin, Teacher, Security | Scan student QR code |
| GET | `/api/gate/student` | Yes | Admin, Teacher, Security | Lookup student by ID number |
| GET | `/api/gate/stats` | Yes | Admin, Teacher, Security | Gate dashboard statistics |
| GET | `/api/gate/events` | Yes | Admin, Teacher, Security | Recent gate scan events |

---

## Attendance `/api/attendance`

All routes require auth.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/attendance/mark` | Yes | Admin, Teacher | Mark or update attendance |
| GET | `/api/attendance/` | Yes | Admin, Teacher, Security | Get attendance records |

---

## Announcements `/api/announcements`

All routes require auth.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/announcements/` | Yes | Admin, Teacher | Create announcement |
| GET | `/api/announcements/` | Yes | Any | Get announcements |
| DELETE | `/api/announcements/:id` | Yes | Admin, Teacher | Delete announcement |

---

## Messages `/api/messages`

All routes require auth.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/inbox` | Yes | Get inbox |
| GET | `/api/messages/contacts` | Yes | Get contacts |
| GET | `/api/messages/thread/:userId` | Yes | Get thread with a user |
| POST | `/api/messages/send` | Yes | Send a message |
| PUT | `/api/messages/:id/read` | Yes | Mark message as read |
| POST | `/api/messages/ai-draft` | Yes | Generate AI draft for a message |
| DELETE | `/api/messages/:id` | Yes | Delete a message |

---

## Complaints `/api/complaints`

All routes require auth.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/complaints/` | Yes | Any | Submit a complaint |
| GET | `/api/complaints/my` | Yes | Any | Get own complaints |
| GET | `/api/complaints/all` | Yes | Admin | Get all complaints |
| GET | `/api/complaints/:id` | Yes | Admin, Parent, Assigned | Get specific complaint |
| PUT | `/api/complaints/:id/assign` | Yes | Admin | Assign complaint to staff |
| PUT | `/api/complaints/:id/status` | Yes | Admin, Assigned | Update complaint status |

---

## Lost & Found `/api/lost-found`

All routes require auth.

### Found Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/lost-found/items` | Yes | Post a found item |
| GET | `/api/lost-found/items` | Yes | Get all found items |
| PUT | `/api/lost-found/items/:id/collected` | Yes | Mark item as collected |
| DELETE | `/api/lost-found/items/:id` | Yes | Delete found item |

### Lost Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/lost-found/reports` | Yes | Report a lost item |
| GET | `/api/lost-found/reports/my` | Yes | Get own lost reports |
| GET | `/api/lost-found/reports` | Yes | Get all lost reports |
| PUT | `/api/lost-found/reports/:id/recovered` | Yes | Mark item as recovered |

---

## RAG (AI Assistant) `/api/rag`

All routes require auth.

### Documents

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/rag/documents` | Yes | Admin | Upload / ingest document |
| GET | `/api/rag/documents` | Yes | Admin | List ingested documents |
| DELETE | `/api/rag/documents/:id` | Yes | Admin | Delete document |

### Query

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/rag/query` | Yes | Admin, Teacher, Parent | Ask AI a question (rate-limited: 10/min) |

### Evaluation

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/rag/eval/report` | Yes | Admin | Get RAG evaluation report |

---

## Summary

| Module | Endpoints |
|--------|-----------|
| Health | 1 |
| Auth | 13 |
| Users | 11 |
| School | 14 |
| Gate | 4 |
| Attendance | 2 |
| Announcements | 3 |
| Messages | 7 |
| Complaints | 6 |
| Lost & Found | 8 |
| RAG | 5 |
| **Total** | **74** |
