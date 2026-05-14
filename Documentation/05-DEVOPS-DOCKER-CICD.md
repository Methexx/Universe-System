# Universe System — DevOps, Docker, CI/CD & Tooling

> **Document 5 of 5** — Everything operational: Docker, GitHub Actions, deployment, environment, hooks, linting, scripts, and the complete package landscape.

---

## Table of Contents

1. [Repository-Level Layout](#repository-level-layout)
2. [npm Workspaces Setup](#npm-workspaces-setup)
3. [Docker & Containerization](#docker--containerization)
4. [Local Development — Two Paths](#local-development--two-paths)
5. [Environment Variables Master Reference](#environment-variables-master-reference)
6. [GitHub Actions CI/CD](#github-actions-cicd)
7. [Git Hooks (Husky + Native)](#git-hooks-husky--native)
8. [Linting, Formatting, Commit Validation](#linting-formatting-commit-validation)
9. [Deployment Targets](#deployment-targets)
10. [Complete Package Inventory (All Three Apps)](#complete-package-inventory-all-three-apps)
11. [Operational Playbooks](#operational-playbooks)
12. [Troubleshooting](#troubleshooting)

---

## Repository-Level Layout

```
Universe-System/
├── apps/
│   ├── backend/                    ← Node/Fastify
│   ├── frontend/                   ← Next.js
│   └── flutter/                    ← Flutter (not in npm workspaces)
│
├── .github/workflows/
│   ├── ci.yml                      ← PR checks: backend tests + Flutter tests
│   └── flutter-release.yml         ← Push to release/development → builds APK
│
├── .husky/
│   ├── pre-commit                  ← npm run precommit (lint + lint-staged)
│   ├── pre-push                    ← npm run prepush (lint + build)
│   ├── commit-msg                  ← commitlint validation
│   └── _/                          ← Husky internals (gitignored)
│
├── .vscode/                        ← VSCode workspace settings (MCP config)
├── .claude/                        ← Claude Code agent configuration
├── Doc/                            ← Existing detailed docs (10 files)
├── Documentation/                  ← This 5-document set
├── node_modules/                   ← Hoisted workspace deps
│
├── docker-compose.yml              ← Production-style stack
├── docker-compose.dev.yml          ← Dev stack with hot reload mounts
├── .dockerignore
│
├── package.json                    ← Root workspace manifest + scripts
├── package-lock.json               ← Single, authoritative lockfile
├── vercel.json                     ← Vercel deployment config
├── commitlint.config.js            ← Conventional Commits rules
├── .prettierrc                     ← Code formatting rules
├── .eslintignore
├── .gitignore
├── .mcp.json                       ← MCP servers (Supabase)
├── skills-lock.json                ← Claude skills lockfile
│
├── README.md                       ← Quick start + overview
├── TECH_STACK.md                   ← Tech dependency rationale
├── PROJECT_LOG.md                  ← Historical development log
├── PROJECT_REPORT.md               ← Detailed status report
├── firebase-debug.log              ← (transient debug output)
└── lint.log                        ← (transient lint output)
```

---

## npm Workspaces Setup

### Root `package.json`

```json
{
  "name": "universe-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/frontend", "apps/backend"],
  "scripts": {
    "frontend:dev":   "npm run dev --prefix apps/frontend",
    "frontend:lint":  "npm run lint --prefix apps/frontend",
    "frontend:build": "npm run build --prefix apps/frontend",
    "backend:dev":    "npm run dev --prefix apps/backend",
    "backend:test":   "npm run test --prefix apps/backend",
    "lint":           "npm run frontend:lint && npm run backend:lint",
    "precommit":      "npm run lint && lint-staged",
    "prepush":        "npm run lint && npm run frontend:build",
    "test":           "npm run backend:test",
    "build":          "npm run frontend:build",
    "prepare":        "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.2.7",
    "@commitlint/cli": "^19.3.0",
    "@commitlint/config-conventional": "^19.3.0",
    "prettier": "^3.3.3"
  },
  "lint-staged": {
    "apps/frontend/**/*.{js,jsx,ts,tsx}": [
      "npm run lint --prefix apps/frontend -- --fix"
    ],
    "apps/backend/**/*.{js,mjs,cjs,ts}": [
      "npm run lint --prefix apps/backend -- --fix"
    ]
  }
}
```

### Why Workspaces?

- **Single `node_modules/` hoisted at root** — shared deps deduplicated
- **One `package-lock.json`** — deterministic installs across all workspaces
- **Root scripts orchestrate sub-apps** — `npm run backend:dev` from root
- **`apps/flutter` is NOT in workspaces** — Dart has its own `pubspec.lock`

### Install

```bash
# Single command installs everything
npm install
```

Behind the scenes this:
1. Reads root `package.json` workspaces array
2. Installs each workspace's deps into the root `node_modules/`
3. Symlinks `apps/frontend/node_modules` and `apps/backend/node_modules` if needed
4. Runs `postinstall` hooks (Prisma generates client)
5. Runs `prepare` script → installs Husky

---

## Docker & Containerization

### Production Stack — `docker-compose.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: universe-redis
    restart: unless-stopped
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile.dev
    container_name: universe-backend
    restart: unless-stopped
    ports: ["5000:5000"]
    env_file: ./apps/backend/.env
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on: [redis]

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile.dev
    container_name: universe-frontend
    restart: unless-stopped
    ports: ["3000:3000"]
    env_file: ./apps/frontend/.env.local
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
      - NODE_ENV=production
    depends_on: [backend]

volumes:
  redis_data:
```

### Development Stack — `docker-compose.dev.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile.dev
    ports: ["5000:5000"]
    volumes:
      - ./apps/backend:/app/apps/backend
      - /app/apps/backend/node_modules         # Anonymous volume preserves container's node_modules
    env_file: ./apps/backend/.env
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on: [redis]

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile.dev
    ports: ["3000:3000"]
    volumes:
      - ./apps/frontend:/app/apps/frontend
      - /app/apps/frontend/node_modules
      - /app/apps/frontend/.next               # Don't shadow build artefacts
    env_file: ./apps/frontend/.env.local
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on: [backend]

volumes:
  redis_data:
```

### Key Differences (Dev vs Prod)

| Aspect | Dev | Prod |
|---|---|---|
| Volume mounts | ✅ Code mounted for hot reload | ❌ Code baked into image |
| node_modules | Anonymous volume preserves container's | Built into image |
| NODE_ENV | development (default) | production |
| Restart policy | none | unless-stopped |
| Use case | Iterative coding | Demo / staging |

> **Note:** Both compose files currently use `Dockerfile.dev` — there is no separate `Dockerfile.prod`. For real production, a multi-stage build with `npm ci --omit=dev` and `tsc` compilation would be the next step.

### Dockerfiles

#### `apps/backend/Dockerfile.dev`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --workspace=apps/backend
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

#### `apps/frontend/Dockerfile.dev`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci --workspace=apps/frontend
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**Image size:** ~150 MB for each (`node:20-alpine` base + workspace deps).

### `.dockerignore` (root)

```
node_modules/
apps/frontend/node_modules
apps/backend/node_modules
apps/frontend/.next
apps/backend/dist
.git/
**/.env
**/.env.local
coverage
**/*.dockerignore
**/Dockerfile*
```

Stops Docker from copying gigabytes of local node_modules into the build context — image build becomes ~10x faster.

---

## Local Development — Two Paths

### Path A — Without Docker (Recommended for daily dev)

```bash
# One-time
npm install
npm run prisma:generate --prefix apps/backend

# Each session
npm run backend:dev      # Terminal 1 → http://localhost:5000
npm run frontend:dev     # Terminal 2 → http://localhost:3000

# Flutter (in 3rd terminal)
cd apps/flutter
flutter pub get
flutter run
```

Requires:
- Node.js 20+
- Flutter 3.32.0 + Android Studio (for emulator) or Xcode (for iOS)
- Redis (optional) — run `docker run -p 6379:6379 redis:7-alpine` or skip
- `.env` files configured in `apps/backend/` and `apps/frontend/`

### Path B — With Docker Compose

```bash
# Dev stack with hot reload
docker compose -f docker-compose.dev.yml up --build

# Logs streamed from all containers
# Code changes in apps/backend/src/ or apps/frontend/src/ auto-restart

# Stop
docker compose -f docker-compose.dev.yml down

# Stop + clean volumes (resets Redis data)
docker compose -f docker-compose.dev.yml down -v
```

For the production-style stack:
```bash
docker compose up --build
```

---

## Environment Variables Master Reference

### Backend — `apps/backend/.env`

| Var | Required | Notes |
|---|---|---|
| `PORT` | No (5000) | HTTP port |
| `NODE_ENV` | No | development / production / test |
| `DATABASE_URL` | **Yes** | Supabase pooled URL (PgBouncer) |
| `DIRECT_URL` | **Yes** | Direct Supabase URL (Prisma migrations) |
| `REDIS_URL` | No | `redis://redis:6379` in Docker, `redis://localhost:6379` local |
| `REDIS_DEFAULT_TTL` | No | Default cache TTL seconds (default 120) |
| `JWT_SECRET` | **Yes** (≥32 chars) | Signing key |
| `SUPABASE_URL` | **Yes** | Project URL |
| `SUPABASE_ANON_KEY` | **Yes** | Public key |
| `SUPABASE_SERVICE_KEY` | **Yes** | Server-only key (bypasses RLS) |
| `RESEND_API_KEY` | **Yes** | Email service |
| `RESEND_FROM_EMAIL` | No | Default `noreply@mg.methum.space` |
| `GEMINI_API_KEY` | **Yes** | Embeddings + LLM |
| `ANTHROPIC_API_KEY` | No | Future Claude features |
| `OPENAI_API_KEY` | No | Optional fallback |
| `FIREBASE_PROJECT_ID` | **Yes** | FCM target project |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Yes** | Service account JSON (stringified) |
| `WEB_URL` | **Yes** | CORS allow origin (frontend URL) |
| `FLUTTER_ORIGIN` | **Yes** | CORS allow origin for Flutter dev |

### Frontend — `apps/frontend/.env.local`

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend base URL (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public anon key |

`NEXT_PUBLIC_*` prefix exposes vars to browser bundle.

### Flutter — Build-time

Pass via `--dart-define`:
```bash
flutter build apk --dart-define=API_BASE_URL=https://api.example.com
```

Defaults to `http://10.0.2.2:5000` (Android emulator → host).

---

## GitHub Actions CI/CD

### Workflow 1 — `ci.yml` (Pull Request Tests)

**Triggers:** `pull_request` to any branch

```yaml
name: CI

on: [pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit --prefix apps/backend
      - run: npm run test:integration --prefix apps/backend

  flutter-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.32.0'
          cache: true
      - run: flutter pub get
        working-directory: apps/flutter
      - run: flutter test
        working-directory: apps/flutter
```

**Status:** Frontend has **no automated tests in CI** — known gap.

### Workflow 2 — `flutter-release.yml` (APK Build)

**Triggers:** `push` to `release/development` branch

```yaml
name: Flutter Release APK

on:
  push:
    branches: [release/development]

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write           # for creating GitHub Release
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # full history (needed for tagging)

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.32.0'
          channel: 'stable'

      - run: flutter pub get
        working-directory: apps/flutter

      - name: Build debug APK
        working-directory: apps/flutter
        run: |
          flutter build apk --debug \
            --dart-define=API_BASE_URL=${{ secrets.RAILWAY_BACKEND_URL }}

      - name: Compute next version tag
        id: tag
        run: |
          # Read latest tag, bump patch, e.g., v1.0.0 → v1.0.1
          LATEST=$(git tag --sort=-v:refname | head -n1 || echo "v1.0.0")
          # ... bump logic ...
          echo "version=v$NEW_VERSION" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.tag.outputs.version }}
          files: apps/flutter/build/app/outputs/flutter-apk/app-debug.apk
          generate_release_notes: true
```

### Secrets Used

| Secret | Used By | Purpose |
|---|---|---|
| `RAILWAY_BACKEND_URL` | flutter-release.yml | Production backend URL baked into APK |
| `GITHUB_TOKEN` | (default) | Creates GitHub Release |

### Status Matrix

| App | CI Tests | Build Pipeline | Auto Deploy |
|---|---|---|---|
| **Backend** | ✅ ci.yml (unit + integration) | — | Railway (manual or webhook) |
| **Frontend** | ❌ None | Vercel auto-builds on push | Vercel main branch |
| **Flutter** | ✅ ci.yml (widget tests) | ✅ flutter-release.yml | GitHub Release artefact |

---

## Git Hooks (Husky + Native)

### Repo-Level Husky Hooks (`.husky/`)

#### `pre-commit`

```bash
#!/usr/bin/env bash
export PATH="/c/Program Files/nodejs:$PATH"

echo "🔍 Running lint and formatting checks..."

if ! npm run precommit; then
  echo "❌ Linting failed. Please fix the errors above."
  exit 1
fi

echo "✅ Linting and formatting passed."
```

Calls `npm run precommit` which is `npm run lint && lint-staged`.

#### `pre-push`

```bash
#!/usr/bin/env bash
export PATH="/c/Program Files/nodejs:$PATH"

echo "🏗️  Running production build before push..."

if ! npm run prepush; then
  echo "❌ Build failed. Push aborted."
  exit 1
fi

echo "✅ Build successful. Pushing to remote."
```

Calls `npm run prepush` which is `npm run lint && npm run frontend:build`. Tests are intentionally not in pre-push (CI handles them).

#### `commit-msg`

Runs `commitlint --edit "$1"` to validate the commit message against Conventional Commits rules.

### Flutter-Specific Native Hooks (`apps/flutter/.githooks/`)

These are **not Husky** — they're plain Git hooks activated by:

```bash
git config core.hooksPath apps/flutter/.githooks
```

| Hook | Action |
|---|---|
| `pre-commit` | `dart format` on staged `.dart` files, re-stage formatted files |
| `pre-push` | `flutter test` |

**Skip flags:**
```bash
SKIP_FLUTTER_HOOKS=1 git commit -m "msg"
RUN_FLUTTER_ANALYZE=1 git commit -m "msg"    # also runs flutter analyze
```

---

## Linting, Formatting, Commit Validation

### Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "auto"
}
```

Applied to all JS/TS/JSON/MD files repo-wide.

### Frontend ESLint (`apps/frontend/eslint.config.mjs`)

```javascript
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**', 'node_modules/**', 'build/**',
      '*.lock', 'public/**'
    ]
  }
];
```

ESLint 9 **flat config** format (not the legacy `.eslintrc`).

### Backend Linting

Currently a **placeholder**:
```json
"lint": "echo 'No linting yet'"
```

The backend follows TypeScript strict mode but has no ESLint config. Recommended addition: ESLint + `@typescript-eslint/parser`.

### Commitlint (`commitlint.config.js`)

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-case': [2, 'never', [
      'sentence-case', 'start-case', 'pascal-case', 'upper-case'
    ]],
    'subject-max-length': [2, 'always', 100],
  }
};
```

Recent commit examples (showing compliance):
- `feat: setup real data fetching complain management`
- `fix: chatbot endpoints issue and migrate to gemini`
- `fix: announcement section data fetching`

### Lint-Staged

Only re-lints files that are staged for commit:

```json
"lint-staged": {
  "apps/frontend/**/*.{js,jsx,ts,tsx}": [
    "npm run lint --prefix apps/frontend -- --fix"
  ],
  "apps/backend/**/*.{js,mjs,cjs,ts}": [
    "npm run lint --prefix apps/backend -- --fix"
  ]
}
```

Keeps pre-commit fast (full lint runs at pre-push and CI).

---

## Deployment Targets

| Component | Platform | Trigger |
|---|---|---|
| **Frontend** | Vercel | Auto on `git push` to main / preview branches via Vercel GitHub integration |
| **Backend** | Railway | Manual deploy or GitHub webhook (referenced in CI secrets as `RAILWAY_BACKEND_URL`) |
| **Database** | Supabase Cloud | Managed (no deploy needed); migrations via `prisma migrate deploy` |
| **Mobile APK** | GitHub Releases | Auto on push to `release/development` |
| **Mobile iOS** | TestFlight / App Store | Manual `flutter build ipa` + Xcode upload |
| **Redis** | Railway / Upstash / Redis Cloud | (any provider with `REDIS_URL`) |

### Vercel — `vercel.json`

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

The custom `installCommand` is required because this is a monorepo — Vercel needs to install from the **repository root** so workspaces resolve, then `npm run build` is the root script that delegates to `apps/frontend`.

### Railway (Backend)

Typical config:
- **Root directory:** `/`
- **Build command:** `npm install && npm run build --prefix apps/backend && npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma`
- **Start command:** `npm run start --prefix apps/backend`
- **Env vars:** Set via Railway dashboard (DATABASE_URL, JWT_SECRET, etc.)

### Supabase Database

```bash
# Apply migrations in production
DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy
```

Production secrets are stored in Railway / Vercel environments — never committed.

---

## Complete Package Inventory (All Three Apps)

### Backend (`apps/backend/package.json`)

#### Production
```
@anthropic-ai/sdk          @fastify/cookie          @fastify/cors
@fastify/helmet            @fastify/jwt             @fastify/multipart
@fastify/rate-limit        @google/generative-ai    @prisma/client
@supabase/supabase-js      axios                    bcryptjs
dotenv                     fastify                  firebase-admin
jsonwebtoken               node-cron                pdf-parse
pino                       pino-pretty              prisma
redis                      resend                   zod
```

#### Development
```
@types/bcryptjs   @types/jest        @types/jsonwebtoken
@types/node       @types/supertest   jest
ndb               nodemon            supertest
ts-jest           ts-node            ts-node-dev
typescript
```

### Frontend (`apps/frontend/package.json`)

#### Production
```
@hookform/resolvers       @supabase/supabase-js    @zxing/browser
@zxing/library            clsx                      framer-motion
lucide-react              next                      qrcode
react                     react-dom                 react-hook-form
react-qr-code             recharts                  redis
tailwind-merge            tailwindcss               zod
```

#### Development
```
@types/node        @types/react        @types/react-dom
@types/qrcode      autoprefixer        eslint
eslint-config-next postcss             typescript
```

### Flutter (`apps/flutter/pubspec.yaml`)

#### Production
```
flutter (SDK)                 cupertino_icons       google_fonts
provider                      go_router             dio
flutter_secure_storage        shared_preferences    local_auth
firebase_core                 firebase_messaging    flutter_local_notifications
pinput                        animations
```

#### Development
```
flutter_test (SDK)    flutter_lints
```

### Root (`package.json`)

```
husky                                 lint-staged
@commitlint/cli                       @commitlint/config-conventional
prettier
```

---

## Operational Playbooks

### Adding a New API Endpoint

```
1. apps/backend/src/modules/<feature>/<feature>.schema.ts
   → Add Zod schema for body/params/query

2. apps/backend/src/modules/<feature>/<feature>.controller.ts
   → Add handler function

3. apps/backend/src/modules/<feature>/<feature>.routes.ts
   → Register route with preHandler: [authenticate, rbac([...])]

4. apps/backend/tests/integration/<feature>.test.ts
   → Add supertest case

5. apps/frontend/src/features/<feature>/lib/<feature>-api.ts
   → Add fetch wrapper

6. apps/flutter/lib/features/<feature>/repositories/<feature>_repository.dart
   → Add Dio call + JSON parsing

7. Update consumers (UI components / ViewModels)

8. Commit: feat(<feature>): add <endpoint name>
```

### Adding a Database Migration

```bash
cd apps/backend

# 1. Edit prisma/schema.prisma
# 2. Generate + apply
npx prisma migrate dev --name "add_<thing>"

# 3. Verify
npx prisma studio
```

In production:
```bash
npx prisma migrate deploy
```

### Rotating JWT_SECRET

```
1. Generate new secret: openssl rand -base64 48
2. Update env var on backend host (Railway)
3. Restart backend → all existing tokens invalidated
4. Users will see 401 on next request → forced re-login
```

### Resetting Local Dev Database

```bash
cd apps/backend
npx prisma migrate reset           # drops + recreates + seeds
npm run dev
```

### Adding a New Workspace Dependency

```bash
# Frontend
npm install --workspace apps/frontend <package>

# Backend
npm install --workspace apps/backend <package>

# Root (devDep)
npm install --save-dev -D <package>
```

### Building a Production Image

```bash
# Build manually (no compose)
docker build -f apps/backend/Dockerfile.dev -t universe-backend:latest .
docker run -p 5000:5000 --env-file apps/backend/.env universe-backend:latest

docker build -f apps/frontend/Dockerfile.dev -t universe-frontend:latest .
docker run -p 3000:3000 --env-file apps/frontend/.env.local universe-frontend:latest
```

---

## Troubleshooting

### "Prisma client not found" after install
```bash
npm run prisma:generate --prefix apps/backend
```

### Husky hooks not running
```bash
npm run prepare       # reinstall hooks
# Or manually:
git config core.hooksPath .husky
```

### Flutter "Could not connect to the server"
- Android emulator must use `10.0.2.2` not `localhost`
- iOS simulator uses `127.0.0.1`
- Physical device on same Wi-Fi: use machine LAN IP, ensure firewall allows port 5000

### Frontend can't reach backend in Docker
- From `frontend` container, backend hostname is `backend:5000` (service name), not `localhost`
- Ensure `NEXT_PUBLIC_API_URL=http://backend:5000` in compose env

### Backend 503 on every request
- DB likely unreachable. Check `DATABASE_URL`. Supabase pooled connections can pause on free tier.

### Redis cache "always missing"
- If `REDIS_URL` is unset, all cache operations silently no-op (by design). Check container logs for "Redis disabled (no REDIS_URL)" message.

### Commits rejected by commitlint
- Use Conventional Commits format: `<type>(<scope>): <subject>`
- Type must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Subject must be lowercase (no Title Case)

### "fatal: cannot find module 'husky'"
```bash
npm install
npm run prepare
```

### Vercel build fails: "package not found"
- Check `vercel.json` has `"installCommand": "npm install"` (runs at repo root, resolves workspaces)
- Do NOT set Vercel's Root Directory to `apps/frontend` — keep it at repo root

### Flutter release APK can't connect to backend
- Verify `--dart-define=API_BASE_URL=...` was passed at build time
- Verify the URL is HTTPS (Android blocks plain HTTP from API 28+ unless `usesCleartextTraffic="true"`)
- Verify CORS on backend allows your domain (`WEB_URL` / `FLUTTER_ORIGIN` env var)

---

## Quick Reference Card

```
┌─ Common Commands ────────────────────────────────────────┐
│                                                          │
│  Install:           npm install                          │
│  Backend dev:       npm run backend:dev                  │
│  Frontend dev:      npm run frontend:dev                 │
│  Backend tests:     npm run backend:test                 │
│  Flutter dev:       cd apps/flutter && flutter run       │
│                                                          │
│  Prisma:                                                 │
│    Generate:  npm run prisma:generate --prefix apps/backend │
│    Migrate:   npm run prisma:migrate:dev --prefix apps/backend │
│    Studio:    npm run prisma:studio --prefix apps/backend │
│                                                          │
│  Docker:                                                 │
│    Dev up:    docker compose -f docker-compose.dev.yml up │
│    Dev down:  docker compose -f docker-compose.dev.yml down │
│    Prod up:   docker compose up --build                  │
│                                                          │
│  Build:                                                  │
│    Frontend:  npm run frontend:build                     │
│    Backend:   npm run build --prefix apps/backend        │
│    Flutter:   flutter build apk --debug                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Where Each Thing Lives — Cheat Sheet

| Looking For | File Path |
|---|---|
| All backend routes | `apps/backend/src/modules/*/[*].routes.ts` |
| Database schema | `apps/backend/prisma/schema.prisma` |
| Backend env validation | `apps/backend/src/config/env.ts` |
| All web pages | `apps/frontend/src/app/**/page.tsx` |
| Web auth context | `apps/frontend/src/features/auth/context/AuthContext.tsx` |
| Flutter routes | `apps/flutter/lib/core/navigation/app_router.dart` |
| Flutter ViewModels | `apps/flutter/lib/features/*/viewmodels/` |
| Docker compose | `docker-compose.yml` / `docker-compose.dev.yml` |
| GitHub Actions | `.github/workflows/ci.yml` / `flutter-release.yml` |
| Git hooks | `.husky/` (repo) / `apps/flutter/.githooks/` (flutter only) |
| Lint rules | `apps/frontend/eslint.config.mjs` / `.prettierrc` |
| Commit rules | `commitlint.config.js` |
| Existing detailed docs | `Doc/00-master-project-reference.md` ... `Doc/10-production-readiness.md` |
| This 5-doc set | `Documentation/01-PROJECT-OVERVIEW.md` ... `Documentation/05-DEVOPS-DOCKER-CICD.md` |

---

## Status & Known Gaps

| Concern | Status |
|---|---|
| Backend unit + integration tests | ✅ Jest, ~70% coverage threshold |
| Flutter widget tests | 🟡 1 smoke test only |
| Frontend tests | ❌ Not configured |
| Backend ESLint | ❌ Placeholder only |
| Dockerfile.prod (multi-stage) | ❌ Only Dockerfile.dev exists |
| iOS Flutter CI build | ❌ Only Android APK pipeline |
| Internationalization | ❌ English only across all apps |
| Dark mode (Flutter) | ❌ Light theme only |
| WebSocket realtime | ❌ Uses polling + FCM |
| Frontend image optimization | 🟡 Uses raw `<img>` in places (could use `next/image`) |

---

**End of documentation set.** This is the last of 5 documents:

1. [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md) — Big picture, monorepo, roles, features
2. [02-BACKEND-DEEP-DIVE.md](02-BACKEND-DEEP-DIVE.md) — Fastify, Prisma, APIs, RAG
3. [03-FRONTEND-WEB-APP.md](03-FRONTEND-WEB-APP.md) — Next.js admin/teacher/security dashboard
4. [04-FLUTTER-MOBILE-APP.md](04-FLUTTER-MOBILE-APP.md) — Flutter parent app, MVVM, Firebase
5. [05-DEVOPS-DOCKER-CICD.md](05-DEVOPS-DOCKER-CICD.md) — This file: Docker, CI/CD, tooling
