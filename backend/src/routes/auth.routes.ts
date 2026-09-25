import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: {
		success: false,
		error: 'Muitas tentativas de login. Tente novamente mais tarde.',
	},
});

router.post('/login', loginLimiter, authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
