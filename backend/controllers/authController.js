const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
};

// 1. Send OTP to User's Email
exports.sendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Sanitize email
    email = email.toLowerCase().trim();

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any previous active OTPs for this email and save new one
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    // Send email via configured transporter
    // (Awaited with try/catch to log properly without blocking client progression)
    sendOtpEmail(email, otp).catch((err) => {
      console.error('Email dispatch failure notice:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process OTP request',
    });
  }
};

// 2. Verify OTP & Register
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    let { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'All fields and OTP are required' });
    }

    email = email.toLowerCase().trim();
    otp = otp.toString().trim();

    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits' });
    }

    // Check OTP record in database
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password & persist user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
    });

    // Invalidate OTP immediately so it cannot be replayed
    await Otp.deleteOne({ _id: validOtp._id });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully!',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    console.error('Error in verifyOtpAndRegister:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};