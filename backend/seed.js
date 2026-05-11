require('dotenv').config();
const { supabase } = require('./config/db');
const bcrypt = require('bcryptjs');

const DEPARTMENTS = [
  { name: 'Engineering',       description: 'Software development and IT' },
  { name: 'Human Resources',   description: 'HR and recruitment' },
  { name: 'Finance',           description: 'Accounting and finance' },
  { name: 'Marketing',         description: 'Marketing and sales' },
  { name: 'Operations',        description: 'Business operations' },
  { name: 'Design',            description: 'UI/UX and graphic design' },
  { name: 'Sales',             description: 'Sales and business development' },
  { name: 'Legal',             description: 'Legal and compliance' },
];

const EMPLOYEES = [
  // Engineering (12)
  { name: 'Arjun Sharma',     email: 'arjun.sharma@company.com',     dept: 0, position: 'Senior Software Engineer',  salary: 95000 },
  { name: 'Priya Patel',      email: 'priya.patel@company.com',      dept: 0, position: 'Frontend Developer',        salary: 72000 },
  { name: 'Rahul Verma',      email: 'rahul.verma@company.com',      dept: 0, position: 'Backend Developer',         salary: 78000 },
  { name: 'Sneha Gupta',      email: 'sneha.gupta@company.com',      dept: 0, position: 'Full Stack Developer',      salary: 82000 },
  { name: 'Vikram Singh',     email: 'vikram.singh@company.com',     dept: 0, position: 'DevOps Engineer',           salary: 88000 },
  { name: 'Ananya Reddy',     email: 'ananya.reddy@company.com',     dept: 0, position: 'QA Engineer',               salary: 65000 },
  { name: 'Karan Mehta',      email: 'karan.mehta@company.com',      dept: 0, position: 'Mobile Developer',          salary: 76000 },
  { name: 'Divya Nair',       email: 'divya.nair@company.com',       dept: 0, position: 'Data Engineer',             salary: 85000 },
  { name: 'Rohan Joshi',      email: 'rohan.joshi@company.com',      dept: 0, position: 'Software Engineer',         salary: 70000 },
  { name: 'Meera Iyer',       email: 'meera.iyer@company.com',       dept: 0, position: 'Cloud Architect',           salary: 105000 },
  { name: 'Aditya Kumar',     email: 'aditya.kumar@company.com',     dept: 0, position: 'Security Engineer',         salary: 92000 },
  { name: 'Pooja Desai',      email: 'pooja.desai@company.com',      dept: 0, position: 'Junior Developer',          salary: 55000 },
  // HR (6)
  { name: 'Sunita Rao',       email: 'sunita.rao@company.com',       dept: 1, position: 'HR Manager',                salary: 68000 },
  { name: 'Amit Tiwari',      email: 'amit.tiwari@company.com',      dept: 1, position: 'HR Executive',              salary: 48000 },
  { name: 'Kavya Menon',      email: 'kavya.menon@company.com',      dept: 1, position: 'Recruiter',                 salary: 52000 },
  { name: 'Deepak Pandey',    email: 'deepak.pandey@company.com',    dept: 1, position: 'HR Coordinator',            salary: 45000 },
  { name: 'Ritu Saxena',      email: 'ritu.saxena@company.com',      dept: 1, position: 'Payroll Specialist',        salary: 58000 },
  { name: 'Nikhil Bose',      email: 'nikhil.bose@company.com',      dept: 1, position: 'Training Manager',          salary: 62000 },
  // Finance (6)
  { name: 'Sanjay Agarwal',   email: 'sanjay.agarwal@company.com',   dept: 2, position: 'Finance Manager',           salary: 85000 },
  { name: 'Lakshmi Pillai',   email: 'lakshmi.pillai@company.com',   dept: 2, position: 'Senior Accountant',         salary: 65000 },
  { name: 'Rajesh Mishra',    email: 'rajesh.mishra@company.com',    dept: 2, position: 'Financial Analyst',         salary: 72000 },
  { name: 'Nisha Kapoor',     email: 'nisha.kapoor@company.com',     dept: 2, position: 'Accountant',                salary: 55000 },
  { name: 'Suresh Yadav',     email: 'suresh.yadav@company.com',     dept: 2, position: 'Tax Consultant',            salary: 78000 },
  { name: 'Geeta Chaudhary',  email: 'geeta.chaudhary@company.com',  dept: 2, position: 'Audit Executive',           salary: 60000 },
  // Marketing (6)
  { name: 'Rohit Bansal',     email: 'rohit.bansal@company.com',     dept: 3, position: 'Marketing Manager',         salary: 75000 },
  { name: 'Swati Jain',       email: 'swati.jain@company.com',       dept: 3, position: 'Digital Marketing Lead',    salary: 62000 },
  { name: 'Manish Dubey',     email: 'manish.dubey@company.com',     dept: 3, position: 'Content Strategist',        salary: 55000 },
  { name: 'Pallavi Sinha',    email: 'pallavi.sinha@company.com',    dept: 3, position: 'SEO Specialist',            salary: 50000 },
  { name: 'Tarun Malhotra',   email: 'tarun.malhotra@company.com',   dept: 3, position: 'Brand Manager',             salary: 70000 },
  { name: 'Ishita Ghosh',     email: 'ishita.ghosh@company.com',     dept: 3, position: 'Social Media Manager',      salary: 52000 },
  // Operations (6)
  { name: 'Vinod Sharma',     email: 'vinod.sharma@company.com',     dept: 4, position: 'Operations Manager',        salary: 80000 },
  { name: 'Preeti Kulkarni',  email: 'preeti.kulkarni@company.com',  dept: 4, position: 'Operations Analyst',        salary: 58000 },
  { name: 'Gaurav Tripathi',  email: 'gaurav.tripathi@company.com',  dept: 4, position: 'Process Engineer',          salary: 65000 },
  { name: 'Shweta Bhatt',     email: 'shweta.bhatt@company.com',     dept: 4, position: 'Supply Chain Manager',      salary: 72000 },
  { name: 'Manoj Rawat',      email: 'manoj.rawat@company.com',      dept: 4, position: 'Logistics Coordinator',     salary: 48000 },
  { name: 'Anjali Chauhan',   email: 'anjali.chauhan@company.com',   dept: 4, position: 'Quality Manager',           salary: 68000 },
  // Design (5)
  { name: 'Riya Oberoi',      email: 'riya.oberoi@company.com',      dept: 5, position: 'UI/UX Lead',                salary: 78000 },
  { name: 'Siddharth Negi',   email: 'siddharth.negi@company.com',   dept: 5, position: 'Graphic Designer',          salary: 55000 },
  { name: 'Tanvi Rastogi',    email: 'tanvi.rastogi@company.com',    dept: 5, position: 'Product Designer',          salary: 68000 },
  { name: 'Harsh Vardhan',    email: 'harsh.vardhan@company.com',    dept: 5, position: 'Motion Designer',           salary: 60000 },
  { name: 'Simran Kaur',      email: 'simran.kaur@company.com',      dept: 5, position: 'Visual Designer',           salary: 52000 },
  // Sales (5)
  { name: 'Akash Goel',       email: 'akash.goel@company.com',       dept: 6, position: 'Sales Manager',             salary: 82000 },
  { name: 'Neha Srivastava',  email: 'neha.srivastava@company.com',  dept: 6, position: 'Senior Sales Executive',    salary: 65000 },
  { name: 'Piyush Arora',     email: 'piyush.arora@company.com',     dept: 6, position: 'Business Developer',        salary: 70000 },
  { name: 'Shruti Bajaj',     email: 'shruti.bajaj@company.com',     dept: 6, position: 'Account Manager',           salary: 68000 },
  { name: 'Vivek Mathur',     email: 'vivek.mathur@company.com',     dept: 6, position: 'Sales Executive',           salary: 55000 },
  // Legal (4)
  { name: 'Aditi Lal',        email: 'aditi.lal@company.com',        dept: 7, position: 'Legal Manager',             salary: 90000 },
  { name: 'Sameer Walia',     email: 'sameer.walia@company.com',     dept: 7, position: 'Corporate Lawyer',          salary: 95000 },
  { name: 'Bhavna Sethi',     email: 'bhavna.sethi@company.com',     dept: 7, position: 'Compliance Officer',        salary: 72000 },
  { name: 'Chirag Anand',     email: 'chirag.anand@company.com',     dept: 7, position: 'Legal Analyst',             salary: 62000 },
];

