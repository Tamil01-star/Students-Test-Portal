const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * GET /api/management/stats
 * Dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    const staffCount = await query("SELECT COUNT(*) FROM users WHERE role = 'staff' AND is_active = true");
    const studentCount = await query("SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = true");
    const testCount = await query('SELECT COUNT(*) FROM tests WHERE is_active = true');

    return res.json({
      success: true,
      data: {
        total_staff: parseInt(staffCount.rows[0].count),
        total_students: parseInt(studentCount.rows[0].count),
        total_tests: parseInt(testCount.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/management/create-staff
 * Create a new staff account (management only)
 */
const createStaff = async (req, res) => {
  try {
    const { name, email, staff_id, temp_password } = req.body;

    if (!name || !staff_id || !temp_password) {
      return res.status(400).json({ success: false, message: 'Name, Staff ID, and temporary password are required.' });
    }

    // Check if staff_id already exists
    const existing = await query('SELECT id FROM users WHERE user_id = $1', [staff_id.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Staff ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(temp_password, 12);

    const result = await query(
      `INSERT INTO users (user_id, name, email, password, role, password_changed, created_by)
       VALUES ($1, $2, $3, $4, 'staff', false, $5) RETURNING id, user_id, name, email, role, created_at`,
      [staff_id.trim(), name.trim(), email?.trim() || null, hashedPassword, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: `Staff account created successfully. Staff ID: ${staff_id}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/management/staff
 * Get all staff members with test counts
 */
const getAllStaff = async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.user_id, u.name, u.email, u.is_active, u.created_at,
             COUNT(t.id) AS tests_created
      FROM users u
      LEFT JOIN tests t ON t.created_by = u.id
      WHERE u.role = 'staff'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/management/students
 * Get all students with the staff who created them
 */
const getAllStudents = async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.user_id, u.name, u.email, u.is_active, u.created_at,
             s.name AS created_by_name, s.user_id AS created_by_id
      FROM users u
      LEFT JOIN users s ON s.id = u.created_by
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PATCH /api/management/staff/:id/deactivate
 * Deactivate a staff account
 */
const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "UPDATE users SET is_active = false WHERE id = $1 AND role = 'staff' RETURNING id, user_id, name",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    return res.json({ success: true, message: 'Staff account deactivated.', data: result.rows[0] });
  } catch (error) {
    console.error('Deactivate staff error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats, createStaff, getAllStaff, getAllStudents, deactivateStaff };
