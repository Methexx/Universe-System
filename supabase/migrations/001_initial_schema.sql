-- ============================================================
-- UniVerse Platform  Initial Schema
-- Migration: 001_initial_schema.sql
-- Applied via: Supabase MCP + manually
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type user_role as enum ('student', 'lecturer', 'admin');
create type complaint_status as enum ('pending', 'in_review', 'resolved', 'rejected');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type notification_type as enum ('announcement', 'attendance', 'message', 'complaint', 'system');

-- ============================================================
-- SHARED TRIGGER FUNCTION
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = '';

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  avatar_url    text,
  role          user_role not null default 'student',
  student_id    text unique,
  staff_id      text unique,
  department    text,
  phone         text,
  bio           text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on profiles for update to authenticated using (auth.uid() = id);

-- ============================================================
-- COURSES
-- ============================================================

create table if not exists courses (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  code          text not null unique,
  description   text,
  lecturer_id   uuid references profiles(id) on delete set null,
  credits       int not null default 3,
  semester      text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger courses_updated_at
  before update on courses
  for each row execute function update_updated_at();

alter table courses enable row level security;

create policy "Courses are viewable by authenticated users"
  on courses for select to authenticated using (true);

create policy "Lecturers and admins can manage courses"
  on courses for all to authenticated
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('lecturer', 'admin')
  ));

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================

create table if not exists course_enrollments (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid not null references courses(id) on delete cascade,
  student_id    uuid not null references profiles(id) on delete cascade,
  enrolled_at   timestamptz not null default now(),
  unique(course_id, student_id)
);

alter table course_enrollments enable row level security;

create policy "Students see own enrollments"
  on course_enrollments for select to authenticated
  using (
    student_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role in ('lecturer', 'admin'))
  );

create policy "Admins can manage enrollments"
  on course_enrollments for all to authenticated
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

create table if not exists announcements (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  content       text not null,
  author_id     uuid not null references profiles(id) on delete cascade,
  target_role   user_role,
  course_id     uuid references courses(id) on delete cascade,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger announcements_updated_at
  before update on announcements
  for each row execute function update_updated_at();

alter table announcements enable row level security;

create policy "Announcements are viewable by authenticated users"
  on announcements for select to authenticated using (
    target_role is null or
    target_role = (select role from profiles where id = auth.uid())
  );

create policy "Lecturers and admins can create announcements"
  on announcements for insert to authenticated
  with check (
    author_id = auth.uid() and
    exists (select 1 from profiles where id = auth.uid() and role in ('lecturer', 'admin'))
  );

create policy "Authors can update own announcements"
  on announcements for update to authenticated
  using (
    author_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authors and admins can delete announcements"
  on announcements for delete to authenticated
  using (
    author_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ATTENDANCE
-- ============================================================

create table if not exists attendance_sessions (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid not null references courses(id) on delete cascade,
  lecturer_id   uuid not null references profiles(id) on delete cascade,
  title         text,
  session_date  date not null,
  start_time    time not null,
  end_time      time,
  location      text,
  created_at    timestamptz not null default now()
);

alter table attendance_sessions enable row level security;

create policy "Attendance sessions viewable by authenticated users"
  on attendance_sessions for select to authenticated using (true);

create policy "Lecturers and admins can manage attendance sessions"
  on attendance_sessions for all to authenticated
  using (
    lecturer_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create table if not exists attendance_records (
  id            uuid primary key default uuid_generate_v4(),
  session_id    uuid not null references attendance_sessions(id) on delete cascade,
  student_id    uuid not null references profiles(id) on delete cascade,
  status        attendance_status not null default 'absent',
  marked_at     timestamptz,
  note          text,
  unique(session_id, student_id)
);

alter table attendance_records enable row level security;

create policy "Students see own attendance records"
  on attendance_records for select to authenticated
  using (
    student_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role in ('lecturer', 'admin'))
  );

create policy "Lecturers and admins can manage attendance records"
  on attendance_records for all to authenticated
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('lecturer', 'admin')
  ));

-- ============================================================
-- MESSAGES (Conversations)
-- ============================================================

create table if not exists conversations (
  id            uuid primary key default uuid_generate_v4(),
  name          text,
  is_group      boolean not null default false,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table conversations enable row level security;

create policy "Conversations visible to participants"
  on conversations for select to authenticated
  using (exists (
    select 1 from conversation_participants
    where conversation_id = conversations.id and user_id = auth.uid()
  ));

create policy "Authenticated users can create conversations"
  on conversations for insert to authenticated
  with check (created_by = auth.uid());

create table if not exists conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  primary key(conversation_id, user_id)
);

alter table conversation_participants enable row level security;

create policy "Participants can view conversation members"
  on conversation_participants for select to authenticated
  using (exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  ));

create policy "Conversation creators can add participants"
  on conversation_participants for insert to authenticated
  with check (exists (
    select 1 from conversations
    where id = conversation_id and created_by = auth.uid()
  ) or user_id = auth.uid());

create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger messages_updated_at
  before update on messages
  for each row execute function update_updated_at();

alter table messages enable row level security;

create policy "Messages visible to conversation participants"
  on messages for select to authenticated
  using (exists (
    select 1 from conversation_participants
    where conversation_id = messages.conversation_id
      and user_id = auth.uid()
  ));

create policy "Participants can send messages"
  on messages for insert to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
        and user_id = auth.uid()
    )
  );

-- ============================================================
-- COMPLAINTS
-- ============================================================

create table if not exists complaints (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  category      text not null,
  title         text not null,
  description   text not null,
  status        complaint_status not null default 'pending',
  assigned_to   uuid references profiles(id) on delete set null,
  resolution    text,
  is_anonymous  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger complaints_updated_at
  before update on complaints
  for each row execute function update_updated_at();

alter table complaints enable row level security;

create policy "Users see own complaints"
  on complaints for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Users can create complaints"
  on complaints for insert to authenticated with check (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null,
  body          text not null,
  type          notification_type not null default 'system',
  is_read       boolean not null default false,
  data          jsonb,
  created_at    timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users see own notifications"
  on notifications for all to authenticated using (user_id = auth.uid());

create table if not exists fcm_tokens (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  token         text not null unique,
  platform      text,
  created_at    timestamptz not null default now()
);

alter table fcm_tokens enable row level security;

create policy "Users manage own FCM tokens"
  on fcm_tokens for all to authenticated using (user_id = auth.uid());

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================

create table if not exists ai_conversations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text,
  messages      jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger ai_conversations_updated_at
  before update on ai_conversations
  for each row execute function update_updated_at();

alter table ai_conversations enable row level security;

create policy "Users see own AI conversations"
  on ai_conversations for all to authenticated using (user_id = auth.uid());

-- ============================================================
-- FUNCTION: auto-create profile on user signup
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- INDEXES for performance
-- ============================================================

create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_announcements_author on announcements(author_id);
create index if not exists idx_announcements_target on announcements(target_role);
create index if not exists idx_attendance_sessions_course on attendance_sessions(course_id);
create index if not exists idx_attendance_records_session on attendance_records(session_id);
create index if not exists idx_attendance_records_student on attendance_records(student_id);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_notifications_user on notifications(user_id, is_read);
create index if not exists idx_complaints_user on complaints(user_id);
create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_ai_conversations_user on ai_conversations(user_id);