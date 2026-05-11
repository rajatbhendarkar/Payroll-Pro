const User = require('../models/User');
const Leave = require('../models/Leave');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const { supabase } = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const totalEmployees = await User.count({ role: 'employee', status: 'active' });
    const pendingEmployees = await User.count({ role: 'employee', status: 'pending' });
    const totalDepartments = await Department.count();
    const pendingLeaves = await Leave.count({ status: 'pending' });
    const employeesOnLeave = await Leave.count({ status: 'approved' });
    const pendingPayrolls = await Payroll.count({ status: 'pending' });

    // Previous month employee count for trend
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const { count: prevMonthEmployees } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'employee')
      .eq('status', 'active')
      .lte('created_at', lastMonth.toISOString());

    const employeeTrend = prevMonthEmployees > 0
      ? (((totalEmployees - prevMonthEmployees) / prevMonthEmployees) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalEmployees, pendingEmployees, totalDepartments,
        pendingLeaves, employeesOnLeave, pendingPayrolls,
        trends: { employees: parseFloat(employeeTrend) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminCharts = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Monthly payroll expense (last 6 months)
    const payrollData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const { data: rows } = await supabase
        .from('payroll')
        .select('net_salary')
        .eq('month', m)
        .eq('year', y);
      const total = (rows || []).reduce((sum, r) => sum + (r.net_salary || 0), 0);
      payrollData.push({ month: months[m - 1], amount: Math.round(total) });
    }

    // Employee growth (last 6 months)
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'employee')
        .lte('created_at', endOfMonth);
      growthData.push({ month: months[d.getMonth()], employees: count || 0 });
    }

    // Department salary distribution
    const { data: depts } = await supabase
      .from('departments')
      .select('id, name');
    const deptSalary = [];
    for (const dept of (depts || [])) {
      const { data: emps } = await supabase
        .from('users')
        .select('salary')
        .eq('department_id', dept.id)
        .eq('status', 'active');
      const total = (emps || []).reduce((sum, e) => sum + (e.salary || 0), 0);
      if (total > 0) deptSalary.push({ name: dept.name, value: Math.round(total) });
    }

    // Leave trends (last 6 months)
    const leaveTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const { count: approved } = await supabase
        .from('leaves').select('id', { count: 'exact', head: true })
        .eq('status', 'approved').gte('start_date', start).lte('start_date', end);
      const { count: pending } = await supabase
        .from('leaves').select('id', { count: 'exact', head: true })
        .eq('status', 'pending').gte('start_date', start).lte('start_date', end);
      leaveTrends.push({ month: months[d.getMonth()], approved: approved || 0, pending: pending || 0 });
    }

    res.json({ success: true, data: { payrollData, growthData, deptSalary, leaveTrends } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { data: recentLeaves } = await supabase
      .from('leaves')
      .select('id, created_at, status, users!leaves_employee_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentEmployees } = await supabase
      .from('users')
      .select('id, name, created_at, position')
      .eq('role', 'employee')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentPayrolls } = await supabase
      .from('payroll')
      .select('id, created_at, net_salary, status, users(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const activities = [
      ...(recentLeaves || []).map(l => ({
        id: `leave-${l.id}`, type: 'leave',
        message: `${l.users?.name} submitted a leave request`,
        status: l.status, time: l.created_at
      })),
      ...(recentEmployees || []).map(e => ({
        id: `emp-${e.id}`, type: 'employee',
        message: `${e.name} joined as ${e.position || 'Employee'}`,
        status: 'new', time: e.created_at
      })),
      ...(recentPayrolls || []).map(p => ({
        id: `pay-${p.id}`, type: 'payroll',
        message: `Payroll ₹${p.net_salary?.toLocaleString()} for ${p.users?.name}`,
        status: p.status, time: p.created_at
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    const insights = [];
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const lastMonthNum = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    // Payroll cost change
    const { data: thisMonthPay } = await supabase.from('payroll').select('net_salary').eq('month', thisMonth).eq('year', thisYear);
    const { data: lastMonthPay } = await supabase.from('payroll').select('net_salary').eq('month', lastMonthNum).eq('year', lastMonthYear);
    const thisTotal = (thisMonthPay || []).reduce((s, r) => s + (r.net_salary || 0), 0);
    const lastTotal = (lastMonthPay || []).reduce((s, r) => s + (r.net_salary || 0), 0);
    if (lastTotal > 0) {
      const change = (((thisTotal - lastTotal) / lastTotal) * 100).toFixed(1);
      insights.push({
        id: 1, type: change > 0 ? 'warning' : 'success',
        message: `Payroll cost ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}% this month`,
        icon: 'payroll'
      });
    }

    // Leave rate by department
    const { data: depts } = await supabase.from('departments').select('id, name');
    let maxLeaveRate = 0, maxDept = null;
    for (const dept of (depts || [])) {
      const { count: empCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('department_id', dept.id).eq('status', 'active');
      const { count: leaveCount } = await supabase.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      if (empCount > 0) {
        const rate = leaveCount / empCount;
        if (rate > maxLeaveRate) { maxLeaveRate = rate; maxDept = dept.name; }
      }
    }
    if (maxDept) insights.push({ id: 2, type: 'info', message: `Leave rate is highest in ${maxDept} department`, icon: 'leave' });

    // Pending approvals alert
    const pendingCount = await User.count({ role: 'employee', status: 'pending' });
    if (pendingCount > 0) insights.push({ id: 3, type: 'warning', message: `${pendingCount} employee registration(s) awaiting approval`, icon: 'approval' });

    // Pending payrolls
    const pendingPayrolls = await Payroll.count({ status: 'pending' });
    if (pendingPayrolls > 0) insights.push({ id: 4, type: 'warning', message: `${pendingPayrolls} payroll(s) pending processing for this cycle`, icon: 'payroll' });

    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const pendingLeaves = await Leave.count({ employee_id: req.user.id, status: 'pending' });
    const approvedLeaves = await Leave.count({ employee_id: req.user.id, status: 'approved' });
    const attendanceCount = await Attendance.count({ employee_id: req.user.id });
    const latestPayroll = await Payroll.findOne({ employee_id: req.user.id });

    res.json({
      success: true,
      data: {
        pendingLeaves, approvedLeaves, attendanceCount,
        latestSalary: latestPayroll ? latestPayroll.net_salary : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
