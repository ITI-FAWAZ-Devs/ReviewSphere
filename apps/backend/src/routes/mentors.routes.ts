import { Router } from 'express';
import { listMentors, getMentor } from '../controllers/mentors.controller.js';

const router = Router();

// Public — no auth required
router.get('/', listMentors);
router.get('/:id', getMentor);

export default router;
