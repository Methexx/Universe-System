# 02 — Database Schema

## Overview

Universe uses Supabase (PostgreSQL) as the primary database with pgvector extension for AI/RAG semantic search. All tables follow UUID primary keys and include created_at timestamps.

---

## Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

## Tables

### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'demo',
              -- 'demo' | 'student' | 'lecturer' | 'admin'
  full_name     TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT true,
  account_expires_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### academic_profiles
```sql
CREATE TABLE academic_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  faculty_id      UUID REFERENCES faculties(id),
  degree_id       UUID REFERENCES degrees(id),
  batch           TEXT NOT NULL,
  academic_year   TEXT NOT NULL,
              -- 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4'
  student_id_no   TEXT UNIQUE,
  is_complete     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### academic_change_requests
```sql
CREATE TABLE academic_change_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id),
  requested_faculty_id  UUID REFERENCES faculties(id),
  requested_degree_id   UUID REFERENCES degrees(id),
  requested_batch       TEXT,
  requested_year        TEXT,
  status          TEXT DEFAULT 'pending',
              -- 'pending' | 'approved' | 'rejected'
  admin_note      TEXT,
  reviewed_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### faculties
```sql
CREATE TABLE faculties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### degrees
```sql
CREATE TABLE degrees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id  UUID REFERENCES faculties(id),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  duration_years INT DEFAULT 4,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### modules
```sql
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree_id   UUID REFERENCES degrees(id),
  faculty_id  UUID REFERENCES faculties(id),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  academic_year TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### lecturer_modules
```sql
CREATE TABLE lecturer_modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id UUID REFERENCES users(id),
  module_id   UUID REFERENCES modules(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lecturer_id, module_id)
);
```

### student_modules
```sql
-- Auto-populated based on academic profile
CREATE TABLE student_modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES users(id),
  module_id   UUID REFERENCES modules(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);
```

### questions
```sql
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID REFERENCES users(id),
  module_id     UUID REFERENCES modules(id),
  question_text TEXT NOT NULL,
  ai_answer     TEXT,
  status        TEXT DEFAULT 'ai_answered',
              -- 'ai_answered' | 'escalated' | 'answered' | 'resolved'
  is_public     BOOLEAN DEFAULT false,
  escalated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### lecturer_answers
```sql
CREATE TABLE lecturer_answers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id),
  lecturer_id UUID REFERENCES users(id),
  answer_text TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### module_documents
```sql
CREATE TABLE module_documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID REFERENCES modules(id),
  lecturer_id UUID REFERENCES users(id),
  file_name   TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_processed BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### document_chunks (RAG)
```sql
CREATE TABLE document_chunks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES module_documents(id) ON DELETE CASCADE,
  module_id   UUID REFERENCES modules(id),
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536),
  chunk_index INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### attendance_sessions
```sql
CREATE TABLE attendance_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID REFERENCES modules(id),
  lecturer_id UUID REFERENCES users(id),
  qr_code     TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
              -- created_at + 15 minutes
  is_active   BOOLEAN DEFAULT true,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### attendance_records
```sql
CREATE TABLE attendance_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID REFERENCES attendance_sessions(id),
  student_id  UUID REFERENCES users(id),
  module_id   UUID REFERENCES modules(id),
  scanned_at  TIMESTAMPTZ DEFAULT NOW(),
  status      TEXT DEFAULT 'present',
  UNIQUE(session_id, student_id)
);
```

### announcements
```sql
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID REFERENCES users(id),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL,
              -- 'university' | 'module'
  module_id   UUID REFERENCES modules(id),
              -- NULL if university-wide
  target_role TEXT DEFAULT 'student',
              -- 'student' | 'lecturer' | 'all'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### complaints
```sql
CREATE TABLE complaints (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID REFERENCES users(id),
  category        TEXT NOT NULL,
              -- 'academic' | 'lecturer' | 'facility'
              -- 'administrative' | 'suggestion' | 'other'
  description     TEXT NOT NULL,
  assigned_to     UUID REFERENCES users(id),
              -- lecturer assigned by admin
  assigned_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT NOT NULL,
              -- 'question_answered' | 'announcement'
              -- 'attendance' | 'academic_change'
              -- 'complaint_assigned'
  reference_id UUID,
              -- ID of related entity
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### otp_verifications
```sql
CREATE TABLE otp_verifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL,
  otp_code    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_used     BOOLEAN DEFAULT false,
  attempts    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Key Relationships Diagram

```
faculties
    └── degrees
            └── modules
                    ├── lecturer_modules → users (lecturers)
                    ├── student_modules  → users (students)
                    ├── module_documents
                    │       └── document_chunks (vectors)
                    ├── questions
                    │       └── lecturer_answers
                    └── attendance_sessions
                                └── attendance_records

users
    ├── academic_profiles
    ├── academic_change_requests
    ├── complaints
    ├── announcements
    └── notifications
```

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_questions_module ON questions(module_id);
CREATE INDEX idx_questions_student ON questions(student_id);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_complaints_assigned ON complaints(assigned_to);
CREATE INDEX idx_chunks_module ON document_chunks(module_id);
```
