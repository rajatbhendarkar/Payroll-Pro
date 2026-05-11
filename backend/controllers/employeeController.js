const User = require('../models/User');
const Department = require('../models/Department');

exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const filters = {};
    if (search) filters.search = search;
    if (department) filters.department = department;
    if (status) filters.status = status;

    const employees = await User.findAll(filters);
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employee_id = 'EMP' + Date.now().toString().slice(-6);
    const employeeData = { ...req.body, employee_id, role: 'employee' };
    if (employeeData.department_id === '') employeeData.department_id = null;
    
    const employee = await User.create(employeeData);
    
    if (employee.department_id) {
      const dept = await Department.findById(employee.department_id);
      await Department.update(employee.department_id, { employee_count: (dept.employee_count || 0) + 1 });
    }

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.department_id === '') updateData.department_id = null;
    
    const employee = await User.update(req.params.id, updateData);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    if (employee.department_id) {
      const dept = await Department.findById(employee.department_id);
      await Department.update(employee.department_id, { employee_count: Math.max(0, (dept.employee_count || 0) - 1) });
    }

    await User.delete(req.params.id);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveEmployee = async (req, res) => {
  try {
    const employee = await User.update(req.params.id, { status: 'active' });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
