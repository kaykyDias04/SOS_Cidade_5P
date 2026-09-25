import { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!roles.includes(user?.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    next();
  };
};