import { Request, Response } from 'express';
import { JWT_SECRET } from '../config/env';
import { revokeToken } from '../lib/tokenRevocation';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      
      
      
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000, 
      });

      res.json({ user, token });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    const bearerToken = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    const token = req.cookies?.authToken || bearerToken;

    if (token) {
      let payload: jwt.JwtPayload | undefined;
      try {
        const decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: ['HS256'],
          ignoreExpiration: true,
        });
        if (typeof decoded !== 'string') payload = decoded;
      } catch {
        // Invalid tokens are ignored so logout can still complete.
      }

      if (typeof payload?.jti === 'string' && typeof payload.exp === 'number') {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) await revokeToken(payload.jti, ttl);
      }
    }

    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ success: true });
  }
}
