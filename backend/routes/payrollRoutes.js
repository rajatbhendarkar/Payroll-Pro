const express = require('express');
const {
  getAllPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  markAsPaid,
  generatePayslip
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllPayrolls)
  .post(authorize('admin'), createPayroll);

router.route('/:id')
  .get(getPayroll)
  .put(authorize('admin'), updatePayroll);

router.put('/:id/paid', authorize('admin'), markAsPaid);
router.get('/:id/payslip', generatePayslip);

module.exports = router;
