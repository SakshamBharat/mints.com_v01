const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.one.com",
    port: 587,
    secure: false, // STARTTLS

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },

    connectionTimeout: 50000,
    greetingTimeout: 50000,
    socketTimeout: 50000
});

// Test SMTP
async function verifyEmailServer() {
    try {
        await transporter.verify();
        console.log("✅ One.com SMTP Connected");
    } catch (error) {
        console.log("❌ SMTP ERROR:", error.message);
        console.log("Code:", error.code);
    }
}

verifyEmailServer();

// Send OTP
async function sendOTP(email, otp) {
    try {
        console.log("Sending OTP to:", email);

        const result = await transporter.sendMail({
            from: `"Mints App" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your OTP Verification Code",

            html: `
                <div style="font-family:Arial">
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
        console.log("❌ OTP Sending Failed:", error.message);
        console.log("Code:", error.code);

        throw error;
    }
}

module.exports = {
    sendOTP,
    transporter
};
        console.log(
            "✅ OTP Sent:",
            result.messageId
        );


        return result;


    }catch(error){

        console.log(
            "❌ OTP Sending Failed:",
            error.message
        );


        throw error;

    }

}



module.exports = {
    sendOTP,
    transporter
};
