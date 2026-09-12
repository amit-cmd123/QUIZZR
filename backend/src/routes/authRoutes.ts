import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

export default router;
