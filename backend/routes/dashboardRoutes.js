const express = require('express');
const { getAdminStats, getAdminCharts, getRecentActivity, getAIInsights, getEmployeeStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/admin/charts', authorize('admin'), getAdminCharts);
router.get('/admin/activity', authorize('admin'), getRecentActivity);
router.get('/admin/insights', authorize('admin'), getAIInsights);
router.get('/employee', authorize('employee'), getEmployeeStats);

module.exports = router;
