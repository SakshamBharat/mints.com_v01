const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
});

const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Saksham Bharat" <${process.env.BREVO_SENDER_EMAIL}>`,
            to: email,
            subject: "Your OTP Verification Code",
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
            `
        });

        console.log("✅ OTP sent successfully to:", email);
    } catch (error) {
        console.error("❌ OTP Sending Failed:", error);
        throw error;
    }
};

module.exports = sendOTP;
