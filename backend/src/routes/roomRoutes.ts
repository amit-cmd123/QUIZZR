import { Router } from 'express';
import { createRoom, getRoomByCode } from '../controllers/roomController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createRoom);
router.get('/:code', getRoomByCode);

export default router;
