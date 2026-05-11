const express = require('express');
const {
  getAllAttendance,
  clockIn,
  clockOut,
  createAttendance,
  updateAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/', authorize('admin'), createAttendance);
router.put('/:id', authorize('admin'), updateAttendance);

module.exports = router;
