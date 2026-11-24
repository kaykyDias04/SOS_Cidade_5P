import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password, acceptedTerms, acceptedPrivacy } = req.body;
      const { user, token } = await this.authService.login(
        email,
        password,
        acceptedTerms,
        acceptedPrivacy,
      );
      
      
      
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000, 
      });

      res.json({ user, token });
    } catch (error: any) {
      if (error.code === 'LEGAL_CONSENT_REQUIRED') {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ success: true });
  }
}
