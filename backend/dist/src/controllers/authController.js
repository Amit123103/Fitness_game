import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
export const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const user = await prisma.user.create({
            data: {
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
            },
        });
        const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { uid: user.uid, email: user.email } });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
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
//# sourceMappingURL=authController.js.map