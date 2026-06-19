import { Router } from 'express';
import { bookSession } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/book', authenticate, authorize('STUDENT'), bookSession);

export default router;
