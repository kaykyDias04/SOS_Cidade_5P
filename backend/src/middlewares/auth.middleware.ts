import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/env';
import { isTokenRevoked } from '../lib/tokenRevocation';
import jwt from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  
  const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (
      typeof decoded !== 'string' &&
      typeof decoded.jti === 'string' &&
      await isTokenRevoked(decoded.jti)
    ) {
      res.status(401).json({ success: false, error: 'Forbidden' });
      return;
    }
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Forbidden' });
  }
};
