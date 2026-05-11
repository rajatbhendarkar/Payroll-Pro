const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { supabase } = require('../config/db');

exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employee } = req.query;
    const filters = {};
    
    if (req.user.role === 'employee') {
      filters.employee_id = req.user.id;
    } else if (employee) {
      filters.employee_id = employee;
    }
    
    if (status) filters.status = status;

    const leaves = await Leave.findAll(filters);
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, employee_id: req.user.id });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const updateData = { status, approved_by: req.user.id, approved_date: new Date().toISOString() };
    if (rejection_reason) updateData.rejection_reason = rejection_reason;

    const leave = await Leave.update(req.params.id, updateData);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    // Calculate leave deduction if approved and more than 4 days
    if (status === 'approved') {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const leaveDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      if (leaveDays > 4) {
        const excessDays = leaveDays - 4;
        
        // Get employee salary
        const { data: employee } = await supabase
          .from('users')
          .select('salary')
          .eq('id', leave.employee_id)
          .single();

        if (employee && employee.salary) {
          const dailySalary = employee.salary / 30;
          const deductionAmount = dailySalary * excessDays;

          // Update current month payroll
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          const existingPayroll = await Payroll.findOne({
            employee_id: leave.employee_id,
            month: currentMonth,
            year: currentYear
          });

          if (existingPayroll) {
            const newDeductions = (existingPayroll.deductions || 0) + deductionAmount;
            const newNetSalary = existingPayroll.basic_salary + (existingPayroll.allowances || 0) + (existingPayroll.bonus || 0) - newDeductions;
            
            await Payroll.update(existingPayroll.id, {
              deductions: newDeductions,
              net_salary: newNetSalary
            });
          }
        }
      }
    }

    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    await Leave.delete(req.params.id);
    res.json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
