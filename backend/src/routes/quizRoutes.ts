import { Router } from 'express';
import { createQuiz, getQuizzes, getQuizById, getHistory } from '../controllers/quizController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createQuiz);
router.get('/history', authenticateToken, getHistory);
router.get('/', authenticateToken, getQuizzes);
router.get('/:id', authenticateToken, getQuizById);

export default router;

