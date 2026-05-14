# Universe System — Frontend Web App Deep Dive

> **Document 3 of 5** — Next.js 16 + React 19 web dashboard for Admin, Teacher, and Security roles.

**Location:** `apps/frontend/`
**Port:** `3000`
**Framework:** Next.js 16 App Router
**Language:** TypeScript (strict)
**Styling:** Tailwind CSS 3.4 + custom CSS

---

## Table of Contents

1. [What Does the Frontend Do?](#what-does-the-frontend-do)
2. [Tech Stack & Packages](#tech-stack--packages)
3. [Folder Structure](#folder-structure)
4. [Routing — Every Page Mapped](#routing--every-page-mapped)
5. [Auth & Session Management](#auth--session-management)
6. [State Management](#state-management)
7. [API Integration Layer](#api-integration-layer)
8. [Feature Modules Walkthrough](#feature-modules-walkthrough)
9. [UI / Component System](#ui--component-system)
10. [Styling Approach](#styling-approach)
11. [Build & Deployment](#build--deployment)
12. [Linting & Quality](#linting--quality)
13. [Notable Patterns & Conventions](#notable-patterns--conventions)

---

## What Does the Frontend Do?

The Next.js web app is the **staff-facing dashboard** for the Universe System. It is used by three roles:

| Role | What they do |
|---|---|
| **Admin** | Approve registrations, manage students/teachers/classes, view system logs, run policy RAG, see complaints, monitor gate activity, send school-wide notices |
| **Teacher** | Mark attendance, post class notices, message parents (with AI draft), publish term results, manage own classes |
| **Security** | Scan QR at gate (camera + zxing), view recent gate logs, message admin |

> Parents do **not** use this web app — they use the Flutter mobile app instead.

---

## Tech Stack & Packages

### Core

| Package | Version | What it does |
|---|---|---|
| `next` | 16.1.6 | App Router framework (SSR + RSC + Routing) |
| `react` | 19.2.3 | UI library |
| `react-dom` | 19.2.3 | DOM bindings |
| `typescript` | 5.x | Static typing |

### UI & Styling

| Package | Version | What it does |
|---|---|---|
| `tailwindcss` | 3.4.19 | Utility-first styling |
| `postcss` | latest | CSS processor (used by Tailwind) |
| `clsx` | 2.1.1 | Conditional className strings |
| `tailwind-merge` | 3.5.0 | Resolve Tailwind conflicts (`merge('p-4', 'p-6') === 'p-6'`) |
| `framer-motion` | 12.38.0 | Page/component animations |
| `lucide-react` | 1.8.0 | Open-source SVG icon set |

### Forms & Validation

| Package | Version | What it does |
|---|---|---|
| `react-hook-form` | 7.73.1 | Form state, validation, performance |
| `zod` | 4.3.6 | Runtime + compile-time schemas (matches backend) |
| `@hookform/resolvers` | 5.2.2 | Bridge Zod → react-hook-form |

### Data Visualization

| Package | Version | What it does |
|---|---|---|
| `recharts` | 3.8.1 | Charts (gate trends, attendance summary) |

### QR / Barcode (used by Security dashboard)

| Package | Version | What it does |
|---|---|---|
| `qrcode` | 1.5.4 | Render QR codes (for student ID cards) |
| `react-qr-code` | 2.0.18 | React wrapper for QR rendering |
| `@zxing/browser` | 0.2.0 | Webcam-based scanner |
| `@zxing/library` | 0.22.0 | Core barcode library |

### Backend Access

| Package | Version | What it does |
|---|---|---|
| `@supabase/supabase-js` | 2.105.1 | Direct Supabase client (used for realtime; primary path goes through backend API) |
| `redis` | 5.11.0 | Redis client (only used in Edge/route handlers if direct cache access needed) |

### Dev Tooling

| Package | Purpose |
|---|---|
| `eslint@9.x` | Linter |
| `eslint-config-next` | Next.js + React Hooks rules |
| `@types/react`, `@types/node`, `@types/react-dom` | TypeScript stubs |
| `tailwindcss/postcss` | PostCSS preset |

---

## Folder Structure

```
apps/frontend/
├── public/                            ← Static files (favicons, images)
├── src/
│   ├── app/                           ← Next.js App Router (folder = route segment)
│   │   ├── layout.tsx                 ← Root layout: providers (AuthContext), <html><body>
│   │   ├── page.tsx                   ← / → redirect to /login
│   │   ├── globals.css                ← Tailwind directives + CSS variables
│   │   ├── favicon.ico
│   │   ├── not-found.tsx              ← 404
│   │   │
│   │   ├── login/page.tsx             ← Public login form
│   │   ├── register/page.tsx          ← Multi-step parent reg (also staff)
│   │   ├── forgot-password/page.tsx
│   │   ├── pending/page.tsx           ← "Your account is pending admin approval"
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx             ← Admin-only wrapper, RBAC guard, sidebar
│   │   │   ├── overview/
│   │   │   │   ├── page.tsx           ← Dashboard cards (stats, recent activity)
│   │   │   │   ├── pending-requests/page.tsx ← Approve/reject users
│   │   │   │   └── policies/page.tsx  ← RAG chatbot
│   │   │   ├── attendance/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── enrollments/page.tsx
│   │   │   ├── complaints/page.tsx
│   │   │   ├── logs/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── notices/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── teachers/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── layout.tsx             ← Teacher-only wrapper
│   │   │   ├── overview/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── classes/page.tsx
│   │   │   ├── complaints/page.tsx
│   │   │   ├── lost-and-found/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── notices/page.tsx
│   │   │   ├── results/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   └── security/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx     ← QR scanner + manual entry
│   │       ├── logs/page.tsx
│   │       ├── messages/page.tsx
│   │       ├── overview/page.tsx
│   │       └── profile/page.tsx
│   │
│   ├── core/                          ← App-wide config
│   │   ├── config/
│   │   └── constants/
│   │
│   ├── features/                      ← Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── auth-shell.tsx     ← Shared layout (logo, carousel side panel)
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── forgot-password-form.tsx
│   │   │   ├── context/AuthContext.tsx ← Global { user, login, logout, loading }
│   │   │   ├── lib/
│   │   │   │   ├── auth-api.ts        ← fetch wrappers
│   │   │   │   ├── register-api.ts
│   │   │   │   ├── register-schemas.ts ← Zod schemas
│   │   │   │   └── validators.ts
│   │   │   └── types/auth.ts
│   │   │
│   │   ├── attendance/lib/attendance-api.ts
│   │   ├── gate/lib/gate-api.ts
│   │   ├── messages/
│   │   │   ├── components/MessagesContainer.tsx
│   │   │   ├── context/UnreadMessagesContext.tsx
│   │   │   └── lib/messages-api.ts
│   │   ├── notices/lib/notices-api.ts
│   │   ├── complaints/lib/complaints-api.ts
│   │   ├── results/lib/results-api.ts
│   │   ├── rag/lib/rag-api.ts
│   │   └── school/lib/school-api.ts
│   │
│   ├── shared/                        ← Cross-feature reusables
│   │   ├── components/
│   │   │   ├── auth/                  ← AuthButton, AuthInput, GoogleButton, AuthCarousel
│   │   │   │   └── register/          ← OtpInput, PasswordStrengthBar, StepIndicator, StepOne...
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.tsx ← Sidebar + topbar + content
│   │   │   │   └── Header.tsx
│   │   │   ├── admin/                 ← StudentProfileCard, EditStudentModal, GradesHistory
│   │   │   ├── ui/                    ← Generic primitives (Button, Modal, Input, ...)
│   │   │   └── AttendanceCalendar.tsx
│   │   ├── hooks/useCachedFetch.ts
│   │   └── lib/                       ← cn(), formatDate(), etc.
│   │
│   └── custom.d.ts                    ← Module declarations for imports
│
├── .env.local                         ← Local environment (gitignored)
├── eslint.config.mjs                  ← Flat config (ESLint 9)
├── next.config.ts                     ← Next.js config
├── tsconfig.json                      ← strict, paths aliases
├── postcss.config.mjs
├── tailwind.config.ts
├── Dockerfile.dev
└── package.json
```

---

## Routing — Every Page Mapped

The App Router uses the file system as routing convention. Each `page.tsx` is a route.

### Public Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | redirects → `/login` | — |
| `/login` | login-form | Email + password → JWT cookie |
| `/register` | multi-step `RegisterFlow` | Step 1: details → Step 2: OTP → Step 3: pending |
| `/forgot-password` | forgot-password-form | Send OTP → reset |
| `/pending` | message page | Shown when `role==="pending"` |

### Admin Routes (`/admin/*`)

| Route | Page Purpose |
|---|---|
| `/admin/overview` | Stats dashboard (students, teachers, today's gate count, etc.) |
| `/admin/overview/pending-requests` | List + promote/reject pending users |
| `/admin/overview/policies` | RAG chatbot for school policy Q&A |
| `/admin/attendance` | View attendance across all classes |
| `/admin/calendar` | School-wide calendar |
| `/admin/enrollments` | Create/edit student enrollments |
| `/admin/complaints` | All complaints; assign to staff; view replies |
| `/admin/logs` | System activity / audit log |
| `/admin/messages` | Admin inbox |
| `/admin/notices` | Create/delete school-wide notices |
| `/admin/students` | Student CRUD with photo upload |
| `/admin/teachers` | Teacher list, suspend/unsuspend |
| `/admin/profile` | Personal admin profile |

### Teacher Routes (`/teacher/*`)

| Route | Page Purpose |
|---|---|
| `/teacher/overview` | Dashboard: my classes, today's tasks |
| `/teacher/attendance` | Open class today → mark students → submit session |
| `/teacher/calendar` | Class calendar |
| `/teacher/classes` | List of classes I teach |
| `/teacher/complaints` | Complaints assigned to me |
| `/teacher/lost-and-found` | View/manage lost items |
| `/teacher/messages` | Conversations with parents (AI draft helper) |
| `/teacher/notices` | Post class notices |
| `/teacher/results` | Term result entry: select term → class → modules → grades → publish |
| `/teacher/profile` | Teacher profile |

### Security Routes (`/security/*`)

| Route | Page Purpose |
|---|---|
| `/security/overview` | Today's stats: checked-in count |
| `/security/dashboard` | **QR scanner via webcam + manual student lookup** |
| `/security/logs` | Recent gate events table |
| `/security/messages` | Direct chat with admin |
| `/security/profile` | Security profile |

---

## Auth & Session Management

### `AuthContext.tsx` — Global Auth State

```typescript
// src/features/auth/context/AuthContext.tsx
type AuthUser = {
  userId: string;
  email: string;
  role: 'admin' | 'teacher' | 'security' | 'parent' | 'pending';
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  gender?: string;
  last_seen?: string;
  classes_taught?: Array<{
    id: string;
    name: string;
    school_grade: { id: string; name: string };
  }>;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email, password) => Promise<{ok:true} | {ok:false, error}>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};
```

### Auth Flow

```
1. <RootLayout> wraps children with <AuthProvider>
2. AuthProvider on mount calls getMe() → /api/auth/me
   - If 200 → setUser
   - If 401 → user stays null
3. Pages that need the user use `useAuth()` hook
4. Role-specific layouts (admin/layout.tsx) read user and:
   - If null && !loading → router.push('/login')
   - If user.role !== 'admin' → router.push(`/${user.role}/overview`)
```

### Login Flow

```
1. User submits <LoginForm />
2. POST /api/auth/login (credentials:'include') → backend sets httpOnly cookie
3. On success → context.refresh() → getMe()
4. Router push to /{role}/overview
```

### Cookies vs Tokens

The backend supports **both**:
- HttpOnly cookie `auth_token` (preferred for browser security — protects against XSS)
- `Authorization: Bearer <token>` header (used by Flutter)

Frontend uses **cookies only**; all `fetch()` calls include `credentials: 'include'`.

---

## State Management

| Concern | Approach |
|---|---|
| **Auth user** | React Context (`AuthContext`) |
| **Unread message badge** | React Context (`UnreadMessagesContext`) |
| **Form state** | `react-hook-form` (local to form) |
| **Server data** | Custom `useCachedFetch` hook (small built-in cache) |
| **Page-level state** | `useState` / `useReducer` |
| **URL state** | `useSearchParams`, `useRouter` (Next.js) |

There is **no Redux, Zustand, or Tanstack Query**. Data fetching is direct `fetch()` calls wrapped in feature-level API libraries.

### `useCachedFetch` (`src/shared/hooks/useCachedFetch.ts`)

A lightweight hook that:
- Caches responses in-memory by URL key
- Returns `{ data, error, loading, refresh }`
- Re-fetches on mount unless cached value exists and isn't stale

---

## API Integration Layer

### The `request<T>` Pattern

Every feature has a `*-api.ts` file with a typed `request()` helper:

```typescript
// src/features/auth/lib/auth-api.ts (abridged)
type Response<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; retry_after?: number };

async function request<T>(path: string, init?: RequestInit): Promise<Response<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers }
    });
    const body = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: body.message ?? 'Request failed',
        retry_after: res.headers.get('retry-after') ? Number(res.headers.get('retry-after')) : undefined
      };
    }
    return { ok: true, data: body.data };
  } catch (e) {
    return { ok: false, status: 0, error: 'Network error' };
  }
}

export const loginUser = (email, password) =>
  request<{ token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const getMe = () =>
  request<AuthUser>('/api/auth/me');
```

### Base URL

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
```

### Per-feature API libs

| File | Exports |
|---|---|
| `features/auth/lib/auth-api.ts` | login, logout, getMe, register, verifyOtp, completeRegistration, forgotPassword, resetPassword |
| `features/auth/lib/register-api.ts` | startRegistration, resendOtp |
| `features/attendance/lib/attendance-api.ts` | createSession, submitSession, getSession, getDates, getSummary |
| `features/gate/lib/gate-api.ts` | scan, search, getEvents, getStats, getTimeseries |
| `features/messages/lib/messages-api.ts` | getInbox, getContacts, getThread, sendMessage, markRead, aiDraft |
| `features/notices/lib/notices-api.ts` | createAnnouncement, listAnnouncements, deleteAnnouncement |
| `features/complaints/lib/complaints-api.ts` | listAll, assignComplaint, updateStatus |
| `features/results/lib/results-api.ts` | listTerms, createTerm, getOrCreateResultSet, saveResults, publish, unpublish |
| `features/rag/lib/rag-api.ts` | listDocuments, uploadDocument, deleteDocument, queryRag, getEvalReport |
| `features/school/lib/school-api.ts` | createGrade, listGrades, createClass, listClasses, createStudent, listStudents, uploadStudentPhoto |

---

## Feature Modules Walkthrough

### `features/auth/` — Login + Multi-step Registration

The registration flow has 3 steps managed by `RegisterFlow.tsx`:

```
StepOneDetails → StepTwoOtp → StepThreePending
   (form)         (6 boxes)     (waiting page)
```

Components:
- `OtpInput` — 6 individual input boxes, auto-advance on type, paste support
- `PasswordStrengthBar` — Live visual indicator using regex rules
- `StepIndicator` — Animated step dots

### `features/messages/` — Real-time-ish messaging

The `MessagesContainer` is a full inbox UI:
- Left panel: contact list
- Right panel: thread view + composer
- `UnreadMessagesContext` exposes a count badge to sidebar
- Polling (no WebSockets) — every N seconds the inbox refreshes
- AI draft button calls `POST /api/messages/ai-draft` and inserts the suggested text

### `features/rag/` — Policy Chatbot

Used in `/admin/overview/policies`:
- Upload PDF → uploads progress shown via custom progress UI
- Ask question → calls `POST /api/rag/query`
- Displays answer with source snippets (clickable to expand)

### `features/gate/` — Security Dashboard QR Scanner

`/security/dashboard` uses **@zxing/browser**:
```typescript
import { BrowserMultiFormatReader } from '@zxing/browser';

const reader = new BrowserMultiFormatReader();
reader.decodeFromConstraints(
  { video: { facingMode: 'environment' } },
  videoRef.current,
  (result) => {
    if (result) {
      const qrPayload = result.getText();
      scanGate(qrPayload, direction);
    }
  }
);
```

When a scan succeeds:
1. Decode QR → `qr_code` string
2. Show student card (photo, name, class)
3. Security clicks IN or OUT button
4. `POST /api/gate/scan` → success animation → parent gets FCM push

### `features/school/` — Admin Student & Class Management

`/admin/students`:
- List with search + pagination
- Add student modal: form + photo upload (separate endpoint `/students/photo`)
- `StudentProfileCard` shows details
- `EditStudentModal` edits in place
- `GradesHistory` shows result sets across terms

`/admin/teachers`:
- List, promote pending → teacher, suspend/unsuspend

`/admin/enrollments`:
- Tree view of `Grade → Classes → Students` from `/grades-with-classes` + drill-down

### `features/results/` — Term Result Entry

`/teacher/results`:
- Select term (or create new via inline form)
- Select class (only teacher's classes shown)
- Backend auto-creates ResultSet (`GET /api/results/class/:classId?term_id=...`)
- Editable grid: rows = students, columns = modules
- Add/rename modules dynamically
- PATCH `/api/results/:resultSetId` saves entire matrix
- POST `/api/results/:resultSetId/publish` makes visible to parents

---

## UI / Component System

### No Pre-Built Library

The frontend deliberately does **not** use shadcn/ui, MUI, Chakra, or any UI kit. All components are **hand-rolled** to match the school's specific design (rounded cards, soft teal palette, generous whitespace).

### Component Categories

```
shared/components/
├── ui/                            ← Primitives
│   ├── Button.tsx                 ← Primary, secondary, outline, sizes
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   └── Toast.tsx
├── auth/                          ← Auth-page specifics
│   ├── auth-button.tsx
│   ├── auth-input.tsx
│   ├── auth-checkbox.tsx
│   ├── auth-carousel.tsx          ← Side panel image carousel on login
│   ├── auth-layout.tsx
│   ├── google-button.tsx
│   └── register/
│       ├── OtpInput.tsx
│       ├── PasswordStrengthBar.tsx
│       ├── RegisterFlow.tsx       ← orchestrates 3 steps
│       ├── StepIndicator.tsx
│       ├── StepOneDetails.tsx
│       ├── StepTwoOtp.tsx
│       └── StepThreePending.tsx
├── layout/
│   ├── DashboardLayout.tsx        ← role-aware sidebar + topbar
│   └── Header.tsx
├── admin/
│   ├── StudentProfileCard.tsx
│   ├── AddStudentButton.tsx
│   ├── EditStudentModal.tsx
│   └── GradesHistory.tsx
└── AttendanceCalendar.tsx         ← Shared between admin & teacher
```

### Animations

`framer-motion` is used for:
- Page transitions (fade + slide)
- Card hover states
- Modal enter/exit
- Toast notifications

---

## Styling Approach

### Tailwind Configuration

`tailwind.config.ts` extends:
- Custom palette: `primary` (teal #1A3A44 mirroring Flutter), `accent`, `surface`, `muted`
- Font family: `Kumbh Sans` (Google Fonts via `next/font`)
- Custom shadows: `card`, `soft`
- Custom border radii

### `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1A3A44;
  --color-bg:      #F0FBFF;
  --color-text:    #101820;
  --radius-card:   16px;
}
```

### Class Composition Helper

```typescript
// shared/lib/cn.ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes) => twMerge(clsx(...classes));
```

Used everywhere:
```tsx
<button className={cn('px-4 py-2 rounded-md bg-primary', isLoading && 'opacity-50', className)}>
```

---

## Build & Deployment

### npm Scripts

```json
{
  "dev":   "next dev",
  "build": "next build",
  "start": "next start",
  "lint":  "eslint src/"
}
```

### `next.config.ts`

Standard Next.js 16 config. Image domains configured for Supabase storage URLs.

### `vercel.json` (repo root)

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

This tells Vercel to:
1. Run `npm install` at repo root (so workspaces resolve)
2. Build with default Next.js production config
3. Output to `.next/`

### Environment Variables

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL (`http://localhost:5000` dev, Railway URL prod) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public-safe anon key |

`NEXT_PUBLIC_*` prefix exposes the value to the browser bundle.

---

## Linting & Quality

### ESLint 9 Flat Config (`eslint.config.mjs`)

```javascript
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**', 'build/**', '*.lock']
  }
];
```

### Run

```bash
npm run lint          # from apps/frontend/
npm run frontend:lint # from repo root
```

### Pre-commit

Husky pre-commit hook runs lint-staged, which runs `eslint --fix` on changed files only.

---

## Notable Patterns & Conventions

### File Naming

| Pattern | Used For |
|---|---|
| `kebab-case.tsx` | Files |
| `PascalCase.tsx` | Components (some files) — mix exists, `kebab-case` preferred for new |
| `useCamelCase.ts` | Custom hooks |
| `*-api.ts` | Backend API wrappers |
| `*-schemas.ts` | Zod schemas |

### Route-Specific Layouts

Each role has a `layout.tsx` that:
1. Reads `useAuth()` user
2. Redirects to `/login` if not authenticated
3. Redirects to correct role overview if mismatched role
4. Renders `<DashboardLayout role="admin">` with sidebar + topbar

### Server vs Client Components

- **Server components** (default in App Router): static pages, layouts
- **Client components** (`'use client'` directive): all interactive pages (forms, scanners, dashboards)

Since this app is highly interactive, **almost every page is `'use client'`**.

### Type Sharing with Backend

Types are **not** imported across packages (no `tsconfig` path to `apps/backend/src`). Instead, types are duplicated:
- Backend defines them via `z.infer<typeof schema>` in `*.schema.ts`
- Frontend re-declares them in `features/<feature>/types/` or inline

The Zod schemas in `features/auth/lib/register-schemas.ts` mirror the backend's so that both sides validate identically.

### Error & Loading States

Convention:
```tsx
if (loading) return <Spinner />;
if (error)   return <ErrorBanner message={error} />;
return <RealUI data={data} />;
```

---

## Testing

The frontend currently has **no test suite** configured. CI (`ci.yml`) only runs backend + Flutter tests. This is a known gap — Jest + React Testing Library or Playwright would be the conventional addition.

---

**Next:** [04-FLUTTER-MOBILE-APP.md](04-FLUTTER-MOBILE-APP.md) — Flutter parent-facing mobile app.
