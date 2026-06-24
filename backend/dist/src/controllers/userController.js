import { prisma } from '../config/db.js';
import { calculateDifficulty } from '../services/difficultyEngine.js';
export const getProfile = async (req, res) => {
    const userId = req.user.uid;
    try {
        const user = await prisma.user.findUnique({
            where: { uid: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Map back to the expected format if necessary
        const profile = {
            uid: user.uid,
            email: user.email,
            stats: {
                strength: user.strength,
                stamina: user.stamina,
                speed: user.speed,
                defense: user.defense,
                level: user.level,
                xp: user.xp
            },
            coins: user.coins
        };
        res.json(profile);
    }
    catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
export const updateStats = async (req, res) => {
    const userId = req.user.uid;
    const newStats = req.body;
    try {
        await prisma.user.update({
            where: { uid: userId },
            data: newStats
        });
        res.json({ message: 'Stats updated successfully' });
    }
    catch (error) {
        console.error('Update stats error:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
};
export const getDifficulty = async (req, res) => {
    const playerStats = req.body.stats;
    const difficulty = calculateDifficulty(playerStats, []);
    res.json(difficulty);
};
//# sourceMappingURL=userController.js.map