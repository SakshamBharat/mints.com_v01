// config/sendotp.js

const nodemailer = require("nodemailer");
const dns = require("dns");

require("dotenv").config();


// Force IPv4 on Render
dns.setDefaultResultOrder("ipv4first");


const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false, // STARTTLS

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },


    tls: {
        rejectUnauthorized: false
    },


    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000

});



// Test SMTP
async function verifyEmailServer(){

    try{

        await transporter.verify();

        console.log("✅ Gmail SMTP Connected");

    }catch(error){

        console.log(
            "❌ SMTP ERROR:",
            error.message
        );

    }

}


verifyEmailServer();




// Send OTP
async function sendOTP(email, otp){

    try{


        console.log(
            "Sending OTP to:",
            email
        );


        const result = await transporter.sendMail({

            from: `"Mints App" <${process.env.EMAIL}>`,

            to: email,

            subject: "Your OTP Verification Code",


            html: `

            <div style="font-family:Arial">

                <h2>Email Verification</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    This OTP expires in 5 minutes.
                </p>

            </div>

            `

        });


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
