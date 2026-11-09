import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema } from '../schemas/common';
import { createUserSchema } from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

router.post('/', validate(createUserSchema, 'body'), userController.create.bind(userController));
router.get('/', authenticate, authorize('GESTOR'), userController.getAll.bind(userController));
router.delete(
  '/:id',
  authenticate,
  authorize('GESTOR'),
  validate(idParamSchema, 'params'),
  userController.delete.bind(userController),
);

export default router;
