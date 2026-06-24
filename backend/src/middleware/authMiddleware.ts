import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // If "test-token" is used during development
  if (token === 'test-token') {
    (req as any).user = { uid: 'test-user-123', email: 'test@example.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying JWT:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
