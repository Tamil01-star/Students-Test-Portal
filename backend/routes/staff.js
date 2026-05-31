const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireStaff, requirePasswordChanged } = require('../middleware/roleCheck');
const {
  getStaffStats, createTest, getMyTests,
  addQuestion, getQuestions, deleteQuestion,
  getAllStudents, enrollStudents, getEnrolledStudents,
  getResults, createStudent,
} = require('../controllers/staffController');

// All staff routes require auth + staff role + password changed
router.use(authenticate, requireStaff, requirePasswordChanged);

router.get('/stats', getStaffStats);
router.post('/create-test', createTest);
router.get('/tests', getMyTests);
router.post('/tests/:test_id/questions', addQuestion);
router.get('/tests/:test_id/questions', getQuestions);
router.delete('/questions/:id', deleteQuestion);
router.get('/students', getAllStudents);
router.post('/tests/:test_id/enroll', enrollStudents);
router.get('/tests/:test_id/enrolled', getEnrolledStudents);
router.get('/results/:test_id', getResults);
router.post('/create-student', createStudent);

module.exports = router;
