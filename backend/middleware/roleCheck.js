/**
 * Role-Based Access Control Middleware
 * Checks the authenticated user's role against allowed roles
 */

/** Only management users allowed */
const requireManagement = (req, res, next) => {
  if (req.user?.role !== 'management') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Management role required.',
    });
  }
  next();
};

/** Only staff users allowed */
const requireStaff = (req, res, next) => {
  if (req.user?.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff role required.',
    });
  }
  next();
};

/** Only student users allowed */
const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.',
    });
  }
  next();
};

/**
 * Enforces password change on first login.
 * Block all protected routes until password_changed = true.
 * Exception: /api/auth/change-password itself is excluded.
 */
const requirePasswordChanged = (req, res, next) => {
  if (req.user?.password_changed === false) {
    return res.status(403).json({
      success: false,
      message: 'Please change your password before continuing.',
      requiresPasswordChange: true,
    });
  }
  next();
};

module.exports = {
  requireManagement,
  requireStaff,
  requireStudent,
  requirePasswordChanged,
};
