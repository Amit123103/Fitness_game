import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendGreetingEmail } from '../services/emailService.js';
import { saveUserToMemory, getUserFromMemory } from '../services/userStore.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
export const signup = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        let existingUser = getUserFromMemory(email);
        if (!existingUser) {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .maybeSingle();
                if (data)
                    existingUser = data;
            }
            catch (err) {
                console.log('Supabase check existing user warning:', err);
            }
        }
        if (existingUser) {
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
            skillPoints: 5,
            unlockedSkills: [],
            shadowArmy: [],
            rank: 'E',
            currentTitle: 'THE AWAKENED',
            mana: 100,
            maxMana: 100,
        };
        saveUserToMemory(userData);
        try {
            await supabase.from('users').insert([userData]);
        }
        catch (insertErr) {
            console.log('Supabase user insert warning (using fallback memory store):', insertErr);
        }
        const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '7d' });
        if (email) {
            const username = email.split('@')[0] || 'User';
            sendGreetingEmail(email, username).catch(console.error);
        }
        res.status(201).json({ token, user: { uid: userId, email } });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        let user = getUserFromMemory(email);
        if (!user) {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .maybeSingle();
                if (data) {
                    user = data;
                    saveUserToMemory(data);
                }
            }
            catch (err) {
                console.log('Supabase fetch user warning:', err);
            }
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { uid: user.uid, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
export const supabaseLogin = async (req, res) => {
    const { email, uid: supabaseUid } = req.body;
    const targetEmail = email || 'test@example.com';
    const targetUid = supabaseUid || 'test-user-123';
    try {
        let user = getUserFromMemory(targetEmail) || getUserFromMemory(targetUid);
        if (!user) {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', targetEmail)
                    .maybeSingle();
                if (data)
                    user = data;
            }
            catch (err) {
                console.log('Supabase login check warning:', err);
            }
        }
        if (!user) {
            const newUser = {
                uid: targetUid,
                email: targetEmail,
                password: await bcrypt.hash(uuidv4(), 10),
                strength: 10,
                stamina: 10,
                speed: 10,
                defense: 10,
                level: 1,
                xp: 0,
                coins: 100,
                skillPoints: 5,
                unlockedSkills: [],
                shadowArmy: [],
                rank: 'E',
                currentTitle: 'THE AWAKENED',
                mana: 100,
                maxMana: 100,
            };
            saveUserToMemory(newUser);
            user = newUser;
            try {
                await supabase.from('users').insert([user]);
            }
            catch (insertErr) {
                console.log('Supabase user insert warning:', insertErr);
            }
            if (user.email) {
                const username = user.email.split('@')[0] || 'User';
                sendGreetingEmail(user.email, username).catch(console.error);
            }
        }
        else {
            saveUserToMemory(user);
        }
        const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { uid: user.uid, email: user.email } });
    }
    catch (error) {
        console.error('Supabase Login error:', error);
        res.status(500).json({ error: 'Failed to sync Supabase user' });
    }
};
export const firebaseLogin = supabaseLogin;
//# sourceMappingURL=authController.js.map