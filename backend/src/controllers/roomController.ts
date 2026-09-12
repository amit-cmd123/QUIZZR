import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to generate a 6-character alphanumeric room code
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.body;
    const hostId = req.user?.userId;

    if (!hostId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!quizId) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }

    // Verify quiz exists and is owned by host
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, hostId }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    }

    // Generate unique code
    let code = generateRoomCode();
    let codeExists = await prisma.room.findUnique({ where: { code } });
    
    while (codeExists) {
      code = generateRoomCode();
      codeExists = await prisma.room.findUnique({ where: { code } });
    }

    const room = await prisma.room.create({
      data: {
        code,
        quizId,
        hostId,
        status: 'LOBBY'
      },
      include: {
        quiz: {
          select: {
            title: true,
            description: true,
            category: true,
            questions: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json(room);
  } catch (err: any) {
    console.error('CreateRoom error:', err);
    return res.status(500).json({ error: 'Internal server error during room creation' });
  }
};

export const getRoomByCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            questions: {
              select: {
                id: true,
                text: true,
                timer: true,
                points: true,
                options: {
                  select: {
                    id: true,
                    text: true
                  }
                }
              }
            }
          }
        },
        players: {
          where: { isDisconnected: false }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status === 'ENDED') {
      return res.status(400).json({ error: 'This quiz room has already ended' });
    }

    return res.json(room);
  } catch (err: any) {
    console.error('GetRoomByCode error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
