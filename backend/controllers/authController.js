const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department_id, position, phone, address } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const employee_id = 'EMP' + Date.now().toString().slice(-6);
    
    const user = await User.create({
      name, email, password, role, employee_id, department_id, position, phone, address,
      status: role === 'admin' ? 'active' : 'pending'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findByEmail(email);

    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active. Please contact admin.' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        department: user.departments,
        position: user.position
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user || user.role !== 'employee') {
      // Always return success to avoid email enumeration
      return res.json({ success: true, message: 'If that email exists, a reset code was sent.' });
    }
    // Generate a 6-digit OTP and store it with expiry (10 min)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await User.update(user.id, { reset_otp: otp, reset_otp_expiry: expiry });
    // In production send via email; for now return in response (dev only)
    console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);
    res.json({ success: true, message: 'Reset code sent to your email.', dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findByEmail(email);
    if (!user || user.reset_otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
    }
    if (new Date() > new Date(user.reset_otp_expiry)) {
      return res.status(400).json({ success: false, message: 'Reset code has expired.' });
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateRaw(user.id, { password: hashed, reset_otp: null, reset_otp_expiry: null });
    res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
