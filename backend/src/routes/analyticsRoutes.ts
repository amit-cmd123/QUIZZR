import { Router } from 'express';
import { getQuizAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/:quizId', authenticateToken, getQuizAnalytics);

export default router;
