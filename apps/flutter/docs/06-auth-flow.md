# 06 — Auth Flow

> School Connect — Authentication & Authorisation

---

## Overview

School Connect uses custom JWT authentication with bcrypt password hashing. OTP via email is used exactly once — at account registration — to prove email ownership. Daily login uses email + password only. JWT expires in 7 days with silent auto-refresh.

---

## First Admin — Database Seed

```
Deployed once at system setup:

  SQL seed script:
    INSERT INTO users (email, password_hash, role, full_name)
    VALUES ('admin@school.lk', bcrypt_hash, 'admin', 'School Principal')

This admin can then promote any pending registered user to
any role: teacher, security, or admin.
No further seeding is ever needed.
```

---

## Staff Registration Flow (Teacher & Security Guard)

Both teacher and security guard use the exact same self-registration flow.
The only difference is the role admin assigns at promotion.

```
1. Staff member opens the web dashboard URL
        ↓
2. Clicks Register → enters full name, email, password
        ↓
3. Backend sends 6-digit OTP to that email
   POST /api/auth/register → otp_verifications INSERT
        ↓
4. Staff enters OTP
   POST /api/auth/verify-otp
    → checks expiry (10 min), checks attempts (max 3)
    → marks OTP as used
    → CREATE user in users table with role: 'pending'
    → JWT issued with role: 'pending'
        ↓
5. Staff is now logged in but sees ONLY the pending approval screen
   → Zero API access (RBAC blocks all routes for role: pending)
   → Cannot see any dashboard content
        ↓
6. Admin opens Users → Pending Accounts
    → Sees staff member's name and email
    → Selects role to assign:
        Teacher  → must also pick class + subject
        Security → no extra assignment needed
        Admin    → for deputy principal
    → Clicks Confirm
    → Backend: UPDATE users SET role = ? WHERE id = ?
    → Backend: system email sent to staff: 'Your account has been approved'
        ↓
7. Staff logs in (or refreshes) → JWT re-issued with promoted role
   → Full dashboard access granted
   → Teacher sees My Classrooms with assigned class
   → Security guard redirected to /gate only
```

---

## Parent Registration Flow

```
1. Parent downloads Flutter app
        ↓
2. Taps Register → enters email + password
        ↓
3. Parent enters child's Student ID from physical school card
   e.g. SCH-2026-0042
        ↓
4. POST /api/auth/link-child { student_id_no: "SCH-2026-0042" }
    → Backend: SELECT * FROM students WHERE student_id_no = ?
    → One indexed lookup — instant
    → Returns: child name + class for confirmation
        ↓
5. App shows: "Is this your child? — Amal Bandara, Grade 8A"
   Parent taps YES
        ↓
6. Backend retrieves parent_email from student record
   → Sends 6-digit OTP to that email address
   → This is the email the school collected at enrollment
        ↓
7. Parent enters OTP from inbox
    → Verified → parent account created
    → parent_students row inserted (UNIQUE student_id enforced)
    → students.is_parent_linked = true
    → JWT issued with role: 'parent'
    → Home screen unlocked
        ↓
Mobile OTP fallback:
    If parent cannot access the email → taps "Use phone number instead"
    → Backend sends SMS OTP to parent_mobile stored in student record
    → Same verification flow, same result

Adding a second child (sibling):
    Profile → Add Child
    → Repeat Student ID + OTP flow for the sibling
    → New parent_students row created
    → App shows child switcher in header
```

---

## Login Flow (All Users)

```
1. Enter email + password
        ↓
2. POST /api/auth/login
    → SELECT user FROM users WHERE email = ?
    → bcrypt.compare(password, password_hash)
    → Check is_active = true, is_suspended = false
    → Check role !== 'pending' (pending → error: ACCOUNT_PENDING)
        ↓
3. Generate JWT:
   {
     userId: uuid,
     role: 'teacher' | 'security' | 'admin' | 'parent',
     email: string,
     iat: timestamp,
     exp: timestamp (7 days)
   }
        ↓
4. Return JWT + role + basic profile
        ↓
Web (teacher/admin)   → store in HTTP-only cookie (sameSite: strict)
Flutter (parent)      → store in flutter_secure_storage
        ↓
5. Role-based redirect:
   admin    → Admin Dashboard (Next.js)
   teacher  → My Classrooms (Next.js)
   security → /gate page only (Next.js, middleware-enforced)
   parent   → Home Dashboard (Flutter)
```

---

## Security Guard — Gate Page Enforcement

```
Security guard logs in with role: 'security'
        ↓
Next.js middleware (middleware.ts) runs on every request:
    → Extract JWT from cookie
    → Decode role
    → If role === 'security':
        → If path !== '/gate':
            → redirect(response, '/gate')
        → Proceed to /gate
    → If role !== 'security':
        → Normal role-based access
        ↓
/gate page:
    → Only shows gate scanner UI
    → No sidebar, no navigation
    → Back button has no history to go to
    → If staff tries to manually type /dashboard:
        → Middleware intercepts → redirects to /gate
```

