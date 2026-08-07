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


    // Force IPv4 DNS lookup
    lookup: (hostname, options, callback) => {

        dns.resolve4(hostname, (err, addresses) => {

            if (err) {
                return callback(err);
            }

            callback(null, addresses[0], 4);

        });

    },


    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,

});



async function verifyEmailServer() {

    try {

        await transporter.verify();

        console.log("✅ SMTP connection ready");

    } catch(error) {

        console.error(
            "❌ SMTP connection failed:",
            error.message
        );

    }

}



async function sendOTP(email, otp) {

    try {


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



        console.log(
            "✅ OTP Email Sent:",
            result.messageId
        );


        return result;


    } catch(error) {


        console.error(
            "❌ OTP EMAIL ERROR:",
            error
        );


        throw error;

    }

}



verifyEmailServer();



module.exports = {
    sendOTP,
    transporter
};const nodemailer = require("nodemailer");
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
