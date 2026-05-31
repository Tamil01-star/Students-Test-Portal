const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * GET /api/staff/stats
 * Staff dashboard statistics
 */
const getStaffStats = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const testCount = await query('SELECT COUNT(*) FROM tests WHERE created_by = $1 AND is_active = true', [staffId]);
    const studentCount = await query("SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = true");
    const todayTests = await query(
      'SELECT COUNT(*) FROM tests WHERE created_by = $1 AND scheduled_date = $2',
      [staffId, today]
    );

    return res.json({
      success: true,
      data: {
        total_tests: parseInt(testCount.rows[0].count),
        total_students: parseInt(studentCount.rows[0].count),
        tests_today: parseInt(todayTests.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/staff/create-test
 * Create a new exam/test
 */
const createTest = async (req, res) => {
  try {
    const { title, subject, scheduled_date, start_time, end_time } = req.body;

    if (!title || !subject || !scheduled_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const result = await query(
      `INSERT INTO tests (title, subject, scheduled_date, start_time, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, subject, scheduled_date, start_time, end_time, created_at`,
      [title.trim(), subject.trim(), scheduled_date, start_time, end_time, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Test created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create test error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/staff/tests
 * Get all tests created by this staff member
 */
const getMyTests = async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, 
              COUNT(DISTINCT q.id) AS question_count,
              COUNT(DISTINCT te.id) AS enrolled_count
       FROM tests t
       LEFT JOIN questions q ON q.test_id = t.id
       LEFT JOIN test_enrollments te ON te.test_id = t.id
       WHERE t.created_by = $1 AND t.is_active = true
       GROUP BY t.id
       ORDER BY t.scheduled_date DESC, t.start_time DESC`,
      [req.user.id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my tests error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/staff/tests/:test_id/questions
 * Add a question to a test
 */
const addQuestion = async (req, res) => {
  try {
    const { test_id } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, marks } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({ success: false, message: 'All question fields are required.' });
    }

    if (!['a', 'b', 'c', 'd'].includes(correct_answer.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Correct answer must be a, b, c, or d.' });
    }

    // Verify test belongs to this staff
    const testCheck = await query('SELECT id FROM tests WHERE id = $1 AND created_by = $2', [test_id, req.user.id]);
    if (testCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Test not found or access denied.' });
    }

    const result = await query(
      `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [test_id, question_text, option_a, option_b, option_c, option_d, correct_answer.toLowerCase(), marks || 1]
    );

    return res.status(201).json({ success: true, message: 'Question added.', data: result.rows[0] });
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/staff/tests/:test_id/questions
 * Get all questions for a test
 */
const getQuestions = async (req, res) => {
  try {
    const { test_id } = req.params;

    // Verify test belongs to this staff
    const testCheck = await query('SELECT id, title FROM tests WHERE id = $1 AND created_by = $2', [test_id, req.user.id]);
    if (testCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Test not found or access denied.' });
    }

    const result = await query(
      'SELECT * FROM questions WHERE test_id = $1 ORDER BY created_at ASC',
      [test_id]
    );

    return res.json({ success: true, data: result.rows, test: testCheck.rows[0] });
  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/staff/questions/:id
 * Delete a question
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the question belongs to a test owned by this staff
    const check = await query(
      `SELECT q.id FROM questions q
       JOIN tests t ON t.id = q.test_id
       WHERE q.id = $1 AND t.created_by = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Question not found or access denied.' });
    }

    await query('DELETE FROM questions WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Question deleted.' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/staff/students
 * Get all students (for enrollment)
 */
const getAllStudents = async (req, res) => {
  try {
    const result = await query(
      "SELECT id, user_id, name, email FROM users WHERE role = 'student' AND is_active = true ORDER BY name ASC"
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/staff/tests/:test_id/enroll
 * Enroll students in a test (replaces existing enrollment)
 */
const enrollStudents = async (req, res) => {
  try {
    const { test_id } = req.params;
    const { student_ids } = req.body;

    if (!Array.isArray(student_ids)) {
      return res.status(400).json({ success: false, message: 'student_ids must be an array.' });
    }

    // Verify test belongs to this staff
    const testCheck = await query('SELECT id FROM tests WHERE id = $1 AND created_by = $2', [test_id, req.user.id]);
    if (testCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Test not found or access denied.' });
    }

    // Insert enrollments, ignore duplicates
    for (const studentId of student_ids) {
      await query(
        'INSERT INTO test_enrollments (test_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [test_id, studentId]
      );
    }

    return res.json({ success: true, message: `${student_ids.length} student(s) enrolled successfully.` });
  } catch (error) {
    console.error('Enroll students error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/staff/tests/:test_id/enrolled
 * Get enrolled students for a test
 */
const getEnrolledStudents = async (req, res) => {
  try {
    const { test_id } = req.params;

    const result = await query(
      `SELECT u.id, u.user_id, u.name, u.email
       FROM test_enrollments te
       JOIN users u ON u.id = te.student_id
       WHERE te.test_id = $1
       ORDER BY u.name ASC`,
      [test_id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/staff/results/:test_id
 * Get test results for a specific test
 */
const getResults = async (req, res) => {
  try {
    const { test_id } = req.params;

    // Verify test belongs to this staff
    const testCheck = await query(
      'SELECT id, title, subject FROM tests WHERE id = $1 AND created_by = $2',
      [test_id, req.user.id]
    );
    if (testCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Test not found or access denied.' });
    }

    const result = await query(
      `SELECT u.user_id AS register_number, u.name AS student_name,
              ts.score, ts.total_marks, ts.submitted_at, ts.warning_count, ts.auto_submitted,
              CASE WHEN ts.total_marks > 0 
                   THEN ROUND((CAST(ts.score AS DECIMAL) / ts.total_marks) * 100, 2)
                   ELSE 0 END AS percentage
       FROM test_submissions ts
       JOIN users u ON u.id = ts.student_id
       WHERE ts.test_id = $1 AND ts.is_submitted = true
       ORDER BY ts.score DESC`,
      [test_id]
    );

    return res.json({ success: true, data: result.rows, test: testCheck.rows[0] });
  } catch (error) {
    console.error('Get results error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/staff/create-student
 * Create a student account
 */
const createStudent = async (req, res) => {
  try {
    const { name, email, register_number, temp_password } = req.body;

    if (!name || !register_number || !temp_password) {
      return res.status(400).json({ success: false, message: 'Name, Register Number, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE user_id = $1', [register_number.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Register number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(temp_password, 12);

    const result = await query(
      `INSERT INTO users (user_id, name, email, password, role, password_changed, created_by)
       VALUES ($1, $2, $3, $4, 'student', false, $5)
       RETURNING id, user_id, name, email, role, created_at`,
      [register_number.trim(), name.trim(), email?.trim() || null, hashedPassword, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: `Student account created. Register Number: ${register_number}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getStaffStats, createTest, getMyTests,
  addQuestion, getQuestions, deleteQuestion,
  getAllStudents, enrollStudents, getEnrolledStudents,
  getResults, createStudent,
};
