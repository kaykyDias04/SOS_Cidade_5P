import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
const userController = new UserController();

router.post('/', userController.create.bind(userController));
router.get('/', authenticate, requireRole('GESTOR'), userController.getAll.bind(userController));
router.delete('/:id', authenticate, requireRole('GESTOR'), userController.delete.bind(userController));

export default router;
