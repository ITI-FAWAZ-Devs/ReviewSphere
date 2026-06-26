import { Router } from 'express';
import passport from '../middleware/passport.js';
import { signToken } from '../lib/jwt.js';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = signToken({ sub: user.id, role: user.role });
    res.redirect(`${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user as any;
    const jwtToken = signToken({ sub: user.id, role: user.role });
    res.redirect(`${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}/auth/callback?token=${jwtToken}`);
  }
);

export default router;
