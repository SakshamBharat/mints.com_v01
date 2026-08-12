const { BrevoClient } = require("@getbrevo/brevo");
require("dotenv").config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendOTP = async (email, otp) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "Your App",
                email: process.env.EMAIL,
            },

            to: [
                {
                    email: email,
                },
            ],

            subject: "Your OTP Verification Code",

            htmlContent: `
                <h2>Email Verification</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 5 minutes.</p>
            `,
        });

        console.log("OTP email sent successfully");

    } catch (error) {
        console.error("Brevo email error:", error);
        throw error;
    }
};

module.exports = sendOTP;
