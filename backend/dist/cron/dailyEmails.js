import cron from 'node-cron';
import { supabase } from '../config/db.js';
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
            const { data: users, error } = await supabase.from('users').select('email');
            if (error || !users)
                return;
            const todayQuestion = DAILY_QUESTIONS[Math.floor(Math.random() * DAILY_QUESTIONS.length)];
            for (const user of users) {
                if (user.email) {
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