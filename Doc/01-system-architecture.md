# 01 — System Architecture

## Overview

Universe is an AI-powered university communication platform built on a client-server RESTful architecture with role-based access control. The system consists of two client applications communicating with a single backend API, backed by Supabase as the primary data and auth layer.

---

## Architecture Type

```
Client–Server RESTful Architecture
with Role-Based Access Control (RBAC)
```

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐  │
│   │  Flutter Mobile │         │   Next.js Web Dashboard │  │
│   │   (Students)    │         │  (Lecturers & Admins)   │  │
│   └────────┬────────┘         └────────────┬────────────┘  │
│            │ REST API                       │ REST API      │
└────────────┼───────────────────────────────┼───────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                        │
│                                                             │
│              Node.js + Fastify (TypeScript)                 │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Auth   │ │  Users   │ │Questions │ │  Attendance  │  │
│  │  Module  │ │  Module  │ │  Module  │ │    Module    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Complaints│ │Announce- │ │Notifica- │ │   AI/RAG     │  │
│  │  Module  │ │  ments   │ │  tions   │ │   Module     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                             │
│              RBAC Middleware (all routes)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────────┐
│   Supabase   │ │ Firebase │ │      OpenAI API       │
│              │ │   FCM    │ │  (RAG + AI Chat)      │
│ • PostgreSQL │ │          │ │                       │
│ • pgvector   │ │  Push    │ │  • Embeddings         │
│ • Auth       │ │  Notif.  │ │  • Chat completions   │
│ • Storage    │ └──────────┘ └──────────────────────┘
│ • Realtime   │
└──────────────┘
```

---

## Two Repository Structure

```
universe-platform/          → Web Dashboard + Backend API
├── frontend/               → Next.js (Lecturers & Admins)
├── backend/                → Node.js + Fastify API
├── docker-compose.yml
└── docker-compose.dev.yml

universe-flutter/           → Flutter Mobile App (Students)
```

---

## Technology Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | Server runtime |
| Framework | Fastify | HTTP framework |
| Language | TypeScript | Type safety |
| Auth | Supabase Auth + JWT | Authentication |
| Validation | Zod | Schema validation |
| OTP | Nodemailer / Supabase | Email OTP |

### Frontend — Web
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Web dashboard |
| Language | TypeScript | Type safety |
| UI Library | shadcn/ui | Components |
| Styling | Tailwind CSS | Styling |
| Theme | Dark / Light | Two themes |

### Frontend — Mobile
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Flutter (Dart) | Mobile app |
| Architecture | MVVM | Code structure |
| Auth Storage | flutter_secure_storage | Token storage |
| Biometric | local_auth | Biometric login |
| Notifications | firebase_messaging | Push receive |
| QR Scanner | mobile_scanner | QR scanning |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL + pgvector + Auth + Storage + Realtime |
| Firebase FCM | Push notification delivery |
| OpenAI API | RAG embeddings + AI Chat |
| Docker | Containerized development |
| Vercel | Frontend deployment |
| Railway/Render | Backend deployment |

---

## Deployment Architecture

```
Production:

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │  Supabase   │
│             │    │             │    │   Cloud     │
│  Next.js    │───▶│  Fastify    │───▶│             │
│  Dashboard  │    │  API        │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                   ┌──────┴──────┐
                   │   Firebase  │
                   │     FCM     │
                   └─────────────┘

Development:

docker-compose.dev.yml
├── frontend (Next.js) → localhost:3000
└── backend (Fastify)  → localhost:5000
```

---

## Security Architecture

```
1. Transport      → HTTPS/TLS on all connections
2. Authentication → Supabase Auth + JWT tokens
3. Authorization  → RBAC middleware on every route
4. Token Storage  → HTTP-only cookies (web)
                    flutter_secure_storage (mobile)
5. OTP            → Time-limited, single use
6. Biometric      → Device-level (Flutter only)
7. File Upload    → Supabase Storage with signed URLs
```

---

## User Roles

| Role | Access Level | Created By |
|------|-------------|------------|
| demo | Minimal — pending verification | Self-register |
| student | Full student features | OTP verified |
| lecturer | Full lecturer features | Admin promoted |
| admin | Full system access | Seeded / Admin promoted |
