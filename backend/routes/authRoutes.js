const express = require('express');
const router = express.Router();
const { 
  login, 
  sendOtp, 
  verifyOtpAndRegister 
} = require('../controllers/authController');

router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-register', verifyOtpAndRegister);

module.exports = router;