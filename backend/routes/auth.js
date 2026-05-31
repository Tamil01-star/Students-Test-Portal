const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login — public
router.post('/login', login);

// POST /api/auth/change-password — requires authentication only (not password_changed check)
router.post('/change-password', authenticate, changePassword);

module.exports = router;
