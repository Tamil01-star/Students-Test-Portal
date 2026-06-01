const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/** Generate JWT token with 8-hour expiry */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      password_changed: user.password_changed,
    },
    process.env.JWT_SECRET || 'classic_exam_portal_super_secret_jwt_key_2024',
    { expiresIn: '8h' }
  );
};

/**
 * POST /api/auth/login
 * Login with user_id + password
 */
const login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ success: false, message: 'User ID and password are required.' });
    }

    // Find user by user_id
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1 AND is_active = true',
      [user_id.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        password_changed: user.password_changed,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/change-password
 * Change password (works for first-time and subsequent changes)
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user.id;

    if (!new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'New password and confirmation are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with at least one uppercase letter and one number.',
      });
    }

    // Fetch current user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // If password was already changed, require current_password verification
    if (user.password_changed && current_password) {
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update password in DB
    await query(
      'UPDATE users SET password = $1, password_changed = true WHERE id = $2',
      [hashedPassword, userId]
    );

    // Return new token with password_changed = true
    const updatedUser = { ...user, password_changed: true };
    const newToken = generateToken(updatedUser);

    return res.json({
      success: true,
      message: 'Password changed successfully.',
      token: newToken,
      user: {
        id: updatedUser.id,
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        password_changed: true,
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/update-profile
 * Update user's profile details (name, email)
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    // Update user details in the DB
    await query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name.trim(), email ? email.trim() : null, userId]
    );

    // Fetch updated user details
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const updatedUser = result.rows[0];

    const newToken = generateToken(updatedUser);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      token: newToken,
      user: {
        id: updatedUser.id,
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        password_changed: updatedUser.password_changed,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * Seed default management account on server startup
 * Default credentials: MGMT001 / Admin@1234
 */
const initAdmin = async () => {
  try {
    const result = await query("SELECT id FROM users WHERE role = 'management' LIMIT 1");
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      await query(
        `INSERT INTO users (user_id, name, email, password, role, password_changed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['MGMT001', 'Administrator', 'admin@college.edu', hashedPassword, 'management', true]
      );
      console.log('✅ Default management account created: MGMT001 / Admin@1234');
    }
  } catch (error) {
    console.error('❌ Failed to initialize admin account:', error.message);
  }
};

module.exports = { login, changePassword, updateProfile, initAdmin };
