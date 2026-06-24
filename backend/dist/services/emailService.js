import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Configure the email transport using SMTP (You will need to provide valid credentials in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Assuming Gmail for now, configurable via env vars
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
    },
});
export const sendGreetingEmail = async (to, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to,
        subject: 'Welcome to the Fitness Game App! 🚀',
        html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h1 style="color: #6C3CE1;">Welcome, ${username}!</h1>
        <p>Thank you for joining our Fitness Game community.</p>
        <p>We are thrilled to have you onboard! Get ready to level up your fitness journey.</p>
        <br />
        <p>Stay active, stay healthy!</p>
        <p><strong>The Fitness Game Team</strong></p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Greeting email sent to ${to}`);
    }
    catch (error) {
        console.error('Error sending greeting email:', error);
    }
};
export const sendDailyQuestionEmail = async (to, question) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to,
        subject: 'Your Daily Fitness Quest 🎯',
        html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2 style="color: #FF5722;">Time for your Daily Quest!</h2>
        <p style="font-size: 18px; font-weight: bold;">${question}</p>
        <p>Open the app to log your progress and earn rewards!</p>
        <br />
        <p>Keep up the great work!</p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Daily question email sent to ${to}`);
    }
    catch (error) {
        console.error('Error sending daily question email:', error);
    }
};
//# sourceMappingURL=emailService.js.map