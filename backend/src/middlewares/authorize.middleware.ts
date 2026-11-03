import { Request, Response, NextFunction } from 'express';

export const authorize = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user?.role !== role) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  next();
};