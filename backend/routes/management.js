const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireManagement, requirePasswordChanged } = require('../middleware/roleCheck');
const {
  getStats, createStaff, getAllStaff, getAllStudents, deactivateStaff,
} = require('../controllers/managementController');

// All management routes require auth + management role + password changed
router.use(authenticate, requireManagement, requirePasswordChanged);

router.get('/stats', getStats);
router.post('/create-staff', createStaff);
router.get('/staff', getAllStaff);
router.get('/students', getAllStudents);
router.patch('/staff/:id/deactivate', deactivateStaff);

module.exports = router;
