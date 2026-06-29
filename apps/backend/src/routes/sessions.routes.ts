import { Router } from 'express';
import { bookSession, getUserSessions, updateSessionStatus, submitFeedback, getSessionAudit, getSessionMeetLink } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, getUserSessions);
router.post('/book', authenticate, authorize('STUDENT'), bookSession);
router.put('/:id/status', authenticate, updateSessionStatus);
router.patch('/:id/status', authenticate, updateSessionStatus);
router.post('/:id/feedback', authenticate, submitFeedback);
router.get('/:id/audit', authenticate, getSessionAudit);
router.get('/:id/meet-link', authenticate, getSessionMeetLink);

export default router;
