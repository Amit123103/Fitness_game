import type { Request, Response } from 'express';
import { supabase } from '../config/db.js';
import type { PlayerStats } from '../services/difficultyEngine.js';
import { calculateDifficulty } from '../services/difficultyEngine.js';

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', userId)
      .maybeSingle();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name || 'Awakened User',
      bio: user.bio || '',
      stats: {
        strength: user.strength ?? 10,
        stamina: user.stamina ?? 10,
        speed: user.speed ?? 10,
        defense: user.defense ?? 10,
        level: user.level ?? 1,
        xp: user.xp ?? 0,
        mana: user.mana ?? 100,
        maxMana: user.maxMana ?? 100
      },
      coins: user.coins ?? 100,
      skillPoints: user.skillPoints ?? 0,
      unlockedSkills: user.unlockedSkills || [],
      shadowArmy: user.shadowArmy || [],
      rank: user.rank || 'E',
      currentTitle: user.currentTitle || 'THE AWAKENED'
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
    const finalData = { ...updateData };
    if (updateData.stats) {
      const stats = updateData.stats;
      delete finalData.stats;
      Object.assign(finalData, stats);
    }

    const { error } = await supabase
      .from('users')
      .update(finalData)
      .eq('uid', userId);

    if (error) {
      console.error('Supabase update stats error:', error);
    }

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
