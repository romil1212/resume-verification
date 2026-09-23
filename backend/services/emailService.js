require('dotenv').config();
const nodemailer = require('nodemailer');

// Initialize Elastic Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.ELASTIC_HOST || 'smtp.elasticemail.com',
  port: Number(process.env.ELASTIC_PORT) || 2525,
  secure: false, // Port 2525 and 587 connect via STARTTLS
  auth: {
    user: process.env.ELASTIC_USER,
    pass: process.env.ELASTIC_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  // Always output the active code directly to your backend console
  console.log('\n=========================================');
  console.log(`🔐 OTP CODE SENT TO: ${toEmail}`);
  console.log(`👉👉  ${otp}  👈👈`);
  console.log('=========================================\n');

  try {
    const sender = process.env.ELASTIC_USER || 'no-reply@resumeverify.com';

    const mailOptions = {
      from: `"ResumeVerify Security" <${sender}>`,
      to: toEmail,
      subject: `${otp} is your verification code - ResumeVerify`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 8px;">Verify Your Email Address</h2>
          <p style="text-align: center; color: #64748b; font-size: 14px;">Use the verification code below to complete your registration on ResumeVerify:</p>
          <div style="background-color: #f1f5f9; border: 2px dashed #0284c7; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code will expire in 5 minutes. If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Real OTP email delivered to inbox! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Elastic Email delivery notice:', error.message);
    // Non-blocking catch ensures the frontend registration flow still proceeds
    return false;
  }
};

module.exports = { sendOtpEmail };