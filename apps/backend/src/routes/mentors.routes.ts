import { Router } from 'express';
import { listMentors, getMentor, getMentorAvailability, updateMentorAvailability } from '../controllers/mentors.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Public — no auth required
router.get('/', listMentors);
router.get('/:id', getMentor);

// Protected — require authentication
router.get('/:id/availability', authenticate, getMentorAvailability);
router.put('/:id/availability', authenticate, authorize('MENTOR'), updateMentorAvailability);

export default router;
