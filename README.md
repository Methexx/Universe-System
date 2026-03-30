# UniVerse Platform

A full-stack university management platform built with **Fastify** (backend), **Next.js** (web frontend), and **Flutter** (mobile app).

--- 
   
## What is UniVerse?

UniVerse is an all-in-one university platform that helps students, lecturers, and admins manage:

- 🔐 Authentication & role-based access (Student / Lecturer / Admin)
- 📢 Announcements & notice board
- 📅 Attendance tracking
- 💬 Messaging between users
- 📝 Complaints & feedback
- 🔔 Push notifications (Firebase)
- 🤖 AI assistant (OpenAI)
- 👤 User & profile management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | [Fastify](https://fastify.dev/) + TypeScript |
| Web Frontend | [Next.js 16](https://nextjs.org/) + React 19 + Tailwind CSS v4 |
| Mobile App | [Flutter](https://flutter.dev/) (Dart) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| AI | OpenAI API |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
UniVerse-Platform/
├── backend/                  # Fastify REST API (Node.js + TypeScript)
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── common/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── config/
│   │   └── modules/
│   │       ├── ai/
│   │       ├── announcements/
│   │       ├── attendance/
│   │       ├── auth/
│   │       ├── complaints/
│   │       ├── messages/
│   │       ├── notifications/
│   │       └── users/
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── nodemon.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Next.js web app
│   ├── src/
│   │   └── app/
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── Dockerfile.dev
│   ├── next.config.ts
│   └── package.json
├── mobile/                   # Flutter mobile app (coming soon)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── services/
│   │   ├── models/
│   │   └── providers/
│   └── pubspec.yaml
├── Doc/
│   └── PROJECT_STATUS.md     # Detailed step-by-step progress
├── .gitignore
├── docker-compose.dev.yml
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Flutter SDK 3.x](https://docs.flutter.dev/get-started/install)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd UniVerse-Platform
```

---

### 2. Set Up Environment Variables

Copy the example env file and fill in your real values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres?schema=public
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=your-firebase-project-id
```

---

### 3. Run with Docker (Recommended)

From the project root:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts:
| Service | URL |
|---|---|
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| Web Frontend | http://localhost:3000 |

To stop:
```bash
docker compose -f docker-compose.dev.yml down
```

---

### 4. Run Without Docker

**Backend:**
```bash
cd backend
npm install
npm run prisma:generate
npx nodemon
```

**Frontend (Web):**
```bash
cd frontend
npm install
npm run dev
```

Both run on the same ports as above.

---

### 5. Run the Flutter Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

> Make sure a device or emulator is connected. For API calls from the emulator, use `http://10.0.2.2:5000` (Android) or `http://localhost:5000` (iOS simulator) as the base URL instead of `localhost`.

**Flutter environment config** (`mobile/lib/config/app_config.dart`):
```dart
class AppConfig {
  static const String apiBaseUrl = 'http://10.0.2.2:5000'; // Android emulator
  // static const String apiBaseUrl = 'http://localhost:5000'; // iOS simulator
  // static const String apiBaseUrl = 'https://api.yourdomain.com'; // Production
}
```

**Build Flutter APK (Android):**
```bash
flutter build apk --release
```

**Build Flutter for iOS:**
```bash
flutter build ios --release
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| GET | `/users/me` | Get current user |
| GET | `/announcements` | List announcements |
| POST | `/attendance` | Mark attendance |
| GET | `/messages` | List messages |
| POST | `/complaints` | Submit complaint |
| GET | `/notifications` | Get notifications |
| POST | `/ai/chat` | AI assistant |

> Full API documentation coming soon.

---

## Flutter App Features (Planned)

- [ ] Login / Register screens
- [ ] Role-based dashboard (Student / Lecturer / Admin)
- [ ] Announcements feed
- [ ] Attendance marking (QR code / GPS)
- [ ] In-app messaging
- [ ] Complaints submission
- [ ] Push notifications via Firebase FCM
- [ ] AI chat screen
- [ ] Profile management
- [ ] Dark / Light mode

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `release/development` | Active development |
| `feature/*` | Individual features |

---

## Project Progress

See [Doc/PROJECT_STATUS.md](Doc/PROJECT_STATUS.md) for the full step-by-step build progress.

---

## License

ISC
