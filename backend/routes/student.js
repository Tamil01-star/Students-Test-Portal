const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireStudent, requirePasswordChanged } = require('../middleware/roleCheck');
const {
  getStudentStats, getMyTests, getTestForAttend,
  submitTest, recordWarning, getMyResults,
} = require('../controllers/studentController');

// All student routes require auth + student role + password changed
router.use(authenticate, requireStudent, requirePasswordChanged);

router.get('/stats', getStudentStats);
router.get('/tests', getMyTests);
router.get('/tests/:test_id', getTestForAttend);
router.post('/tests/:test_id/submit', submitTest);
router.post('/tests/:test_id/warning', recordWarning);
router.get('/results', getMyResults);

module.exports = router;
