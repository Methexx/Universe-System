# 04 — Backend Structure

## Overview

The backend follows a feature-based modular architecture. Each feature (module) is fully self-contained with its own controller, service, routes, and schema files. This ensures clean separation of concerns and easy maintenance.

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
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.schema.ts
│   │   ├── academic/
│   │   │   ├── academic.controller.ts
│   │   │   ├── academic.service.ts
│   │   │   ├── academic.routes.ts
│   │   │   └── academic.schema.ts
│   │   ├── questions/
│   │   │   ├── questions.controller.ts
│   │   │   ├── questions.service.ts
│   │   │   ├── questions.routes.ts
│   │   │   └── questions.schema.ts
│   │   ├── ai/
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── rag.pipeline.ts
│   │   │   ├── embeddings.ts
│   │   │   └── ai.schema.ts
│   │   ├── attendance/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── attendance.routes.ts
│   │   │   └── attendance.schema.ts
│   │   ├── announcements/
│   │   │   ├── announcements.controller.ts
│   │   │   ├── announcements.service.ts
│   │   │   ├── announcements.routes.ts
│   │   │   └── announcements.schema.ts
│   │   ├── complaints/
│   │   │   ├── complaints.controller.ts
│   │   │   ├── complaints.service.ts
│   │   │   ├── complaints.routes.ts
│   │   │   └── complaints.schema.ts
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── notifications.schema.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── admin.routes.ts
│   │       └── admin.schema.ts
│   │
│   ├── config/
│   │   ├── supabase.ts         ← Supabase client
│   │   ├── firebase.ts         ← Firebase Admin SDK
│   │   ├── openai.ts           ← OpenAI client
│   │   └── env.ts              ← Env validation with Zod
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts  ← JWT verification
│   │   │   ├── rbac.ts          ← Role-based access control
│   │   │   └── errorHandler.ts  ← Global error handler
│   │   └── utils/
│   │       ├── otp.ts           ← OTP generate/verify
│   │       ├── jwt.ts           ← JWT helpers
│   │       ├── qr.ts            ← QR code generation
│   │       └── response.ts      ← Standard response helper
│   │
│   ├── app.ts                   ← Fastify instance + plugins
│   └── server.ts                ← Entry point
│
├── tests/
│   ├── auth.test.ts
│   ├── questions.test.ts
│   ├── attendance.test.ts
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
Handles HTTP request/response only
    → Parse request body
    → Call service
    → Return response
    → No business logic here
```

### service.ts
```
Contains all business logic
    → Database queries via Supabase
    → Data transformation
    → Error throwing
    → Calls other services if needed
```

### routes.ts
```
Defines routes for the module
    → HTTP method + path
    → Attach middleware (authenticate, rbac)
    → Point to controller function
```

### schema.ts
```
Zod validation schemas
    → Request body validation
    → Type definitions
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

// Register all module routes
import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import academicRoutes from './modules/academic/academic.routes'
import questionsRoutes from './modules/questions/questions.routes'
import aiRoutes from './modules/ai/ai.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'
import announcementsRoutes from './modules/announcements/announcements.routes'
import complaintsRoutes from './modules/complaints/complaints.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import adminRoutes from './modules/admin/admin.routes'

const app = Fastify({ logger: true })

// Plugins
app.register(cors)
app.register(helmet)
app.register(jwt, { secret: process.env.JWT_SECRET })
app.register(multipart)

// Routes
app.register(authRoutes, { prefix: '/api/auth' })
app.register(usersRoutes, { prefix: '/api/users' })
app.register(academicRoutes, { prefix: '/api/academic' })
app.register(questionsRoutes, { prefix: '/api/questions' })
app.register(aiRoutes, { prefix: '/api/ai' })
app.register(attendanceRoutes, { prefix: '/api/attendance' })
app.register(announcementsRoutes, { prefix: '/api/announcements' })
app.register(complaintsRoutes, { prefix: '/api/complaints' })
app.register(notificationsRoutes, { prefix: '/api/notifications' })
app.register(adminRoutes, { prefix: '/api/admin' })

export default app
```

---

## RBAC Middleware Pattern

```typescript
// Usage in routes
app.get('/complaints', {
  preHandler: [authenticate, rbac(['admin'])]
}, controller.getAll)

// Multiple roles allowed
app.get('/questions', {
  preHandler: [authenticate, rbac(['student', 'lecturer'])]
}, controller.getAll)
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# JWT
JWT_SECRET=

# OpenAI
OPENAI_API_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

## Naming Conventions

```
Files      : kebab-case     → auth.service.ts
Classes    : PascalCase     → AuthService
Functions  : camelCase      → getUserById()
Variables  : camelCase      → userId
Constants  : UPPER_SNAKE    → JWT_SECRET
DB tables  : snake_case     → academic_profiles
```
