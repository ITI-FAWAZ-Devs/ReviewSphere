import { Router } from 'express';
import { listStacks, createStack, updateStack, deleteStack } from '../controllers/stack.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

const adminOnly = [authenticate, authorize('ADMIN')];

router.get('/', ...adminOnly, listStacks);
router.post('/', ...adminOnly, createStack);
router.put('/:id', ...adminOnly, updateStack);
router.delete('/:id', ...adminOnly, deleteStack);

export default router;
