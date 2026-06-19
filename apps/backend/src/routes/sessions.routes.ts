import { Router } from 'express';
import { bookSession, getUserSessions, updateSessionStatus } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, getUserSessions);
router.post('/book', authenticate, authorize('STUDENT'), bookSession);
router.patch('/:id/status', authenticate, updateSessionStatus);

export default router;
