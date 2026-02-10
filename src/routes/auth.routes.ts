import { Router } from 'express';
import { login, logout, verify2FA } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/logout', logout);

export default router;
