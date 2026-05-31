-- Classic Examination Portal - PostgreSQL Schema
-- Run this file to initialize the database

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('management', 'staff', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE answer_option AS ENUM ('a', 'b', 'c', 'd');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  password_changed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  marks INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Enrollments Table
CREATE TABLE IF NOT EXISTS test_enrollments (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(test_id, student_id)
);

-- Test Submissions Table
CREATE TABLE IF NOT EXISTS test_submissions (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '[]',
  score INT DEFAULT 0,
  total_marks INT DEFAULT 0,
  submitted_at TIMESTAMP,
  is_submitted BOOLEAN DEFAULT false,
  warning_count INT DEFAULT 0,
  auto_submitted BOOLEAN DEFAULT false,
  UNIQUE(test_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_test_id ON test_enrollments(test_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON test_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_test_id ON test_submissions(test_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON test_submissions(student_id);

-- Default management account (password: Admin@1234 - will be updated by initAdmin())
-- This is just a placeholder, the actual seeding is done in authController.js
