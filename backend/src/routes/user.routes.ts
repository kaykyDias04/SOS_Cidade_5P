import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();
const userController = new UserController();

router.post('/', userController.create.bind(userController));
router.get('/', authenticate, authorize('GESTOR'), userController.getAll.bind(userController));
router.delete('/:id', authenticate, authorize('GESTOR'), userController.delete.bind(userController));

export default router;
