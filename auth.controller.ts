import { Request, Response } from 'express';
import { AuthService, MENSAGEM_CREDENCIAIS_INVALIDAS } from '../services/auth.service';

export const MENSAGEM_MUITAS_TENTATIVAS = 'Muitas tentativas. Tente novamente em alguns minutos.';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body ?? {};
      const { user, token } = await this.authService.login(email, password);

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ user, token });
    } catch (error: any) {
      if (error?.code === 'LOGIN_LOCKED') {
        res.set('Retry-After', String(Math.max(1, Math.ceil(error.retryAfterSeconds ?? 1))));
        return res.status(429).json({ success: false, error: MENSAGEM_MUITAS_TENTATIVAS });
      }

      // Mensagem única: igual para usuário inexistente, senha errada e qualquer outra falha.
      // O log não leva e-mail, senha nem token.
      if (error?.message !== MENSAGEM_CREDENCIAIS_INVALIDAS) {
        console.error('[AuthController] falha inesperada no login:', error?.name ?? 'Error', error?.code ?? '');
      }
      res.status(401).json({ success: false, error: MENSAGEM_CREDENCIAIS_INVALIDAS });
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
