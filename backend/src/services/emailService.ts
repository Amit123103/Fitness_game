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

export const sendGreetingEmail = async (to: string, username: string) => {
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
  } catch (error) {
    console.error('Error sending greeting email:', error);
  }
};

export const sendDailyQuestionEmail = async (to: string, question: string) => {
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
  } catch (error) {
    console.error('Error sending daily question email:', error);
  }
};

export const sendApkBuildEmail = async (to: string, buildUrl: string, apkUrl?: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to,
    subject: 'Rise of the Warrior - Your Android APK Build is Ready! ⚔️',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #13141C; color: #FFF; padding: 25px; border-radius: 10px;">
        <h1 style="color: #00F0FF; text-align: center;">RISE OF THE WARRIOR</h1>
        <h2 style="color: #FFF; text-align: center;">Android APK Build Notification</h2>
        <p style="font-size: 16px; text-align: center; color: #A0A0B0;">
          Your standalone Android APK build has been initiated on Expo EAS Cloud.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${apkUrl || buildUrl}" style="background-color: #00F0FF; color: #13141C; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">
            ${apkUrl ? 'Download Standalone APK' : 'View Live Build Progress & Download APK'}
          </a>
        </div>
        <p style="font-size: 14px; color: #A0A0B0; text-align: center;">
          Build Dashboard Link: <a href="${buildUrl}" style="color: #00F0FF;">${buildUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Fitness Game Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Build email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending build email:', error);
    return false;
  }
};
