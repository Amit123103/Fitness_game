import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendGreetingEmail } from '../services/emailService.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
export const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const userData = {
            uid: userId,
            email,
            password: hashedPassword,
            strength: 10,
            stamina: 10,
            speed: 10,
            defense: 10,
            level: 1,
            xp: 0,
            coins: 100,
        };
        await userRef.set(userData);
        const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '7d' });
        // Send welcome greeting email asynchronously
        sendGreetingEmail(email, email.split('@')[0]).catch(console.error);
        res.status(201).json({ token, user: { uid: userId, email } });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();
        const user = userDoc.data();
        if (!userDoc.exists || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { uid: user.uid, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
export const firebaseLogin = async (req, res) => {
    const { email, uid: firebaseUid } = req.body;
    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();
        let user = userDoc.data();
        if (!userDoc.exists) {
            // Create user if they don't exist in our DB but authenticated via Firebase (e.g. Google Login)
            user = {
                uid: firebaseUid || uuidv4(),
                email,
                password: await bcrypt.hash(uuidv4(), 10), // Random password since Firebase handles auth
                strength: 10,
                stamina: 10,
                speed: 10,
                defense: 10,
                level: 1,
                xp: 0,
                coins: 100,
            };
            await userRef.set(user);
            // Send welcome greeting email asynchronously for new Google Login users
            sendGreetingEmail(user.email, user.email.split('@')[0]).catch(console.error);
        }
        const token = jwt.sign({ uid: user?.uid, email: user?.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { uid: user?.uid, email: user?.email } });
    }
    catch (error) {
        console.error('Firebase Login error:', error);
        res.status(500).json({ error: 'Failed to sync Firebase user' });
    }
};
//# sourceMappingURL=authController.js.map