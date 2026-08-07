const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },

    family: 4,

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
});


async function verifyEmailServer() {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection ready");
    } catch (error) {
        console.error("❌ SMTP connection failed:", error);
    }
}


async function sendOTP(email, otp) {
    try {

        const info = await transporter.sendMail({
            from: `"Mints App" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your OTP Verification Code",

            html: `
                <h2>Email Verification</h2>
                <h1>${otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
            `,
        });


        console.log("✅ OTP sent:", info.messageId);

        return info;

    } catch(error) {

        console.error("❌ OTP EMAIL ERROR:", error);
        throw error;

    }
}


verifyEmailServer();


module.exports = {
    sendOTP,
    transporter
};
