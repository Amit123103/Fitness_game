import cron from 'node-cron';
import { db } from '../config/db.js';
import { sendDailyQuestionEmail } from '../services/emailService.js';
const DAILY_QUESTIONS = [
    "Did you complete your 10,000 steps today?",
    "How many glasses of water have you had so far?",
    "Ready for a quick 5-minute stretch?",
    "Have you hit your protein goals today?",
    "Time for your daily workout! Let's get moving."
];
// Run the job every day at 09:00 AM server time
export const startDailyEmailCron = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily email cron job...');
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.get();
            const todayQuestion = DAILY_QUESTIONS[Math.floor(Math.random() * DAILY_QUESTIONS.length)];
            for (const doc of snapshot.docs) {
                const user = doc.data();
                if (user.email) {
                    // Send email sequentially, in production we might want a message queue
                    await sendDailyQuestionEmail(user.email, todayQuestion);
                }
            }
            console.log('Daily emails sent successfully.');
        }
        catch (error) {
            console.error('Failed to run daily email cron:', error);
        }
    });
};
//# sourceMappingURL=dailyEmails.js.map