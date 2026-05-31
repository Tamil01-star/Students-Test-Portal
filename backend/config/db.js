const path = require('path');
const fs = require('fs');

let pool = null;
let query = null;
let dbType = 'sqlite';
let initDb = null;

const isProduction = process.env.NODE_ENV === 'production';
const hasDbUrl = !!process.env.DATABASE_URL;

if (hasDbUrl) {
  // === PostgreSQL (Production / Cloud Deployment) ===
  const { Pool } = require('pg');
  dbType = 'postgres';
  
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`🔌 DATABASE_URL detected. Connecting to PostgreSQL at ${maskedUrl}...`);

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Neon/Supabase cloud DBs
  });

  query = async (text, params = []) => {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('❌ PostgreSQL Query Error:', err.message, '\nQuery:', text);
      throw err;
    }
  };

  // Initialize PostgreSQL tables if they don't exist
  const initPgDb = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        password_changed BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        test_id INT REFERENCES tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer VARCHAR(5) NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
        marks INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_enrollments (
        id SERIAL PRIMARY KEY,
        test_id INT REFERENCES tests(id) ON DELETE CASCADE,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(test_id, student_id)
      )
    `);

    await pool.query(`
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
      )
    `);

    console.log('✅ PostgreSQL database schema checked/initialized');
  };

  initDb = async () => {
    await initPgDb();
  };

} else {
  // === SQLite (Local Offline Development) ===
  let sqlite3 = null;
  const isVercel = !!process.env.VERCEL;

  if (!isVercel) {
    try {
      const sqliteModuleName = 'sqlite3';
      sqlite3 = require(sqliteModuleName).verbose();
    } catch (err) {
      console.error('❌ SQLite3 native module is not available in this environment:', err.message);
    }
  } else {
    console.error('❌ SQLite is disabled on Vercel. You must configure the DATABASE_URL environment variable to use PostgreSQL.');
  }
  
  if (sqlite3) {

    const dbPath = path.resolve(__dirname, '../database.db');
    console.log(`🔌 No DATABASE_URL detected. Fallback to local SQLite at ${dbPath}...`);

    pool = new sqlite3.Database(dbPath);

    // Enable foreign keys
    pool.run('PRAGMA foreign_keys = ON');

    // Initialize SQLite tables if they don't exist
    const initSqliteDb = () => {
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

    initDb = async () => {
      await initSqliteDb();
      console.log('✅ SQLite database schema initialized');
    };

    query = (text, params = []) => {
      return new Promise((resolve, reject) => {
        // Convert PostgreSQL parameters ($1, $2, ...) to SQLite parameters (?)
        const convertedText = text.replace(/\$\d+/g, '?');

        pool.all(convertedText, params, (err, rows) => {
          if (err) {
            console.error('❌ SQLite Query Error:', err.message, '\nQuery:', text);
            return reject(err);
          }

          const mappedRows = (rows || []).map((row) => {
            const newRow = {};
            for (const key in row) {
              const lowerKey = key.toLowerCase();
              let value = row[key];

              if (lowerKey.includes('count(') || lowerKey === 'count') {
                newRow['count'] = String(value);
              } else if (lowerKey === 'answers' && typeof value === 'string') {
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
  } else {
    initDb = async () => {
      throw new Error('❌ sqlite3 is not installed or failed to compile in this environment. Cannot run SQLite database.');
    };
    query = async () => {
      throw new Error('❌ Database is not configured. Please set DATABASE_URL environment variable to use PostgreSQL.');
    };
  }
}

module.exports = { query, pool, dbType, initDb };


