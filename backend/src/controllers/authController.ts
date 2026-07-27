import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendGreetingEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

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
    };

    const { error: insertError } = await supabase.from('users').insert([userData]);
    if (insertError) {
      console.error('Supabase user insert warning/error:', insertError);
    }

    const token = jwt.sign({ uid: userId, email }, JWT_SECRET, { expiresIn: '7d' });
    
    sendGreetingEmail(email, email.split('@')[0]).catch(console.error);

    res.status(201).json({ token, user: { uid: userId, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const supabaseLogin = async (req: Request, res: Response) => {
  const { email, uid: supabaseUid } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    let user = existingUser;

    if (!user) {
      user = {
        uid: supabaseUid || uuidv4(),
        email,
        password: await bcrypt.hash(uuidv4(), 10),
        strength: 10,
        stamina: 10,
        speed: 10,
        defense: 10,
        level: 1,
        xp: 0,
        coins: 100,
      };

      await supabase.from('users').insert([user]);
      sendGreetingEmail(user.email, user.email.split('@')[0]).catch(console.error);
    }

    const token = jwt.sign({ uid: user?.uid, email: user?.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { uid: user?.uid, email: user?.email } });
  } catch (error) {
    console.error('Supabase Login error:', error);
    res.status(500).json({ error: 'Failed to sync Supabase user' });
  }
};

export const firebaseLogin = supabaseLogin;
