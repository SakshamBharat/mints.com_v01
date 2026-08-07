const nodemailer = require("nodemailer");
const dns = require("dns");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },

  // Force IPv4 (fixes ENETUNREACH IPv6 errors)
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

async function verifyEmailServer() {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection ready");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
  }
}

verifyEmailServer();


async function sendOTP(email, otp) {
  try {
    console.log("Starting sendOTP");

    const result = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",

      html: `
        <div style="font-family:Arial">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("✅ OTP Email Sent:", result.messageId);

    return result;

  } catch (error) {
    console.error("❌ OTP EMAIL ERROR:", error);
    throw error;
  }
}


module.exports = {
  sendOTP,
};