---

## Biometric Login Flow (Flutter — Parent Only)

```
Prerequisites:
  → Parent has logged in once normally
  → Biometric enabled in Profile → Settings

Flow:
1. App opens → checks biometric_enabled flag in SharedPreferences
        ↓
2. Shows biometric prompt (fingerprint / face ID)
   using local_auth package
        ↓
3. Device authenticates locally (no network call)
        ↓
4. Retrieve stored JWT from flutter_secure_storage
        ↓
5. POST /api/auth/refresh → validate JWT with backend
        ↓
6. Valid  → Home Dashboard
   Expired → full login required (clear biometric flag until re-login)
```

---

## JWT Middleware Flow (Every Protected Route)

```
Incoming Request
        ↓
authenticate middleware:
    → Extract JWT from:
        Web   → HTTP-only cookie
        Mobile → Authorization: Bearer header
    → Verify JWT signature (JWT_SECRET)
    → Check exp (not expired)
    → Decode payload → attach to request.user
    → If invalid/missing → 401 Unauthorized
        ↓
rbac middleware (if applied to route):
    → Check request.user.role against allowed roles array
    → Match   → proceed to controller
    → No match → 403 Forbidden
        ↓
Controller executes
```

---

## Silent Token Refresh

```
Web (Next.js):
    On every page load:
    → Check cookie JWT expiry
    → If < 1 day remaining: POST /api/auth/refresh
    → New JWT issued, replaces old cookie
    → Teacher stays logged in on school computer indefinitely
    → If token expired completely → redirect to login

Flutter:
    On app open:
    → Check flutter_secure_storage JWT
    → POST /api/auth/refresh
    → If valid → proceed
    → If expired → show login screen
```

---

## Forgot Password Flow

```
1. User taps 'Forgot password' on login screen
        ↓
2. Enters email address
   POST /api/auth/forgot-password
    → OTP generated and sent to that email
        ↓
3. User enters 6-digit OTP
   POST /api/auth/verify-otp (with type: 'password_reset')
    → OTP verified
        ↓
4. User sets new password
   POST /api/auth/reset-password { email, otp_id, new_password }
    → bcrypt.hash(new_password)
    → UPDATE users SET password_hash = ?
    → All existing JWTs invalidated (version bump or token blacklist)
```

---

## All Sessions Logout

```
POST /api/auth/logout-all
    → Backend: UPDATE users SET token_version = token_version + 1
    → All existing JWTs have old token_version → fail validation
    → Every device/browser is effectively logged out immediately

JWT payload includes token_version.
authenticate middleware compares payload.token_version
against users.token_version on every request.
Mismatch → 401 → redirect to login.
```

---

## OTP Configuration

```
Length       : 6 digits
Expiry       : 10 minutes
Max attempts : 3 (then lock — new OTP required)
Resend       : After 60 second cooldown
Delivery     : Email via Nodemailer (SMTP)
               SMS via Twilio or similar (mobile fallback for parents)
Used for     : Registration only + forgot password
NOT used for : Daily login
```

---

## JWT Configuration

```
Secret      : JWT_SECRET env variable (min 32 chars)
Expiry      : 7 days
Algorithm   : HS256
Storage     :
    Web     → HTTP-only cookie, sameSite: strict, secure: true
    Flutter → flutter_secure_storage (AES encrypted on device)
Payload     :
    {
      userId:        string (UUID)
      role:          string
      email:         string
      token_version: number
      iat:           number
      exp:           number
    }
```

---

## RBAC Permission Matrix

| Route Group | admin | teacher | security | parent | pending |
|-------------|-------|---------|----------|--------|---------|
| /api/auth/* | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/users/manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/school/students | ✅ | ✅ own class | ❌ | ❌ | ❌ |
| /api/gate/scan | ✅ | ❌ | ✅ | ❌ | ❌ |
| /api/gate/log | ✅ | ❌ | today only | ❌ | ❌ |
| /api/attendance/session | ❌ | ✅ | ❌ | ❌ | ❌ |
| /api/attendance/records | ✅ | ✅ own class | ❌ | ✅ own child | ❌ |
| /api/messages | ✅ view | ✅ | ❌ | ✅ | ❌ |
| /api/announcements/post | ✅ | ✅ class | ❌ | ❌ | ❌ |
| /api/complaints/submit | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/complaints/manage | ✅ | ✅ assigned | ❌ | ❌ | ❌ |
| /api/rag/upload | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/rag/query | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/grades/enter | ❌ | ✅ own class | ❌ | ❌ | ❌ |
| /api/admin/* | ✅ | ❌ | ❌ | ❌ | ❌ |
| All routes | ❌ | ❌ | ❌ | ❌ | ❌ pending = blocked |
