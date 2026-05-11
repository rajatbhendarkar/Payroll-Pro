const express = require('express');
const {
  getAllLeaves,
  getLeave,
  createLeave,
  updateLeaveStatus,
  deleteLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllLeaves)
  .post(createLeave);

router.route('/:id')
  .get(getLeave)
  .delete(deleteLeave);

router.put('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;
