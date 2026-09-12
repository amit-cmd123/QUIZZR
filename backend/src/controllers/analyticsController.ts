import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getQuizAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const hostId = req.user?.userId;

    if (!hostId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify quiz belongs to this host
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        hostId
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    }

    // Get all rooms for this quiz
    const rooms = await prisma.room.findMany({
      where: { quizId },
      select: { id: true }
    });
    const roomIds = rooms.map(r => r.id);

    // Get all players for these rooms
    const players = await prisma.player.findMany({
      where: { roomId: { in: roomIds } },
      include: {
        answers: true,
        cheatLogs: true
      }
    });

    if (players.length === 0) {
      return res.json({
        totalSessions: rooms.length,
        totalPlayers: 0,
        averageScore: 0,
        hardestQuestion: 'N/A',
        fastestPlayer: 'N/A',
        questionAccuracy: [],
        scoreDistribution: [],
        leaderboardHistory: [],
        cheatStats: { totalWarnings: 0, flaggedPlayers: 0 }
      });
    }

    const totalPlayers = players.length;
    const totalScore = players.reduce((sum, p) => sum + p.score, 0);
    const averageScore = Math.round(totalScore / totalPlayers);

    // Speed details: find correct answer with lowest response time
    const correctAnswers = await prisma.answer.findMany({
      where: {
        question: { quizId },
        pointsEarned: { gt: 0 } // Points earned > 0 means correct
      },
      include: {
        player: true
      },
      orderBy: {
        responseTimeMs: 'asc'
      },
      take: 1
    });

    const fastestPlayer = correctAnswers.length > 0
      ? `${correctAnswers[0].player.name} (${(correctAnswers[0].responseTimeMs / 1000).toFixed(2)}s)`
      : 'N/A';

    // Calculate Question Accuracy
    const questionAccuracy: Array<{ questionText: string; accuracy: number; totalAnswers: number }> = [];
    let hardestQuestionText = 'N/A';
    let lowestAccuracy = 101;

    for (const q of quiz.questions) {
      const answersForQ = await prisma.answer.findMany({
        where: { questionId: q.id }
      });

      const totalAns = answersForQ.length;
      const correctAns = answersForQ.filter(a => a.pointsEarned > 0).length;
      const accuracy = totalAns > 0 ? Math.round((correctAns / totalAns) * 100) : 0;

      questionAccuracy.push({
        questionText: q.text,
        accuracy,
        totalAnswers: totalAns
      });

      if (totalAns > 0 && accuracy < lowestAccuracy) {
        lowestAccuracy = accuracy;
        hardestQuestionText = q.text;
      }
    }

    if (hardestQuestionText === 'N/A' && quiz.questions.length > 0) {
      hardestQuestionText = quiz.questions[0].text;
    }

    // Score distribution calculation
    const distributionBuckets = [
      { name: '0-200', count: 0 },
      { name: '201-500', count: 0 },
      { name: '501-800', count: 0 },
      { name: '801-1200', count: 0 },
      { name: '1201+', count: 0 }
    ];

    players.forEach(p => {
      if (p.score <= 200) distributionBuckets[0].count++;
      else if (p.score <= 500) distributionBuckets[1].count++;
      else if (p.score <= 800) distributionBuckets[2].count++;
      else if (p.score <= 1200) distributionBuckets[3].count++;
      else distributionBuckets[4].count++;
    });

    // Leaderboard history: fetch from global Score table or top players in recent rooms
    const scores = await prisma.score.findMany({
      where: { quizId },
      orderBy: { score: 'desc' },
      take: 10
    });

    const leaderboardHistory = scores.map((s, idx) => ({
      rank: idx + 1,
      name: s.username,
      score: s.score,
      date: new Date(s.createdAt).toLocaleDateString()
    }));

    // Cheat warning analytics
    const totalWarnings = players.reduce((sum, p) => sum + p.warningCount, 0);
    const flaggedPlayers = players.filter(p => p.warningCount > 0).length;

    return res.json({
      totalSessions: rooms.length,
      totalPlayers,
      averageScore,
      hardestQuestion: hardestQuestionText,
      fastestPlayer,
      questionAccuracy,
      scoreDistribution: distributionBuckets,
      leaderboardHistory,
      cheatStats: {
        totalWarnings,
        flaggedPlayers
      }
    });
  } catch (err: any) {
    console.error('GetQuizAnalytics error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
