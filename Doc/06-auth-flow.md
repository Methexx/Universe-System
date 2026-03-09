# 06 — Auth Flow

## Overview

Universe uses Supabase Auth as the authentication backbone combined with custom JWT-based RBAC middleware. OTP email verification is required for all users. Biometric login is available on Flutter only.

---

## Email Domain Rules

```
Students  → must use @students.nsbm.ac.lk only
Lecturers → any email (future: academic email required)
Admins    → seeded directly into database
```

---

## Student Registration Flow

```
1. Student opens Flutter app
        ↓
2. Enter university email (@students.nsbm.ac.lk)
        ↓
3. Backend validates email domain
   → Not university email → reject with error
        ↓
4. OTP generated (6 digits, expires 10 mins)
        ↓
5. OTP sent to university email via Supabase Auth
        ↓
6. Student enters OTP
        ↓
7. OTP verified
   → Invalid/expired → resend option
        ↓
8. Account created with role: "demo"
        ↓
9. Academic Profile Setup screen (mandatory)
   → Select Faculty
   → Select Degree Program
   → Select Batch/Intake Year
   → Select Current Academic Year
        ↓
10. Profile saved → role upgraded to "student"
        ↓
11. JWT issued with payload:
    { userId, role: "student", email }
        ↓
12. Token stored in flutter_secure_storage
        ↓
13. Student Dashboard unlocked
```

---

## Lecturer Registration Flow

```
1. Lecturer opens Next.js web dashboard
        ↓
2. Enter any email
        ↓
3. OTP sent to email
        ↓
4. OTP verified
        ↓
5. Account created with role: "demo"
        ↓
6. Lecturer waits for admin promotion
        ↓
7. Admin promotes demo → "lecturer"
        ↓
8. Lecturer gets notified
        ↓
9. Lecturer logs in → Lecturer Dashboard
```

---

## Admin Seeding Flow

```
First admin created directly in Supabase DB:
    → Email: admin@nsbm.ac.lk
    → Role: "admin"
    → Password: bcrypt hashed

Admin can then promote any user:
    demo → student
    demo → lecturer
    demo → admin
    lecturer → admin
    admin → lecturer
```

---

## Login Flow (All Users)

```
1. Enter email + password
        ↓
2. Backend validates credentials via Supabase Auth
        ↓
3. Check role in users table
        ↓
4. Generate JWT:
   {
     userId: uuid,
     role: "student" | "lecturer" | "admin",
     email: string,
     exp: timestamp
   }
        ↓
5. Return JWT + role + basic profile
        ↓
Flutter  → store in flutter_secure_storage
Next.js  → store in HTTP-only cookie
        ↓
6. Role-based redirect:
   student  → Student Dashboard (Flutter)
   lecturer → Lecturer Dashboard (Web)
   admin    → Admin Dashboard (Web)
```

---

## Biometric Login Flow (Flutter Only)

```
Prerequisites:
    → User must be logged in once normally
    → Biometric enabled in Settings

Flow:
1. App opens → check biometric enabled flag (local)
        ↓
2. Show biometric prompt (fingerprint/face)
        ↓
3. Device authenticates locally
        ↓
4. Retrieve stored JWT from flutter_secure_storage
        ↓
5. Validate JWT with backend
        ↓
6. If valid → Dashboard
   If expired → full login required
```

---

## JWT Middleware Flow (Every Protected Route)

```
Incoming Request
        ↓
Extract Bearer token from Authorization header
        ↓
Verify JWT signature
        ↓
Check token expiry
        ↓
Extract role from payload
        ↓
Compare role against route permission
        ↓
Match  → attach user to request → proceed
No match → 401 Unauthorized
```

---

## RBAC Permission Matrix

| Route Group | student | lecturer | admin |
|-------------|---------|----------|-------|
| /auth/* | ✅ | ✅ | ✅ |
| /questions/* | ✅ | ✅ | ✅ |
| /attendance/scan | ✅ | ❌ | ❌ |
| /attendance/create | ❌ | ✅ | ✅ |
| /complaints/submit | ✅ | ❌ | ❌ |
| /complaints/manage | ❌ | ✅ | ✅ |
| /announcements/create | ❌ | ✅ | ✅ |
| /modules/upload-pdf | ❌ | ✅ | ✅ |
| /admin/* | ❌ | ❌ | ✅ |
| /notifications/send | ❌ | ✅ | ✅ |

---

## Account Expiry & Re-verification Flow

```
End of academic year:
        ↓
Student account flagged as expired
        ↓
Student gets push notification
        ↓
Student opens app → expiry screen shown
        ↓
Student re-verifies:
    1. Login with university email
    2. OTP sent to university email
    3. OTP verified
    4. Confirm current academic year
        ↓
Account reactivated automatically
(No admin involvement required)
```

---

## OTP Configuration

```
Length      : 6 digits
Expiry      : 10 minutes
Max attempts: 3 (then regenerate)
Delivery    : Supabase Auth email
Resend      : After 60 seconds cooldown
```

---

## Token Configuration

```
JWT Secret  : ENV variable (SUPABASE_JWT_SECRET)
Expiry      : 7 days
Refresh     : Silent refresh on app open
Storage     :
    Flutter  → flutter_secure_storage
    Next.js  → HTTP-only cookie (sameSite: strict)
```
