import { Router } from 'express';
import { getProfile, updateStats, getDifficulty } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.post('/stats/update', verifyToken, updateStats);

// Adaptive Difficulty endpoint
router.post('/ai/difficulty', getDifficulty);

export default router;
