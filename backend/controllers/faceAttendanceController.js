const { supabase } = require('../config/db');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Haversine formula — distance in meters between two GPS coords
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// POST /api/face-attendance/register-face/:employeeId  (admin only)
exports.registerFace = async (req, res) => {
  try {
    const { descriptor } = req.body;
    const employeeId = req.params.employeeId;
    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ success: false, message: 'Face descriptor required' });
    }
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    await User.updateRaw(employeeId, { face_descriptor: JSON.stringify(descriptor) });
    res.json({ success: true, message: `Face registered for ${employee.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/face-attendance/my-face
exports.getMyFace = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, hasface: !!user.face_descriptor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/face-attendance/clock-in
exports.faceClockIn = async (req, res) => {
  try {
    const { descriptor, latitude, longitude, type } = req.body; // type: 'clock-in' | 'clock-out'

    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ success: false, message: 'Face descriptor required' });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location required' });
    }

    // 1. Check company location
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (settings?.office_lat && settings?.office_lng) {
      const distance = getDistance(latitude, longitude, settings.office_lat, settings.office_lng);
      const allowedRadius = settings.allowed_radius_meters || 200;
      if (distance > allowedRadius) {
        return res.status(403).json({
          success: false,
          message: `You are ${Math.round(distance)}m away from office. Must be within ${allowedRadius}m.`
        });
      }
    }

    // 2. Verify face descriptor matches stored one
    const user = await User.findById(req.user.id);
    if (!user.face_descriptor) {
      return res.status(400).json({ success: false, message: 'No face registered. Please register your face first.' });
    }

    const stored = JSON.parse(user.face_descriptor);
    const incoming = descriptor;

    // Euclidean distance between descriptors (threshold 0.6)
    const euclidean = Math.sqrt(
      stored.reduce((sum, val, i) => sum + (val - incoming[i]) ** 2, 0)
    );

    if (euclidean > 0.6) {
      return res.status(401).json({ success: false, message: 'Face not recognized. Please try again.' });
    }

    // 3. Clock in / out
    const now = new Date();
    // Format as local datetime string (YYYY-MM-DDTHH:mm:ss) so Supabase
    // TIMESTAMP WITHOUT TIME ZONE stores the actual wall-clock time
    const pad = n => String(n).padStart(2, '0');
    const localISO = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const today = localISO.split('T')[0];

    if (type === 'clock-out') {
      const record = await Attendance.findOne({ employee_id: req.user.id, date: today });
      if (!record) return res.status(400).json({ success: false, message: 'No clock-in found for today' });
      if (record.clock_out) return res.status(400).json({ success: false, message: 'Already clocked out today' });

      const clockInTime = new Date(record.clock_in);
      const workHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      // Half-day: worked less than 7.5h OR clocked in after 09:00
      const clockInHour = clockInTime.getHours() + clockInTime.getMinutes() / 60;
      const isHalfDay = workHours < 7.5 || clockInHour > 9.0;

      const updated = await Attendance.update(record.id, {
        clock_out: localISO,
        work_hours: Math.round(workHours * 100) / 100,
        status: isHalfDay ? 'half-day' : 'present'
      });
      return res.json({ success: true, message: 'Clocked out successfully', data: updated });
    } else {
      const existing = await Attendance.findOne({ employee_id: req.user.id, date: today });
      if (existing) return res.status(400).json({ success: false, message: 'Already clocked in today' });

      const attendance = await Attendance.create({
        employee_id: req.user.id,
        date: today,
        clock_in: localISO,
        status: 'present',
        work_hours: null
      });
      return res.status(201).json({ success: true, message: 'Clocked in successfully', data: attendance });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/face-attendance/company-location (public — employee needs it before auth clock-in)
exports.getCompanyLocation = async (req, res) => {
  try {
    const { data, error } = await supabase.from('company_settings').select('office_lat,office_lng,allowed_radius_meters,office_name').single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/face-attendance/company-location (admin only)
exports.setCompanyLocation = async (req, res) => {
  try {
    const { office_lat, office_lng, allowed_radius_meters, office_name } = req.body;

    const { data: existing } = await supabase.from('company_settings').select('id').single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('company_settings')
        .update({ office_lat, office_lng, allowed_radius_meters, office_name, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert([{ office_lat, office_lng, allowed_radius_meters, office_name }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json({ success: true, message: 'Company location saved', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
