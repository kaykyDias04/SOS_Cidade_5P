import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/env';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  
  const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
};
