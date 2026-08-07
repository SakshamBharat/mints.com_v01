const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTP = async (email, otp) => {
  try {
    console.log("EMAIL:", process.env.EMAIL);
    console.log("PASSWORD EXISTS:", !!process.env.EMAIL_PASSWORD);

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("OTP EMAIL SENT:", info.messageId);

    return info;
  } catch (error) {
    console.error("OTP EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = { sendOTP, transporter };
