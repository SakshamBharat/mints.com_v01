// config/sendotp.js

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false for 587 (STARTTLS)

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },

    // Force IPv4 connection
    family: 4,

    tls: {
        rejectUnauthorized: true,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});


// Check SMTP connection
async function verifyEmailServer() {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection ready");
    } catch (error) {
        console.error("❌ SMTP connection failed:", error.message);
    }
}


// Send OTP email
async function sendOTP(email, otp) {
    try {
        console.log("Starting sendOTP");


        const mailOptions = {
            from: `"Mints App" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your OTP Verification Code",

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>Email Verification</h2>

                    <p>Your OTP verification code is:</p>

                    <h1 style="
                        color:#2563eb;
                        letter-spacing:5px;
                    ">
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in 5 minutes.
                    </p>

                    <p>
                        If you did not request this code,
                        please ignore this email.
                    </p>

                </div>
            `,
        };


        const result = await transporter.sendMail(mailOptions);


        console.log(
            "✅ OTP Email Sent:",
            result.messageId
        );


        return result;


    } catch (error) {

        console.error(
            "❌ OTP EMAIL ERROR:",
            error
        );

        throw error;
    }
}


// Run SMTP test when server starts
verifyEmailServer();


module.exports = {
    sendOTP,
    transporter
};
