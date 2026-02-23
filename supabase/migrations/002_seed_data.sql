-- ============================================================
-- UniVerse Platform — Seed Data (Dev Only)
-- Migration: 002_seed_data.sql
-- Run this only in development/staging
-- ============================================================

-- Insert sample admin user profile (after creating via Supabase Auth)
-- Replace the UUID with the actual user id from auth.users

-- Sample courses
insert into courses (name, code, description, credits, semester) values
  ('Introduction to Computer Science', 'CS1001', 'Fundamentals of programming and computing', 3, '2025/S1'),
  ('Data Structures & Algorithms', 'CS2001', 'Arrays, linked lists, trees, sorting and searching', 3, '2025/S1'),
  ('Database Systems', 'CS2002', 'Relational databases, SQL, normalization', 3, '2025/S1'),
  ('Software Engineering', 'CS3001', 'SDLC, Agile, design patterns', 3, '2025/S2'),
  ('Mobile Application Development', 'CS3002', 'Cross-platform mobile development with Flutter', 3, '2025/S2');
