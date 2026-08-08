const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.one.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});

async function sendOTP(email, otp) {
    try {
        console.log("Sending OTP to:", email);

        const result = await transporter.sendMail({
            from: `"Mints App" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your OTP Verification Code",

            html: `
                <div style="font-family: Arial;">
                    <h2>Email Verification</h2>
                    <p>Your OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP expires in 5 minutes.</p>
                </div>
            `
        });

        console.log("✅ OTP Sent:", result.messageId);

        return result;

    } catch (error) {
        console.error("❌ OTP Sending Failed:", error);
        throw error;
    }
}

module.exports = {
    sendOTP,
    transporter
};
