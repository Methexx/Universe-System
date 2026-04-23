# 02 — Database Schema

> School Connect — Supabase (PostgreSQL + pgvector)

---

## Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

## Tables

### users
All accounts across all roles. Security guards, teachers, and admins use this table.
Parents also have a row here. Students do NOT have user accounts — they have student records.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'pending',
              -- 'pending' | 'teacher' | 'security' | 'admin' | 'parent'
  full_name     TEXT,
  avatar_url    TEXT,
  fcm_token     TEXT,
              -- Firebase FCM token for push notifications (parent + teacher)
  is_active     BOOLEAN DEFAULT true,
  is_suspended  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

---

### students
Student records created by admin. Not login accounts.
System auto-generates student_id_no and qr_code on insert.

```sql
CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  date_of_birth    DATE NOT NULL,
  photo_url        TEXT,
  student_id_no    TEXT UNIQUE NOT NULL,
              -- auto-generated: SCH-YYYY-NNNN
  qr_code          UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
              -- auto-generated UUID, printed on physical ID card
  class_id         UUID REFERENCES classes(id),
  parent_email     TEXT,
              -- stored from admission form, used for OTP verification
  parent_mobile    TEXT,
              -- fallback for SMS OTP if email OTP fails
  is_parent_linked BOOLEAN DEFAULT false,
              -- set true when parent creates account and links
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_id_no ON students(student_id_no);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_qr ON students(qr_code);
```

---

### parent_students
Links parent user accounts to student records.
One parent can have multiple children (multiple rows).
One student can only have ONE parent (UNIQUE student_id enforced).

```sql
CREATE TABLE parent_students (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  relation     TEXT,
              -- 'father' | 'mother' | 'guardian'
  verified_via TEXT,
              -- 'email' | 'mobile'
  linked_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
              -- enforces one parent per student at DB level
);

CREATE INDEX idx_ps_parent ON parent_students(parent_id);
CREATE INDEX idx_ps_student ON parent_students(student_id);
```

---

### grades (school structure)
School grade levels (Grade 6, Grade 7 etc).

```sql
CREATE TABLE school_grades (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,
              -- 'Grade 6' | 'Grade 7' | 'Grade 8' etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### classes
Individual classes within grade levels.

```sql
CREATE TABLE classes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_grade_id UUID REFERENCES school_grades(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
              -- 'Grade 8A' | 'Grade 8B' etc
  teacher_id      UUID REFERENCES users(id),
              -- assigned teacher for this class
  subject         TEXT,
              -- subject the assigned teacher teaches for this class
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_grade_id, name)
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_grade ON classes(school_grade_id);
```

---

### terms
Academic terms — admin-managed only.

```sql
CREATE TABLE terms (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
              -- 'Term 1 2026' | 'Term 2 2026' etc
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  is_active  BOOLEAN DEFAULT false,
              -- only one term active at a time
  is_locked  BOOLEAN DEFAULT false,
              -- locked terms: teacher cannot edit grades
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### grade_modules
Teacher-created grading modules. Independent of terms and school structure.

```sql
CREATE TABLE grade_modules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
              -- 'Science' | 'Mathematics' | 'English' etc — teacher-defined
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, name)
);

CREATE INDEX idx_modules_teacher ON grade_modules(teacher_id);
CREATE INDEX idx_modules_class ON grade_modules(class_id);
```

---

### grades
Student scores per module per term.

```sql
CREATE TABLE grades (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  module_id    UUID REFERENCES grade_modules(id) ON DELETE CASCADE,
  term_id      UUID REFERENCES terms(id),
  score        INTEGER CHECK (score >= 0 AND score <= 100),
  letter_grade TEXT,
              -- auto-calculated: A(75+) B(65-74) C(55-64) D(35-54) F(0-34)
  remarks      TEXT,
              -- optional short note from teacher
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id, term_id)
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_module ON grades(module_id);
CREATE INDEX idx_grades_term ON grades(term_id);
```

---

### gate_events
Every gate entry and exit scan.

```sql
CREATE TABLE gate_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID REFERENCES students(id),
  direction     TEXT NOT NULL,
              -- 'IN' | 'OUT'
  method        TEXT NOT NULL DEFAULT 'qr_scan',
              -- 'qr_scan' | 'manual'
  manual_reason TEXT,
              -- NULL if qr_scan. If manual: 'forgot_card' | 'lost_card' |
              --   'damaged_card' | 'new_student' | 'other'
  scanned_by    UUID REFERENCES users(id),
              -- security guard user id
  scanned_at    TIMESTAMPTZ DEFAULT NOW(),
  is_late       BOOLEAN DEFAULT false
              -- flagged if scanned after school start time
);

CREATE INDEX idx_gate_student ON gate_events(student_id);
CREATE INDEX idx_gate_scanned_at ON gate_events(scanned_at);
CREATE INDEX idx_gate_direction ON gate_events(direction);
```

---

### attendance_sessions
One session created per class per school day by the teacher.
No session = school holiday for that class.

```sql
CREATE TABLE attendance_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id     UUID REFERENCES classes(id),
  teacher_id   UUID REFERENCES users(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, session_date)
              -- one session per class per day maximum
);

CREATE INDEX idx_sessions_class ON attendance_sessions(class_id);
CREATE INDEX idx_sessions_date ON attendance_sessions(session_date);
```

---

### attendance_records
Individual student attendance status per session.

```sql
CREATE TABLE attendance_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES students(id),
  class_id     UUID REFERENCES classes(id),
  status       TEXT NOT NULL DEFAULT 'present',
              -- 'present' | 'absent' | 'late'
  excuse_note  TEXT,
              -- parent-submitted excuse note for absent records
  edited_at    TIMESTAMPTZ,
              -- timestamp of same-day edit (audit trail)
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_status ON attendance_records(status);
```

---

### messages
Parent ↔ teacher message threads.

```sql
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  student_id  UUID REFERENCES students(id),
              -- which student this conversation is about
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_student ON messages(student_id);
```

---

### announcements
School-wide (admin) and class-level (teacher) announcements.

```sql
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID REFERENCES users(id),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  scope       TEXT NOT NULL,
              -- 'school_wide' | 'class'
  target      TEXT NOT NULL,
              -- 'school_wide': 'all' | 'parents_only' | 'staff_only'
              -- 'class': class_id stored in class_id column
  class_id    UUID REFERENCES classes(id),
              -- NULL if school_wide
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_class ON announcements(class_id);
```

---

### complaints
Parent-submitted complaints and suggestions.

```sql
CREATE TABLE complaints (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id      UUID REFERENCES users(id),
  student_id     UUID REFERENCES students(id),
  category       TEXT NOT NULL,
              -- 'academic' | 'teacher_conduct' | 'facility'
              --  'administrative' | 'suggestion' | 'other'
  description    TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
              -- 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected'
  assigned_to    UUID REFERENCES users(id),
              -- teacher assigned by admin
  assigned_at    TIMESTAMPTZ,
  reply_note     TEXT,
              -- latest reply note from teacher or admin
  resolved_by    UUID REFERENCES users(id),
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complaints_parent ON complaints(parent_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_assigned ON complaints(assigned_to);
```

---

### policy_documents
Admin-uploaded school policy PDFs for RAG.

```sql
CREATE TABLE policy_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by   UUID REFERENCES users(id),
  file_name     TEXT NOT NULL,
  display_name  TEXT NOT NULL,
              -- human-readable name for admin display
  storage_path  TEXT NOT NULL,
              -- Supabase Storage path
  is_processed  BOOLEAN DEFAULT false,
              -- true once chunked and embedded
  chunk_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### document_chunks
pgvector embeddings from policy PDFs.

```sql
CREATE TABLE document_chunks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES policy_documents(id) ON DELETE CASCADE,
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536),
              -- text-embedding-3-small output
  chunk_index INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (cosine)
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

