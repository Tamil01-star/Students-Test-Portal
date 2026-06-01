const { query } = require('../config/db');

/**
 * GET /api/student/stats
 * Student dashboard statistics
 */
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Upcoming tests (enrolled but not yet submitted, scheduled in future)
    const upcoming = await query(
      `SELECT COUNT(*) FROM test_enrollments te
       JOIN tests t ON t.id = te.test_id
       LEFT JOIN test_submissions ts ON ts.test_id = te.test_id AND ts.student_id = te.student_id
       WHERE te.student_id = $1 AND (ts.is_submitted IS NULL OR ts.is_submitted = false)
       AND (t.scheduled_date > $2 OR (t.scheduled_date = $2 AND t.end_time > $3))`,
      [studentId, today, currentTime]
    );

    // Completed (submitted)
    const completed = await query(
      'SELECT COUNT(*) FROM test_submissions WHERE student_id = $1 AND is_submitted = true',
      [studentId]
    );

    // Average score
    const avgScore = await query(
      `SELECT AVG(CASE WHEN total_marks > 0 THEN (CAST(score AS DECIMAL) / total_marks) * 100 ELSE 0 END) AS avg
       FROM test_submissions WHERE student_id = $1 AND is_submitted = true`,
      [studentId]
    );

    return res.json({
      success: true,
      data: {
        upcoming_tests: parseInt(upcoming.rows[0].count) || 0,
        completed_tests: parseInt(completed.rows[0].count) || 0,
        average_score: Math.round(parseFloat(avgScore.rows[0].avg) || 0),
      },
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/student/tests
 * Get all enrolled tests for the student with status
 */
const getMyTests = async (req, res) => {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const result = await query(
      `SELECT t.id, t.title, t.subject, t.scheduled_date, t.start_time, t.end_time,
              ts.is_submitted, ts.score, ts.total_marks, ts.submitted_at,
              COUNT(q.id) AS total_questions
       FROM test_enrollments te
       JOIN tests t ON t.id = te.test_id
       LEFT JOIN test_submissions ts ON ts.test_id = t.id AND ts.student_id = te.student_id
       LEFT JOIN questions q ON q.test_id = t.id
       WHERE te.student_id = $1 AND t.is_active = true
       GROUP BY t.id, ts.is_submitted, ts.score, ts.total_marks, ts.submitted_at
       ORDER BY t.scheduled_date DESC, t.start_time ASC`,
      [studentId]
    );

    // Compute status for each test
    const tests = result.rows.map((test) => {
      let status = 'upcoming';
      const d = new Date(test.scheduled_date);
      const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (test.is_submitted) {
        status = 'completed';
      } else if (testDate === today && test.start_time <= currentTime && test.end_time >= currentTime) {
        status = 'active';
      } else if (testDate < today || (testDate === today && test.end_time < currentTime)) {
        status = 'expired';
      }

      return { ...test, status, _debug: { testDate, today, startTime: test.start_time, endTime: test.end_time, currentTime } };
    });

    return res.json({ success: true, data: tests });
  } catch (error) {
    console.error('Get my tests error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/student/tests/:test_id
 * Get test questions for attending (only if enrolled, active window, not submitted)
 */
const getTestForAttend = async (req, res) => {
  try {
    const { test_id } = req.params;
    const studentId = req.user.id;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Check enrollment
    const enrolled = await query(
      'SELECT id FROM test_enrollments WHERE test_id = $1 AND student_id = $2',
      [test_id, studentId]
    );
    if (enrolled.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this test.' });
    }

    // Check if already submitted
    const submission = await query(
      'SELECT is_submitted, answers FROM test_submissions WHERE test_id = $1 AND student_id = $2',
      [test_id, studentId]
    );
    if (submission.rows.length > 0 && submission.rows[0].is_submitted) {
      return res.status(403).json({ success: false, message: 'You have already submitted this test.' });
    }

    // Get test details
    const testResult = await query('SELECT * FROM tests WHERE id = $1 AND is_active = true', [test_id]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const test = testResult.rows[0];
    const d = new Date(test.scheduled_date);
    const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Check time window
    if (testDate !== today || test.start_time > currentTime || test.end_time < currentTime) {
      return res.status(403).json({
        success: false,
        message: 'This test is not currently active.',
        test: { title: test.title, scheduled_date: test.scheduled_date, start_time: test.start_time, end_time: test.end_time }
      });
    }

    // Get questions (without correct answers!)
    const questions = await query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE test_id = $1 ORDER BY id ASC',
      [test_id]
    );

    // Get saved answers if any
    const savedAnswers = submission.rows.length > 0 ? submission.rows[0].answers : [];

    return res.json({
      success: true,
      data: {
        test: {
          id: test.id,
          title: test.title,
          subject: test.subject,
          end_time: test.end_time,
          scheduled_date: test.scheduled_date,
        },
        questions: questions.rows,
        saved_answers: savedAnswers,
      },
    });
  } catch (error) {
    console.error('Get test for attend error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/student/tests/:test_id/submit
 * Submit test answers and calculate score
 */
const submitTest = async (req, res) => {
  try {
    const { test_id } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body; // [{ question_id, selected_answer }]

    // Check enrollment
    const enrolled = await query(
      'SELECT id FROM test_enrollments WHERE test_id = $1 AND student_id = $2',
      [test_id, studentId]
    );
    if (enrolled.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this test.' });
    }

    // Check if already submitted
    const existing = await query(
      'SELECT is_submitted FROM test_submissions WHERE test_id = $1 AND student_id = $2',
      [test_id, studentId]
    );
    if (existing.rows.length > 0 && existing.rows[0].is_submitted) {
      return res.status(409).json({ success: false, message: 'Test already submitted.' });
    }

    // Get correct answers
    const questions = await query(
      'SELECT id, correct_answer, marks FROM questions WHERE test_id = $1',
      [test_id]
    );

    // Calculate score
    let score = 0;
    let totalMarks = 0;
    const answersMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((a) => { answersMap[a.question_id] = a.selected_answer; });
    }

    questions.rows.forEach((q) => {
      totalMarks += q.marks;
      if (answersMap[q.id]?.toLowerCase() === q.correct_answer.toLowerCase()) {
        score += q.marks;
      }
    });

    const now = new Date();

    // Upsert submission
    if (existing.rows.length > 0) {
      await query(
        `UPDATE test_submissions SET answers = $1, score = $2, total_marks = $3,
         submitted_at = $4, is_submitted = true WHERE test_id = $5 AND student_id = $6`,
        [JSON.stringify(answers || []), score, totalMarks, now, test_id, studentId]
      );
    } else {
      await query(
        `INSERT INTO test_submissions (test_id, student_id, answers, score, total_marks, submitted_at, is_submitted)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [test_id, studentId, JSON.stringify(answers || []), score, totalMarks, now]
      );
    }

    return res.json({
      success: true,
      message: 'Test submitted successfully.',
      data: { score, total_marks: totalMarks, percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0 },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/student/tests/:test_id/warning
 * Record a fullscreen/tab violation warning
 */
const recordWarning = async (req, res) => {
  try {
    const { test_id } = req.params;
    const studentId = req.user.id;

    // Upsert submission record and increment warning count
    const existing = await query(
      'SELECT id, warning_count, is_submitted FROM test_submissions WHERE test_id = $1 AND student_id = $2',
      [test_id, studentId]
    );

    let warningCount = 1;
    if (existing.rows.length === 0) {
      await query(
        'INSERT INTO test_submissions (test_id, student_id, warning_count) VALUES ($1, $2, 1)',
        [test_id, studentId]
      );
    } else {
      if (existing.rows[0].is_submitted) {
        return res.json({ success: true, warning_count: existing.rows[0].warning_count, auto_submit: false });
      }
      warningCount = existing.rows[0].warning_count + 1;
      await query(
        'UPDATE test_submissions SET warning_count = $1 WHERE test_id = $2 AND student_id = $3',
        [warningCount, test_id, studentId]
      );
    }

    const autoSubmit = warningCount >= 3;
    if (autoSubmit) {
      await query(
        'UPDATE test_submissions SET is_submitted = true, auto_submitted = true, submitted_at = CURRENT_TIMESTAMP WHERE test_id = $1 AND student_id = $2',
        [test_id, studentId]
      );
    }

    return res.json({ success: true, warning_count: warningCount, auto_submit: autoSubmit });
  } catch (error) {
    console.error('Record warning error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/student/results
 * Get all submitted tests for this student
 */
const getMyResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await query(
      `SELECT t.title, t.subject, t.scheduled_date,
              ts.score, ts.total_marks, ts.submitted_at, ts.auto_submitted,
              CASE WHEN ts.total_marks > 0
                   THEN ROUND((CAST(ts.score AS DECIMAL) / ts.total_marks) * 100, 2)
                   ELSE 0 END AS percentage
       FROM test_submissions ts
       JOIN tests t ON t.id = ts.test_id
       WHERE ts.student_id = $1 AND ts.is_submitted = true
       ORDER BY ts.submitted_at DESC`,
      [studentId]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my results error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStudentStats, getMyTests, getTestForAttend, submitTest, recordWarning, getMyResults };
