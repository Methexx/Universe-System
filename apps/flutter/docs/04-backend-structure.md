# 04 — Backend Structure

> School Connect — Node.js + Fastify (TypeScript)

---

## Architecture Pattern

Feature-based modular architecture. Each feature is fully self-contained with its own controller, service, routes, and schema files. Clean separation of concerns, easy to maintain and extend.

---

## Full Folder Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schema.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.schema.ts
│   │   │
│   │   ├── school/
│   │   │   ├── school.controller.ts   ← grades, classes, student records
│   │   │   ├── school.service.ts
│   │   │   ├── school.routes.ts
│   │   │   └── school.schema.ts
│   │   │
│   │   ├── gate/
│   │   │   ├── gate.controller.ts
│   │   │   ├── gate.service.ts
│   │   │   ├── gate.routes.ts
│   │   │   └── gate.schema.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── attendance.routes.ts
│   │   │   └── attendance.schema.ts
│   │   │
│   │   ├── messages/
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   ├── messages.routes.ts
│   │   │   └── messages.schema.ts
│   │   │
│   │   ├── announcements/
│   │   │   ├── announcements.controller.ts
│   │   │   ├── announcements.service.ts
│   │   │   ├── announcements.routes.ts
│   │   │   └── announcements.schema.ts
│   │   │
│   │   ├── complaints/
│   │   │   ├── complaints.controller.ts
│   │   │   ├── complaints.service.ts
│   │   │   ├── complaints.routes.ts
│   │   │   └── complaints.schema.ts
│   │   │
│   │   ├── grades/
│   │   │   ├── grades.controller.ts
│   │   │   ├── grades.service.ts
│   │   │   ├── grades.routes.ts
│   │   │   └── grades.schema.ts
│   │   │
│   │   ├── rag/
│   │   │   ├── rag.controller.ts
│   │   │   ├── rag.service.ts
│   │   │   ├── rag.routes.ts
│   │   │   ├── rag.pipeline.ts        ← PDF → chunk → embed → store
│   │   │   ├── rag.embeddings.ts      ← OpenAI embedding calls
│   │   │   └── rag.schema.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── notifications.schema.ts
│   │   │
│   │   └── lost-found/
│   │       ├── lost-found.controller.ts
│   │       ├── lost-found.service.ts
│   │       ├── lost-found.routes.ts
│   │       └── lost-found.schema.ts
│   │
│   ├── config/
│   │   ├── supabase.ts               ← Supabase client (service key)
│   │   ├── firebase.ts               ← Firebase Admin SDK
│   │   ├── openai.ts                 ← OpenAI client
│   │   └── env.ts                    ← Env variable validation (Zod)
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts       ← JWT verification + attach user
│   │   │   ├── rbac.ts               ← Role-based access control
│   │   │   └── errorHandler.ts       ← Global error handler
│   │   │
│   │   └── utils/
│   │       ├── otp.ts                ← OTP generate/send/verify
│   │       ├── jwt.ts                ← JWT sign/verify helpers
│   │       ├── studentId.ts          ← Auto-generate SCH-YYYY-NNNN
│   │       ├── gradeCalc.ts          ← Auto letter grade from score
│   │       ├── fcm.ts                ← Firebase FCM send helpers
│   │       └── response.ts           ← Standard success/error response
│   │
│   ├── app.ts                        ← Fastify instance + plugins + routes
│   └── server.ts                     ← Entry point
│
├── tests/
│   ├── auth.test.ts
│   ├── gate.test.ts
│   ├── attendance.test.ts
│   ├── grades.test.ts
│   ├── rag.test.ts
│   └── complaints.test.ts
│
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── Dockerfile.dev
├── eslint.config.mjs
├── jest.config.cjs
├── nodemon.json
├── package.json
└── tsconfig.json
```

---

## Module File Responsibilities

### controller.ts
```
Handles HTTP only:
  → Parse and validate request (uses schema)
  → Call service method
  → Format and return response
  → Never contains business logic
```

### service.ts
```
Contains all business logic:
  → Database queries via Supabase client
  → Data transformation and computation
  → Call other services when needed
  → Throw structured errors
  → Call FCM helper for notifications
```

### routes.ts
```
Defines routes for the module:
  → HTTP method + path
  → Attach middleware (authenticate, rbac)
  → Point to controller function
  → Attach Zod schema for validation
```

### schema.ts
```
Zod validation schemas:
  → Request body schemas
  → Query parameter schemas
  → Response type definitions
  → Shared between controller and service
