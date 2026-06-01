const express = require('express');
const router = express.Router();
const { login, changePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login — public
router.post('/login', login);

// POST /api/auth/change-password — requires authentication only (not password_changed check)
router.post('/change-password', authenticate, changePassword);

// POST /api/auth/update-profile — requires authentication
router.post('/update-profile', authenticate, updateProfile);

module.exports = router;
