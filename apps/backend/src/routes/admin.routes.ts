import { Router } from 'express';
import { listUsers, updateUserStatus, updateUserRole } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Require admin access on all routes
router.use(authenticate, authorize('ADMIN'));

router.get('/users', listUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

export default router;
