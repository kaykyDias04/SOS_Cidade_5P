import { Router } from 'express';
import { DenunciaController } from '../controllers/denuncia.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema } from '../schemas/common';
import { createDenunciaSchema, updateDenunciaSchema } from '../schemas/denuncia.schema';

const router = Router();
const denunciaController = new DenunciaController();

router.use(authenticate);

router.get('/', authorize('GESTOR'), denunciaController.list.bind(denunciaController));
router.get('/minhas', denunciaController.getMinhasDenuncias.bind(denunciaController));
router.get('/:id', validate(idParamSchema, 'params'), denunciaController.getById.bind(denunciaController));
router.post('/', validate(createDenunciaSchema, 'body'), denunciaController.create.bind(denunciaController));
router.patch(
  '/:id',
  authorize('GESTOR'),
  validate(idParamSchema, 'params'),
  validate(updateDenunciaSchema, 'body'),
  denunciaController.update.bind(denunciaController),
);
router.delete(
  '/:id',
  authorize('GESTOR'),
  validate(idParamSchema, 'params'),
  denunciaController.delete.bind(denunciaController),
);

export default router;
