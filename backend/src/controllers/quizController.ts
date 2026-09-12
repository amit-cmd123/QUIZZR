import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, questions } = req.body;
    const hostId = req.user?.userId;

    if (!hostId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Quiz title, category and at least one question are required' });
    }

    // Use a transaction to create quiz, questions, options, and link correctOptionId
    const quiz = await prisma.$transaction(async (tx) => {
      const createdQuiz = await tx.quiz.create({
        data: {
          title,
          description,
          category,
          hostId
        }
      });

      for (const q of questions) {
        const { text, timer, points, options, correctOptionIndex } = q;

        if (!text || !options || !Array.isArray(options) || options.length !== 4 || correctOptionIndex === undefined) {
          throw new Error('Each question must have text, 4 options, and a correct option index');
        }

        // Create question
        const question = await tx.question.create({
          data: {
            quizId: createdQuiz.id,
            text,
            timer: timer || 20,
            points: points || 100
          }
        });

        // Create options
        const createdOptions = [];
        for (const optText of options) {
          const option = await tx.option.create({
            data: {
              questionId: question.id,
              text: optText
            }
          });
          createdOptions.push(option);
        }

        // Update correctOptionId
        const correctOption = createdOptions[correctOptionIndex];
        if (!correctOption) {
          throw new Error('Invalid correct option index');
        }

        await tx.question.update({
          where: { id: question.id },
          data: { correctOptionId: correctOption.id }
        });
      }

      return createdQuiz;
    });

    const fullQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return res.status(201).json(fullQuiz);
  } catch (err: any) {
    console.error('CreateQuiz error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during quiz creation' });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const hostId = req.user?.userId;
    if (!hostId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { hostId },
      include: {
        questions: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(quizzes);
  } catch (err: any) {
    console.error('GetQuizzes error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.json(quiz);
  } catch (err: any) {
    console.error('GetQuizById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get quizzes hosted by user
    const hostedHistory = await prisma.room.findMany({
      where: {
        hostId: userId,
        status: 'ENDED'
      },
      include: {
        quiz: {
          select: {
            title: true,
            category: true
          }
        },
        players: {
          orderBy: { score: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get scores of user if they played in any quizzes (matched by user ID or username)
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    const username = userObj?.username || '';

    const playedHistory = await prisma.score.findMany({
      where: {
        OR: [
          { userId },
          { username }
        ]
      },
      include: {
        quiz: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      hosted: hostedHistory,
      played: playedHistory
    });
  } catch (err: any) {
    console.error('GetHistory error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
