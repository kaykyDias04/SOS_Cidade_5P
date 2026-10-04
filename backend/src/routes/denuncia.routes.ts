import { Router } from 'express';
import { DenunciaController } from '../controllers/denuncia.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();
const denunciaController = new DenunciaController();

router.use(authenticate);

router.get('/', authorize('GESTOR'), denunciaController.list.bind(denunciaController));
router.get('/minhas', denunciaController.getMinhasDenuncias.bind(denunciaController));
router.get('/:id', denunciaController.getById.bind(denunciaController));
router.post('/', denunciaController.create.bind(denunciaController));
router.patch('/:id', authorize('GESTOR'), denunciaController.update.bind(denunciaController));
router.delete('/:id', authorize('GESTOR'), denunciaController.delete.bind(denunciaController));

export default router;