```

---

## app.ts Structure

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import cookie from '@fastify/cookie'

import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import schoolRoutes from './modules/school/school.routes'
import gateRoutes from './modules/gate/gate.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'
import messagesRoutes from './modules/messages/messages.routes'
import announcementsRoutes from './modules/announcements/announcements.routes'
import complaintsRoutes from './modules/complaints/complaints.routes'
import gradesRoutes from './modules/grades/grades.routes'
import ragRoutes from './modules/rag/rag.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import lostFoundRoutes from './modules/lost-found/lost-found.routes'

const app = Fastify({ logger: true })

// Security plugins
app.register(cors, {
  origin: [process.env.WEB_URL!, process.env.FLUTTER_ORIGIN!],
  credentials: true
})
app.register(helmet)
app.register(cookie)
app.register(jwt, { secret: process.env.JWT_SECRET! })
app.register(multipart, { limits: { fileSize: 10_000_000 } }) // 10MB

// Routes
app.register(authRoutes,          { prefix: '/api/auth' })
app.register(usersRoutes,         { prefix: '/api/users' })
app.register(schoolRoutes,        { prefix: '/api/school' })
app.register(gateRoutes,          { prefix: '/api/gate' })
app.register(attendanceRoutes,    { prefix: '/api/attendance' })
app.register(messagesRoutes,      { prefix: '/api/messages' })
app.register(announcementsRoutes, { prefix: '/api/announcements' })
app.register(complaintsRoutes,    { prefix: '/api/complaints' })
app.register(gradesRoutes,        { prefix: '/api/grades' })
app.register(ragRoutes,           { prefix: '/api/rag' })
app.register(notificationsRoutes, { prefix: '/api/notifications' })
app.register(lostFoundRoutes,     { prefix: '/api/lost-found' })

export default app
```

---

## RBAC Middleware Pattern

```typescript
// rbac.ts — checks role against allowed list
export const rbac = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user // attached by authenticate middleware
    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      })
    }
  }
}

// Usage in routes.ts
app.get('/complaints', {
  preHandler: [authenticate, rbac(['admin'])]
}, controller.getAll)

// Multiple roles
app.get('/attendance/records', {
  preHandler: [authenticate, rbac(['teacher', 'admin'])]
}, controller.getRecords)

// Security role — gate endpoints only
app.post('/gate/scan', {
  preHandler: [authenticate, rbac(['security', 'admin'])]
}, controller.scan)
```

---

## Student ID Auto-Generation

```typescript
// utils/studentId.ts
export async function generateStudentId(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .like('student_id_no', `SCH-${year}-%`)

  const sequence = String((count || 0) + 1).padStart(4, '0')
  return `SCH-${year}-${sequence}`
  // e.g. SCH-2026-0042
}
```

---

## Letter Grade Auto-Calculation

```typescript
// utils/gradeCalc.ts
export function calculateLetterGrade(score: number): string {
  if (score >= 75) return 'A'  // Distinction
  if (score >= 65) return 'B'  // Merit
  if (score >= 55) return 'C'  // Credit
  if (score >= 35) return 'D'  // Pass
  return 'F'                   // Fail
}
```

---

## FCM Helper

```typescript
// utils/fcm.ts
import admin from 'firebase-admin'

export async function sendFCM(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  await admin.messaging().send({
    token,
    notification: { title, body },
    data: data || {},
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } }
  })
}

// Gate event notification
export async function notifyGateEvent(
  parentFcmToken: string,
  studentName: string,
  direction: 'IN' | 'OUT',
  time: string
) {
  const action = direction === 'IN' ? 'entered school' : 'left school'
  await sendFCM(
    parentFcmToken,
    `${studentName} ${action}`,
    `${studentName} ${action} at ${time}`,
    { type: 'gate_event', direction }
  )
}

// Absent notification
export async function notifyAbsent(
  parentFcmToken: string,
  studentName: string,
  subject: string,
  time: string
) {
  await sendFCM(
    parentFcmToken,
    `${studentName} marked absent`,
    `${studentName} was marked absent in ${subject} at ${time}`,
    { type: 'absent' }
  )
}
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Web origin (CORS)
WEB_URL=http://localhost:3000
FLUTTER_ORIGIN=http://localhost:3001

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# JWT
JWT_SECRET=minimum_32_character_random_secret

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Firebase Admin
FIREBASE_PROJECT_ID=school-connect-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@school-connect.iam.gserviceaccount.com

# Email (OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@school-connect.lk
SMTP_PASS=app_password

# School config
SCHOOL_START_TIME=07:30
              # used to flag late arrivals in gate events
```

---

## Naming Conventions

```
Files      : kebab-case     → auth.service.ts, gate.controller.ts
Classes    : PascalCase     → GateService, AttendanceController
Functions  : camelCase      → getStudentById(), createSession()
Variables  : camelCase      → studentId, parentToken
Constants  : UPPER_SNAKE    → JWT_SECRET, SCHOOL_START_TIME
DB tables  : snake_case     → attendance_sessions, gate_events
API routes : kebab-case     → /api/lost-found, /api/gate/scan
```
