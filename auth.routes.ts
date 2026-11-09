import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

// Limite por IP no login (o bloqueio por conta, mais importante, fica em lib/loginAttempts).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
  },
});

router.post('/login', loginLimiter, validate(loginSchema, 'body'), authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
