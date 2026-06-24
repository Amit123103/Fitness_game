import type { Request, Response } from 'express';
import { db } from '../config/db.js';
import type { PlayerStats } from '../services/difficultyEngine.js';
import { calculateDifficulty } from '../services/difficultyEngine.js';

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('uid', '==', userId).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = snapshot.docs[0]?.data();
    if (!user) {
      return res.status(404).json({ error: 'User data is missing' });
    }

    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      bio: user.bio,
      stats: {
        strength: user.strength,
        stamina: user.stamina,
        speed: user.speed,
        defense: user.defense,
        level: user.level,
        xp: user.xp,
        mana: user.mana,
        maxMana: user.maxMana
      },
      coins: user.coins,
      skillPoints: user.skillPoints,
      unlockedSkills: user.unlockedSkills,
      shadowArmy: user.shadowArmy,
      rank: user.rank,
      currentTitle: user.currentTitle
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  const updateData = req.body;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('uid', '==', userId).limit(1).get();

    if (snapshot.empty || !snapshot.docs[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDocRef = snapshot.docs[0].ref;

    // Basic stats mapping if they come in nested 'stats' object
    const finalData = { ...updateData };
    if (updateData.stats) {
      const stats = updateData.stats;
      delete finalData.stats;
      Object.assign(finalData, stats);
    }

    await userDocRef.update(finalData);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Failed to update health/stats' });
  }
};

export const getDifficulty = async (req: Request, res: Response) => {
  const playerStats: PlayerStats = req.body.stats;
  const difficulty = calculateDifficulty(playerStats, []);
  res.json(difficulty);
};
