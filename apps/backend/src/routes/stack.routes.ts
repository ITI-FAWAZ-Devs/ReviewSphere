import { Router } from 'express';
import { listStacks, createStack, updateStack, deleteStack } from '../controllers/stack.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

const adminOnly = [authenticate, authorize('ADMIN')];

// Public: anyone can list stacks (needed for mentor signup)
router.get('/', listStacks);
// Admin-only mutations
router.post('/', ...adminOnly, createStack);
router.put('/:id', ...adminOnly, updateStack);
router.delete('/:id', ...adminOnly, deleteStack);

export default router;
