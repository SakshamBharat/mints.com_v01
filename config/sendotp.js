const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const sendOTP = async (email, otp) => {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: "Your App",
            email: process.env.EMAIL
        };

        sendSmtpEmail.to = [
            {
                email: email
            }
        ];

        sendSmtpEmail.subject = "Your OTP Verification Code";

        sendSmtpEmail.htmlContent = `
            <h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("OTP email sent successfully");

    } catch (error) {
        console.error("Brevo API email error:", error);
        throw error;
    }
};

module.exports = sendOTP;
