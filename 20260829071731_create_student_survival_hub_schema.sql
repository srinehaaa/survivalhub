/*
# Student Survival Hub — Full Schema with RLS

## Overview
Creates the complete multi-user schema for the Student Survival Hub application.
Every table is owner-scoped to an authenticated user via `user_id` with Row Level Security.

## New Tables

1. **profiles** — Student profile created at signup.
   - `id` (uuid, PK, matches auth.users.id)
   - `full_name` (text)
   - `email` (text)
   - `course` (text)
   - `year` (text)
   - `monthly_budget` (integer, default 15000)
   - `min_attendance` (integer, default 75 — minimum attendance % requirement)
   - `created_at` (timestamptz)

2. **subjects** — Attendance tracking per subject.
   - `id` (uuid, PK)
   - `user_id` (uuid, owner)
   - `name` (text)
   - `attended` (integer)
   - `conducted` (integer)
   - `created_at` (timestamptz)

3. **assignments** — Assignment tracking with priority scoring inputs.
   - `id` (uuid, PK)
   - `user_id` (uuid, owner)
   - `name` (text)
   - `subject` (text)
   - `deadline` (date)
   - `progress` (integer, 0-100)
   - `importance` (text: high/medium/low)
   - `estimated_minutes` (integer)
   - `status` (text: pending/in-progress/completed)
   - `created_at` (timestamptz)

4. **exams** — Exam tracking with countdown.
   - `id` (uuid, PK)
   - `user_id` (uuid, owner)
   - `name` (text)
   - `subject` (text)
   - `exam_date` (date)
   - `prep_progress` (integer, 0-100)
   - `created_at` (timestamptz)

5. **exam_topics** — Topics under each exam for prep tracking.
   - `id` (uuid, PK)
   - `exam_id` (uuid, FK to exams, cascade delete)
   - `user_id` (uuid, owner — denormalized for simple RLS)
   - `name` (text)
   - `status` (text: completed/needs-revision/not-started)
   - `created_at` (timestamptz)

6. **timetable_classes** — Weekly timetable entries.
   - `id` (uuid, PK)
   - `user_id` (uuid, owner)
   - `subject` (text)
   - `day_of_week` (text: Monday/Tuesday/etc.)
   - `start_time` (text, e.g. "10:00")
   - `end_time` (text, e.g. "11:30")
   - `room` (text)
   - `color` (text, e.g. emerald/sky/amber/violet)
   - `created_at` (timestamptz)

7. **expenses** — Individual expense entries with date and description.
   - `id` (uuid, PK)
   - `user_id` (uuid, owner)
   - `category` (text)
   - `description` (text)
   - `amount` (integer)
   - `expense_date` (date)
   - `color` (text)
   - `icon` (text)
   - `created_at` (timestamptz)

## Security
- RLS enabled on every table.
- Owner-scoped CRUD policies (select/insert/update/delete) on all tables.
- `user_id` columns default to `auth.uid()` so inserts omitting the owner still succeed.
- `profiles` table uses `id = auth.uid()` as the ownership key (one profile per auth user).
- `exam_topics` has its own `user_id` column (denormalized) for straightforward RLS, plus FK to exams with cascade delete.

## Notes
1. Email confirmation stays OFF — Supabase default for this project.
2. The frontend never passes `user_id` on inserts — the DB default fills it from the session.
3. `exam_topics.user_id` is denormalized so the policy doesn't need a subquery to exams — simpler and faster.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  course text DEFAULT '',
  year text DEFAULT '',
  monthly_budget integer NOT NULL DEFAULT 15000,
  min_attendance integer NOT NULL DEFAULT 75,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ SUBJECTS (attendance) ============
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  attended integer NOT NULL DEFAULT 0,
  conducted integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subjects" ON subjects;
CREATE POLICY "select_own_subjects" ON subjects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subjects" ON subjects;
CREATE POLICY "insert_own_subjects" ON subjects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subjects" ON subjects;
CREATE POLICY "update_own_subjects" ON subjects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subjects" ON subjects;
CREATE POLICY "delete_own_subjects" ON subjects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ ASSIGNMENTS ============
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  deadline date NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  importance text NOT NULL DEFAULT 'medium',
  estimated_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_assignments" ON assignments;
CREATE POLICY "select_own_assignments" ON assignments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_assignments" ON assignments;
CREATE POLICY "insert_own_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_assignments" ON assignments;
CREATE POLICY "update_own_assignments" ON assignments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_assignments" ON assignments;
CREATE POLICY "delete_own_assignments" ON assignments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ EXAMS ============
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  exam_date date NOT NULL,
  prep_progress integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exams" ON exams;
CREATE POLICY "select_own_exams" ON exams FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_exams" ON exams;
CREATE POLICY "insert_own_exams" ON exams FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_exams" ON exams;
CREATE POLICY "update_own_exams" ON exams FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_exams" ON exams;
CREATE POLICY "delete_own_exams" ON exams FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ EXAM TOPICS ============
CREATE TABLE IF NOT EXISTS exam_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'not-started',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exam_topics" ON exam_topics;
CREATE POLICY "select_own_exam_topics" ON exam_topics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_exam_topics" ON exam_topics;
CREATE POLICY "insert_own_exam_topics" ON exam_topics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_exam_topics" ON exam_topics;
CREATE POLICY "update_own_exam_topics" ON exam_topics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_exam_topics" ON exam_topics;
CREATE POLICY "delete_own_exam_topics" ON exam_topics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ TIMETABLE CLASSES ============
CREATE TABLE IF NOT EXISTS timetable_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  day_of_week text NOT NULL DEFAULT 'Monday',
  start_time text NOT NULL,
  end_time text NOT NULL,
  room text DEFAULT '',
  color text NOT NULL DEFAULT 'sky',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timetable_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_timetable" ON timetable_classes;
CREATE POLICY "select_own_timetable" ON timetable_classes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_timetable" ON timetable_classes;
CREATE POLICY "insert_own_timetable" ON timetable_classes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_timetable" ON timetable_classes;
CREATE POLICY "update_own_timetable" ON timetable_classes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_timetable" ON timetable_classes;
CREATE POLICY "delete_own_timetable" ON timetable_classes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ EXPENSES ============
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text DEFAULT '',
  amount integer NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  color text NOT NULL DEFAULT 'sky',
  icon text NOT NULL DEFAULT 'Wallet',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_topics_user ON exam_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_topics_exam ON exam_topics(exam_id);
CREATE INDEX IF NOT EXISTS idx_timetable_user ON timetable_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
