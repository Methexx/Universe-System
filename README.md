<div align="center">

# 🎓 UniVerse — School Management Platform
 
![Fastify](https://img.shields.io/badge/Fastify-5.7-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flutter](https://img.shields.io/badge/Flutter-3.32-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

**Connecting Admins • Teachers • Security • Parents through one unified backend, a web dashboard, and a mobile app.**

</div>

---

## ✨ What's Inside

<table>
<tr>
<td>

🔐 **Auth & RBAC**
JWT + bcrypt + OTP, 5 roles (admin/teacher/security/parent/pending), parent 2FA

🚪 **Gate System**
QR scan IN/OUT + auto-checkout cron at 18:00 + parent FCM alerts

✅ **Attendance**
Daily sessions, batch submit, calendar view, parent visibility

📊 **Results**
Per-term modules, grades, publish/unpublish flow

</td>
<td>

💬 **Messaging**
Threads, contacts, AI draft suggestions

📢 **Announcements**
School-wide & class-scoped notices

🤖 **RAG Chatbot**
Policy PDFs → Gemini embeddings (768-dim pgvector) → hybrid search → LLM

🙋 **Complaints**
Parent → admin → staff triage, status state machine

</td>
<td>

🔔 **Push Notifications**
Firebase FCM (multicast)

🔍 **Lost & Found**
Items posted by staff, reports filed by parents

📧 **Email**
Resend OTPs & approval notifications

⚡ **Cache**
Redis for RAG, sessions, online status (graceful degrade)

</td>
</tr>
</table>

---

## 📁 Project Structure

```
Universe-System/                              🟦 npm workspace monorepo
│
├── 🟩 apps/
│   ├── backend/                              ⚙️  Fastify + Prisma REST API  ·  :5000
│   │   ├── src/
│   │   │   ├── server.ts · app.ts            🚀 entry + Fastify config
│   │   │   ├── config/                       🔧 env · prisma · redis · firebase · supabase
│   │   │   ├── common/{middleware,utils}/    🛡️  authenticate · rbac · errorHandler · jwt · hash · otp · email · cache
│   │   │   └── modules/                      📦 11 feature modules
│   │   │       ├── auth/ · users/ · school/
│   │   │       ├── gate/ · attendance/
│   │   │       ├── announcements/ · messages/
│   │   │       ├── complaints/ · lost-found/ · results/
│   │   │       └── rag/{controllers,services}  🤖 chunker · embedder · retrieval · generation
│   │   ├── prisma/schema.prisma              🗄️  20 models · pgvector · uuid-ossp
│   │   ├── tests/{unit,integration}/         🧪 Jest + supertest
│   │   ├── Dockerfile.dev · jest.config.js
│   │   └── package.json
│   │
│   ├── frontend/                             🌐 Next.js 16 + React 19 + Tailwind  ·  :3000
│   │   ├── src/
│   │   │   ├── app/                          📍 App Router
│   │   │   │   ├── login/ · register/ · forgot-password/ · pending/
│   │   │   │   ├── admin/    {overview,attendance,students,teachers,complaints,notices,...}
│   │   │   │   ├── teacher/  {overview,attendance,classes,results,messages,notices,...}
│   │   │   │   └── security/ {dashboard,logs,messages,overview,profile}
│   │   │   ├── features/                     🧩 auth · attendance · gate · messages · notices · complaints · results · rag · school
│   │   │   ├── shared/components/            🎨 layout · auth · admin · ui · AttendanceCalendar
│   │   │   ├── shared/hooks/ · shared/lib/
│   │   │   └── core/
│   │   ├── Dockerfile.dev · eslint.config.mjs
│   │   └── package.json
│   │
│   └── flutter/                              📱 Flutter parent app (Android/iOS)
│       ├── lib/
│       │   ├── main.dart · app.dart · firebase_options.dart
│       │   ├── core/                         🔧 api · di · navigation · services · storage
│       │   ├── features/                     🧩 15 modules
│       │   │   ├── splash/ · auth/ · dashboard/ · profile/
│       │   │   ├── attendance/ · gate/ · results/
│       │   │   ├── messages/ · contact_teacher/ · notices/
│       │   │   ├── chatbot/ · support/ · lost_and_found/
│       │   │   ├── notifications/ · settings/
│       │   └── shared/{themes,widgets}/      🎨 ActionCard · AppButton · LiveClockWidget
│       ├── android/ · ios/
│       ├── test/widget_test.dart
│       ├── .githooks/{pre-commit,pre-push}
│       └── pubspec.yaml
│
├── 🟪 .github/workflows/
│   ├── ci.yml                                ✅ PR tests (backend + flutter)
│   └── flutter-release.yml                   📦 APK auto-build on release/development
│
├── 🟧 .husky/                                🪝 pre-commit · pre-push · commit-msg (commitlint)
├── 🟫 Doc/                                   📚 10 detailed reference docs
├── 🟨 Documentation/                         📖 5 comprehensive guides (overview · backend · frontend · flutter · devops)
│
├── 🐳 docker-compose.yml                     production stack
├── 🐳 docker-compose.dev.yml                 dev stack (hot reload)
├── 📦 package.json · package-lock.json       single root workspace
├── 🎨 .prettierrc · commitlint.config.js     code style + conventional commits
├── ⚡ vercel.json                            Vercel deploy config
└── 🔌 .mcp.json                              MCP servers (Supabase)
```

---

## 🐳 Quick Start with Docker

> 🟢 **One command. Three services up.**

```bash
# 1️⃣  Set env vars
cp apps/backend/.env.example apps/backend/.env       # fill in secrets
touch apps/frontend/.env.local                       # add NEXT_PUBLIC_API_URL=http://backend:5000

# 2️⃣  Run the dev stack (hot reload)
docker compose -f docker-compose.dev.yml up --build

# 3️⃣  Stop
docker compose -f docker-compose.dev.yml down
```

### 🟢 Services started

| Service | URL | Container |
|---|---|---|
| 🟦 **Backend API** | http://localhost:5000 | `universe-backend` |
| 💚 **Health Check** | http://localhost:5000/health | — |
| 🟪 **Web Frontend** | http://localhost:3000 | `universe-frontend` |
| 🔴 **Redis** | localhost:6379 | `universe-redis` |

### 🔵 Production stack

```bash
docker compose up --build      # uses docker-compose.yml (no volume mounts, NODE_ENV=production)
```

---

## 🧑‍💻 Run Without Docker

```bash
npm install                                          # install all workspaces
npm run prisma:generate --prefix apps/backend        # generate Prisma client

# Two terminals
npm run backend:dev          # ⚙️  http://localhost:5000
npm run frontend:dev         # 🌐 http://localhost:3000

# Flutter (3rd terminal)
cd apps/flutter && flutter pub get && flutter run
```

> 📲 Android emulator uses `http://10.0.2.2:5000` · iOS simulator uses `http://127.0.0.1:5000`.

---

## 🔑 Required Environment Variables

<details>
<summary>🟦 <b>Backend</b> — <code>apps/backend/.env</code></summary>

```env
PORT=5000
DATABASE_URL=postgresql://...                # Supabase pooled
DIRECT_URL=postgresql://...                  # Supabase direct (Prisma migrations)
REDIS_URL=redis://redis:6379                 # optional (graceful degrade)
JWT_SECRET=...                               # min 32 chars
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
RESEND_API_KEY=re_...
GEMINI_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
WEB_URL=http://localhost:3000
FLUTTER_ORIGIN=http://localhost:3001
```
</details>

<details>
<summary>🟪 <b>Frontend</b> — <code>apps/frontend/.env.local</code></summary>

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
</details>

<details>
<summary>📱 <b>Flutter</b> — build-time</summary>

```bash
flutter build apk --dart-define=API_BASE_URL=https://api.yourdomain.com
```
</details>

---

## 🎯 Tech Stack at a Glance

| Layer | Backend | Web | Mobile |
|---|---|---|---|
| **Framework** | 🟢 Fastify 5 | ⚫ Next.js 16 App Router | 🔵 Flutter 3.32 |
| **Language** | 🔷 TypeScript | 🔷 TypeScript | 🎯 Dart |
| **State / Data** | Prisma 6 + PostgreSQL | React 19 + Context | Provider + Repositories |
| **HTTP** | Built-in (Fastify) | fetch + credentials | Dio + interceptors |
| **Validation** | Zod 4 | Zod + react-hook-form | Custom |
| **Auth** | JWT (7d) + bcrypt + OTP | HttpOnly cookies | flutter_secure_storage + biometric |
| **Cache / Realtime** | Redis 7 | — | FCM + local notifications |
| **AI** | Gemini embeddings + LLM | — | Calls backend RAG |
| **Testing** | 🟡 Jest (3 of 11 modules) | 🔴 None yet | 🔴 1 smoke test |
| **Hosting** | Railway | Vercel | GitHub Releases / TestFlight |

---

## 🪝 Git Hooks (auto-enforced)

| Hook | Action |
|---|---|
| 🟢 `pre-commit` | ESLint --fix on staged files |
| 🟡 `pre-push` | Lint + production build |
| 🔵 `commit-msg` | Conventional Commits (`feat:` `fix:` `docs:` ...) |
| 📱 Flutter `pre-commit` | `dart format` staged `.dart` files |
| 📱 Flutter `pre-push` | `flutter test` |

---

## 🚦 CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| 🟢 `ci.yml` | Every PR | Backend unit + integration tests · Flutter widget tests |
| 📦 `flutter-release.yml` | Push to `release/development` | Builds debug APK · Auto-bumps semver tag · Publishes GitHub Release |

---

## 📚 Documentation

| Folder | Contents |
|---|---|
| 📖 [`Documentation/`](Documentation/) | **5 comprehensive guides** — overview · backend · frontend · flutter · devops |
| 📚 [`Doc/`](Doc/) | **10 deep references** — schema · auth flow · API · realtime · sprints · production checklist |

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| 🟢 `main` | Production-ready |
| 🟡 `release/development` | Active integration (triggers Flutter APK build) |
| 🔵 `feature/*` | Individual work |

---

<div align="center">

**Built with ❤️ by [@Methexx](https://github.com/Methexx)**

📄 ISC License

</div>
