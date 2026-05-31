const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.db');
const pool = new sqlite3.Database(dbPath);

// Enable foreign keys
pool.run('PRAGMA foreign_keys = ON');

// Initialize database schema
const initDb = () => {
  return new Promise((resolve, reject) => {
    pool.serialize(() => {
      pool.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student',
          password_changed BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      pool.run(`
        CREATE TABLE IF NOT EXISTS tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          scheduled_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      pool.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          option_a TEXT NOT NULL,
          option_b TEXT NOT NULL,
          option_c TEXT NOT NULL,
          option_d TEXT NOT NULL,
          correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
          marks INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      pool.run(`
        CREATE TABLE IF NOT EXISTS test_enrollments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(test_id, student_id)
        )
      `);

      pool.run(`
        CREATE TABLE IF NOT EXISTS test_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          answers TEXT DEFAULT '[]',
          score INTEGER DEFAULT 0,
          total_marks INTEGER DEFAULT 0,
          submitted_at TIMESTAMP,
          is_submitted BOOLEAN DEFAULT 0,
          warning_count INTEGER DEFAULT 0,
          auto_submitted BOOLEAN DEFAULT 0,
          UNIQUE(test_id, student_id)
        )
      `);

      // Indexes
      pool.run(`CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by)`);
      pool.run(`CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id)`);
      pool.run(`CREATE INDEX IF NOT EXISTS idx_enrollments_test_id ON test_enrollments(test_id)`);
      pool.run(`CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON test_enrollments(student_id)`);
      pool.run(`CREATE INDEX IF NOT EXISTS idx_submissions_test_id ON test_submissions(test_id)`);
      pool.run(`CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON test_submissions(student_id)`);

      resolve();
    });
  });
};

// Immediately initialize schema
initDb().then(() => {
  console.log('✅ SQLite database schema initialized');
}).catch((err) => {
  console.error('❌ Failed to initialize SQLite schema:', err.message);
});

/**
 * Execute a parameterized query (compatible with PG style)
 * @param {string} text - SQL query text (with $1, $2 PG-style params)
 * @param {Array} params - Query parameters
 */
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    // 1. Convert PostgreSQL parameters ($1, $2, ...) to SQLite parameters (?)
    const convertedText = text.replace(/\$\d+/g, '?');

    // 2. Use db.all so that SELECT and RETURNING queries return records
    pool.all(convertedText, params, (err, rows) => {
      if (err) {
        console.error('❌ SQLite Query Error:', err.message, '\nQuery:', text);
        return reject(err);
      }

      // Map rows keys: convert to lowercase and format count/JSON columns to match PG behavior
      const mappedRows = (rows || []).map((row) => {
        const newRow = {};
        for (const key in row) {
          const lowerKey = key.toLowerCase();
          let value = row[key];

          // Map COUNT columns (like COUNT(*) or COUNT(q.id)) to standard string count
          if (lowerKey.includes('count(') || lowerKey === 'count') {
            newRow['count'] = String(value);
          } else if (lowerKey === 'answers' && typeof value === 'string') {
            // Parse SQLite stored JSON string back to object if key is 'answers'
            try {
              newRow[lowerKey] = JSON.parse(value);
            } catch (e) {
              newRow[lowerKey] = [];
            }
          } else {
            newRow[lowerKey] = value;
          }
        }
        return newRow;
      });

      resolve({ rows: mappedRows });
    });
  });
};

module.exports = { query, pool };