const LEAVE_TYPES = ['sick', 'casual', 'annual', 'unpaid'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const dateStr = (d) => d.toISOString().split('T')[0];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // ── Clear existing data ──
    console.log('Clearing existing data...');
    await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('payroll').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leaves').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('departments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Cleared existing data\n');

    // ── Departments ──
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .insert(DEPARTMENTS.map(d => ({ ...d, employee_count: 0 })))
      .select();
    if (deptError) throw deptError;
    console.log(`✅ Created ${departments.length} departments`);

    // ── Admin ──
    const adminPassword = await bcrypt.hash('admin123', 10);
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([{
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        employee_id: 'EMP000001',
        status: 'active',
        phone: '9000000001',
        address: '1 Admin HQ, Mumbai',
        position: 'System Administrator',
        salary: 120000,
        join_date: new Date('2022-01-01').toISOString(),
      }])
      .select()
      .single();
    if (adminError) throw adminError;
    console.log('✅ Created admin user');

    // ── 50 Employees ──
    const empPassword = await bcrypt.hash('employee123', 10);
    const empInserts = EMPLOYEES.map((e, i) => ({
      name: e.name,
      email: e.email,
      password: empPassword,
      role: 'employee',
      employee_id: `EMP${String(i + 2).padStart(6, '0')}`,
      department_id: departments[e.dept].id,
      position: e.position,
      salary: e.salary,
      status: 'active',
      phone: `90${String(10000000 + i)}`,
      address: `${i + 1} Employee Street, India`,
      join_date: new Date(2022 + Math.floor(i / 20), i % 12, randomInt(1, 28)).toISOString(),
    }));

    const { data: employees, error: empError } = await supabase
      .from('users')
      .insert(empInserts)
      .select();
    if (empError) throw empError;
    console.log(`✅ Created ${employees.length} employees`);

    // ── Update dept employee counts ──
    const deptCounts = {};
    EMPLOYEES.forEach(e => { deptCounts[e.dept] = (deptCounts[e.dept] || 0) + 1; });
    for (const [deptIdx, count] of Object.entries(deptCounts)) {
      await supabase.from('departments').update({ employee_count: count }).eq('id', departments[deptIdx].id);
    }
    console.log('✅ Updated department counts');

    // ── Attendance (last 60 days for all employees) ──
    console.log('Creating attendance records...');
    const attendanceRecords = [];
    for (const emp of employees) {
      for (let d = 60; d >= 1; d--) {
        const day = daysAgo(d);
        const dow = day.getDay();
        if (dow === 0 || dow === 6) continue; // skip weekends
        const rand = Math.random();
        if (rand < 0.08) continue; // 8% absent
        const clockInHour  = randomInt(8, 10);
        const clockInMin   = randomInt(0, 59);
        const clockOutHour = randomInt(17, 19);
        const clockOutMin  = randomInt(0, 59);
        const ci = new Date(day); ci.setHours(clockInHour, clockInMin, 0);
        const co = new Date(day); co.setHours(clockOutHour, clockOutMin, 0);
        const workHours = Math.round(((co - ci) / 3600000) * 100) / 100;
        attendanceRecords.push({
          employee_id: emp.id,
          date: dateStr(day),
          clock_in: ci.toISOString(),
          clock_out: co.toISOString(),
          status: clockInHour >= 10 ? 'late' : 'present',
          work_hours: workHours,
        });
      }
    }
    // Insert in batches of 500
    for (let i = 0; i < attendanceRecords.length; i += 500) {
      const { error } = await supabase.from('attendance').insert(attendanceRecords.slice(i, i + 500));
      if (error) throw error;
    }
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    // ── Leaves ──
    console.log('Creating leave records...');
    const leaveRecords = [];
    for (const emp of employees) {
      const numLeaves = randomInt(1, 4);
      for (let l = 0; l < numLeaves; l++) {
        const startOffset = randomInt(1, 50);
        const duration    = randomInt(1, 4);
        const start = daysAgo(startOffset);
        const end   = daysAgo(startOffset - duration);
        if (end > new Date()) continue;
        const status = LEAVE_STATUSES[randomInt(0, 2)];
        leaveRecords.push({
          employee_id: emp.id,
          leave_type: LEAVE_TYPES[randomInt(0, 3)],
          start_date: dateStr(start),
          end_date: dateStr(end),
          reason: ['Family emergency', 'Medical appointment', 'Personal work', 'Vacation', 'Sick leave'][randomInt(0, 4)],
          status,
          approved_by: status !== 'pending' ? admin.id : null,
          approved_date: status !== 'pending' ? new Date().toISOString() : null,
        });
      }
    }
    const { error: leaveError } = await supabase.from('leaves').insert(leaveRecords);
    if (leaveError) throw leaveError;
    console.log(`✅ Created ${leaveRecords.length} leave records`);

    // ── Payroll (last 6 months) ──
    console.log('Creating payroll records...');
    const payrollRecords = [];
    const now = new Date();
    for (const emp of employees) {
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const month = d.getMonth() + 1;
        const year  = d.getFullYear();
        const empData = EMPLOYEES.find(e => e.email === emp.email);
        const basic = empData?.salary || 60000;
        const allowances = Math.round(basic * 0.1);
        const deductions = Math.round(basic * 0.05);
        const bonus = m === 0 ? Math.round(basic * 0.05) : 0;
        const net_salary = basic + allowances + bonus - deductions;
        const isPaid = m > 0; // current month pending, rest paid
        payrollRecords.push({
          employee_id: emp.id,
          month, year,
          basic_salary: basic,
          allowances,
          deductions,
          bonus,
          net_salary,
          status: isPaid ? 'paid' : 'pending',
          paid_date: isPaid ? new Date(year, month - 1, 25).toISOString() : null,
          payment_method: isPaid ? 'Bank Transfer' : null,
        });
      }
    }
    // Insert in batches of 200
    for (let i = 0; i < payrollRecords.length; i += 200) {
      const { error } = await supabase.from('payroll').insert(payrollRecords.slice(i, i + 200));
      if (error) throw error;
    }
    console.log(`✅ Created ${payrollRecords.length} payroll records`);

    // ── Announcements ──
    const { error: annError } = await supabase.from('announcements').insert([
      { title: 'Welcome to PayrollPro!', content: 'We are excited to launch our new Employee Payroll Management System. Explore all features and share your feedback.', priority: 'high', created_by: admin.id, is_active: true },
      { title: 'Q1 Appraisal Cycle Open', content: 'The Q1 performance appraisal cycle is now open. Managers please submit reviews by end of month.', priority: 'high', created_by: admin.id, is_active: true },
      { title: 'Office Holiday — 15th August', content: 'The office will remain closed on 15th August for Independence Day. Enjoy the long weekend!', priority: 'medium', created_by: admin.id, is_active: true },
      { title: 'Payroll Processing Date', content: 'Monthly payroll will be processed on the 25th of every month. Ensure attendance is updated before the 24th.', priority: 'high', created_by: admin.id, is_active: true },
      { title: 'New Leave Policy Update', content: 'Effective next month, employees will receive 2 additional casual leaves per year. Updated policy document is on the HR portal.', priority: 'medium', created_by: admin.id, is_active: true },
      { title: 'Team Outing — Save the Date', content: 'Annual company outing is scheduled for next month. Details will be shared by HR shortly.', priority: 'low', created_by: admin.id, is_active: true },
    ]);
    if (annError) throw annError;
    console.log('✅ Created 6 announcements');

    // ── Summary ──
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       Seed Completed Successfully    ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  Admin:    admin@example.com         ║');
    console.log('║  Password: admin123                  ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  Employee: arjun.sharma@company.com  ║');
    console.log('║  Password: employee123               ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Departments : ${departments.length}                     ║`);
    console.log(`║  Employees   : ${employees.length}                    ║`);
    console.log(`║  Attendance  : ${attendanceRecords.length}                 ║`);
    console.log(`║  Leaves      : ${leaveRecords.length}                    ║`);
    console.log(`║  Payrolls    : ${payrollRecords.length}                   ║`);
    console.log('╚══════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message || error);
    process.exit(1);
  }
};

seedDatabase();
