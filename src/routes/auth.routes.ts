import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { login, logout, verify2FA, getMe, changePassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.post('/change-password', authMiddleware, changePassword);

export default router;
