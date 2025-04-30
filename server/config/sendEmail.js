// server/config/sendEmail.js
require('dotenv').config();

const nodemailer = require('nodemailer');

console.log("GMAIL_EMAIL_USER:", process.env.GMAIL_EMAIL_USER);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GMAIL_REFRESH_TOKEN:", process.env.GMAIL_REFRESH_TOKEN);

const sendReminderEmail = async (to, plantName, careTask) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_EMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_EMAIL_USER,
        to,
        subject: `Pengingat Perawatan Tanaman: ${plantName}`,
        text: `Jangan lupa untuk ${careTask} tanaman ${plantName} Anda hari ini!`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        if (error.message.includes("invalid_grant")) {
            console.error("Refresh Token invalid. Please generate a new refresh token using OAuth 2.0 Playground.");
            throw new Error("Refresh Token invalid. Please update GMAIL_REFRESH_TOKEN in .env with a new token.");
        }
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendReminderEmail };