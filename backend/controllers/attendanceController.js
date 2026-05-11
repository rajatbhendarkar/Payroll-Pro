const Attendance = require('../models/Attendance');

exports.getAllAttendance = async (req, res) => {
  try {
    const { employee, startDate, endDate } = req.query;
    const filters = {};
    
    if (req.user.role === 'employee') {
      filters.employee_id = req.user.id;
    } else if (employee) {
      filters.employee_id = employee;
    }
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const attendance = await Attendance.findAll(filters);
    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toLocalISO = (date) => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

exports.clockIn = async (req, res) => {
  try {
    const now = new Date();
    const localISO = toLocalISO(now);
    const today = localISO.split('T')[0];
    const existing = await Attendance.findOne({ employee_id: req.user.id, date: today });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already clocked in today' });
    }

    const attendance = await Attendance.create({
      employee_id: req.user.id,
      date: today,
      clock_in: localISO,
      status: 'present',
      work_hours: null
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const now = new Date();
    const localISO = toLocalISO(now);
    const today = localISO.split('T')[0];
    const attendance = await Attendance.findOne({ employee_id: req.user.id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No clock-in record found for today' });
    }
    if (attendance.clock_out) {
      return res.status(400).json({ success: false, message: 'Already clocked out today' });
    }

    const clockInTime = new Date(attendance.clock_in);
    const workHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    // Half-day: worked less than 7.5h OR clocked in after 09:00
    const clockInHour = clockInTime.getHours() + clockInTime.getMinutes() / 60;
    const isHalfDay = workHours < 7.5 || clockInHour > 9.0;

    const updated = await Attendance.update(attendance.id, {
      clock_out: localISO,
      work_hours: Math.round(workHours * 100) / 100,
      status: isHalfDay ? 'half-day' : 'present'
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.update(req.params.id, req.body);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
