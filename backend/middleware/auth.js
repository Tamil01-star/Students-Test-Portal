const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token from Authorization header
 * Attaches decoded user payload to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'classic_exam_portal_super_secret_jwt_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

module.exports = { authenticate };
