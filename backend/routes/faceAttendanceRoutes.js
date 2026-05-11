const express = require('express');
const { registerFace, getMyFace, faceClockIn, getCompanyLocation, setCompanyLocation } = require('../controllers/faceAttendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/company-location', protect, getCompanyLocation);
router.put('/company-location', protect, authorize('admin'), setCompanyLocation);
router.post('/register-face/:employeeId', protect, authorize('admin'), registerFace);
router.get('/my-face', protect, getMyFace);
router.post('/clock-in', protect, faceClockIn);

module.exports = router;