### lost_found_items
Found items posted by teacher or admin.

```sql
CREATE TABLE lost_found_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by    UUID REFERENCES users(id),
  item_name    TEXT NOT NULL,
  description  TEXT,
  photo_url    TEXT,
  found_at     TEXT,
              -- location in school where item was found
  found_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  status       TEXT NOT NULL DEFAULT 'unclaimed',
              -- 'unclaimed' | 'collected'
  collected_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

### lost_found_reports
Lost item reports from parents.

```sql
CREATE TABLE lost_found_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id    UUID REFERENCES users(id),
  student_id   UUID REFERENCES students(id),
  item_name    TEXT NOT NULL,
  description  TEXT,
  photo_url    TEXT,
  date_lost    DATE,
  status       TEXT NOT NULL DEFAULT 'open',
              -- 'open' | 'recovered'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lost_reports_parent ON lost_found_reports(parent_id);
CREATE INDEX idx_lost_reports_status ON lost_found_reports(status);
```

---

### notifications
In-app notification records for all users.

```sql
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  type         TEXT NOT NULL,
              -- 'gate_in' | 'gate_out' | 'absent' | 'message'
              -- 'announcement' | 'grade_published' | 'complaint_update'
              -- 'lost_found' | 'complaint_assigned'
  reference_id UUID,
              -- ID of related entity for navigation
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

### otp_verifications
Email and SMS OTP records.

```sql
CREATE TABLE otp_verifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL,
  otp_code   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used    BOOLEAN DEFAULT false,
  attempts   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON otp_verifications(email);
```

---

## Key Relationships

```
school_grades
    └── classes
            ├── students
            │       ├── parent_students → users (parents)
            │       ├── gate_events
            │       ├── attendance_records → attendance_sessions
            │       ├── grades → grade_modules → users (teachers)
            │       └── complaints → users (parents)
            │
            ├── attendance_sessions → users (teachers)
            └── grade_modules → users (teachers)

users (admin)
    ├── policy_documents → document_chunks (pgvector)
    ├── announcements
    └── lost_found_items

users (parent)
    ├── parent_students → students
    ├── messages → users (teacher)
    ├── complaints
    ├── lost_found_reports
    └── notifications

users (teacher)
    ├── classes (assigned)
    ├── grade_modules
    ├── attendance_sessions
    ├── messages
    ├── announcements
    └── lost_found_items

users (security)
    └── gate_events (scanned_by)
```

---

## Database Seed

```sql
-- First admin account (run once at deployment)
INSERT INTO users (
  id, email, password_hash, role, full_name, is_active
) VALUES (
  uuid_generate_v4(),
  'admin@school.lk',
  '$2b$12$<bcrypt_hash_of_initial_password>',
  'admin',
  'School Administrator',
  true
);
```
