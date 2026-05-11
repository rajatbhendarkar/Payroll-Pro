const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const { supabase } = require('../config/db');
const PDFDocument = require('pdfkit');

exports.getAllPayrolls = async (req, res) => {
  try {
    const { employee, month, year, status } = req.query;
    const filters = {};
    
    if (req.user.role === 'employee') {
      filters.employee_id = req.user.id;
    } else if (employee) {
      filters.employee_id = employee;
    }
    
    if (month) filters.month = month;
    if (year) filters.year = year;
    if (status) filters.status = status;

    const payrolls = await Payroll.findAll(filters);
    res.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayroll = async (req, res) => {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions, bonus } = req.body;

    const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const monthEnd   = new Date(year, month, 0).toISOString().split('T')[0];
    const dailySalary = basic_salary / 26; // 26 working days/month

    // 1. Leave deduction — unpaid days beyond 4 free leaves
    let leaveDeduction = 0;
    const { data: approvedLeaves } = await supabase
      .from('leaves')
      .select('start_date, end_date')
      .eq('employee_id', employee_id)
      .eq('status', 'approved')
      .gte('start_date', monthStart)
      .lte('end_date', monthEnd);

    if (approvedLeaves?.length > 0) {
      let totalLeaveDays = 0;
      approvedLeaves.forEach(leave => {
        const days = Math.ceil(
          (new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)
        ) + 1;
        totalLeaveDays += days;
      });
      if (totalLeaveDays > 4) {
        leaveDeduction = dailySalary * (totalLeaveDays - 4);
      }
    }

    // 2. Half-day deduction — 0.5 * dailySalary per half-day attendance record
    const { data: halfDays } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('status', 'half-day')
      .gte('date', monthStart)
      .lte('date', monthEnd);

    const halfDayDeduction = (halfDays?.length || 0) * dailySalary * 0.5;

    const totalDeductions = (deductions || 0) + leaveDeduction + halfDayDeduction;
    const net_salary = basic_salary + (allowances || 0) + (bonus || 0) - totalDeductions;

    const payroll = await Payroll.create({
      employee_id, month, year, basic_salary,
      allowances: allowances || 0,
      deductions: Math.round(totalDeductions * 100) / 100,
      bonus: bonus || 0,
      net_salary: Math.round(net_salary * 100) / 100
    });

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const { basic_salary, allowances, deductions, bonus } = req.body;
    if (basic_salary !== undefined) {
      req.body.net_salary = (basic_salary || 0) + (allowances || 0) + (bonus || 0) - (deductions || 0);
    }

    const payroll = await Payroll.update(req.params.id, req.body);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.update(req.params.id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method: req.body.paymentMethod
    });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.users.employee_id}-${payroll.month}-${payroll.year}.pdf`);
    
    doc.pipe(res);
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4f0');
    
    // Title
    doc.fillColor('#000').fontSize(18).font('Helvetica-Bold').text('Salary Slip For The Month of', 100, 80, { continued: true });
    doc.text(`    ${months[payroll.month - 1]}`, { align: 'left' });
    
    doc.moveDown(2);
    
    // Employee details
    const startY = 140;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Employee ID:', 100, startY);
    doc.font('Helvetica').text(payroll.users.employee_id || 'N/A', 220, startY);
    
    doc.font('Helvetica-Bold').text('Name:', 100, startY + 25);
    doc.font('Helvetica').text(payroll.users.name, 220, startY + 25);
    
    doc.font('Helvetica-Bold').text('Designation:', 100, startY + 50);
    doc.font('Helvetica').text(payroll.users.position || 'N/A', 220, startY + 50);
    
    doc.font('Helvetica-Bold').text('Department:', 100, startY + 75);
    doc.font('Helvetica').text(payroll.users.departments?.name || 'N/A', 220, startY + 75);
    
    doc.font('Helvetica-Bold').text('Date Of Joining:', 100, startY + 100);
    doc.font('Helvetica').text(new Date(payroll.users.join_date).toLocaleDateString(), 220, startY + 100);
    
    doc.moveDown(3);
    
    // Salary details
    const salaryY = startY + 150;
    doc.font('Helvetica-Bold').text('Basic Salary: ₹', 100, salaryY, { continued: true });
    doc.font('Helvetica').text(payroll.basic_salary.toLocaleString());
    
    doc.font('Helvetica-Bold').text('Allowances: ₹', 350, salaryY, { continued: true });
    doc.font('Helvetica').text(payroll.allowances.toLocaleString());
    
    doc.font('Helvetica-Bold').text('Deduction: ₹', 350, salaryY + 25, { continued: true });
    doc.font('Helvetica').text(payroll.deductions.toLocaleString());
    
    doc.moveDown(2);
    
    // Net salary
    const netY = salaryY + 70;
    doc.font('Helvetica-Bold').fontSize(12).text('Net Salary Amount: ₹', 100, netY, { continued: true });
    doc.text(payroll.net_salary.toLocaleString());
    
    // Amount in words
    const amountInWords = numberToWords(payroll.net_salary);
    doc.font('Helvetica-Bold').text('Amount in Words:', 100, netY + 25, { continued: true });
    doc.font('Helvetica').text(`        ${amountInWords}`);
    
    doc.moveDown(4);
    
    // Footer
    const footerY = netY + 100;
    doc.font('Helvetica-Bold').fontSize(11).text('Prepared By:', 100, footerY);
    doc.text('Approved By:', 400, footerY);
    
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero Rupees Only';
  
  let words = '';
  
  if (num >= 100000) {
    words += ones[Math.floor(num / 100000)] + ' Lakh ';
    num %= 100000;
  }
  
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands >= 10) {
      words += tens[Math.floor(thousands / 10)] + ' ';
      if (thousands % 10 > 0) words += ones[thousands % 10] + ' ';
    } else {
      words += ones[thousands] + ' ';
    }
    words += 'Thousand ';
    num %= 1000;
  }
  
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + ' ';
    num = 0;
  }
  
  if (num > 0) {
    words += ones[num] + ' ';
  }
  
  return 'Rupees ' + words.trim() + ' Only';
}
