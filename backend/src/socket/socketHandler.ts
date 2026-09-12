import { Server, Socket } from 'socket.io';
import prisma from '../utils/prisma';

interface ActiveRoomState {
  roomCode: string;
  questionTimer: NodeJS.Timeout | null;
  timeLeft: number;
  questionStartTime: number;
  totalQuestions: number;
}

const activeRooms = new Map<string, ActiveRoomState>();

export const initSocketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room event
    socket.on('join-room', async (payload: { roomCode: string; name: string; userId?: string; isHost?: boolean }) => {
      try {
        const { roomCode, name, userId, isHost } = payload;
        const normalizedCode = roomCode.toUpperCase();

        const room = await prisma.room.findUnique({
          where: { code: normalizedCode },
          include: {
            quiz: {
              include: {
                questions: true
              }
            },
            players: true
          }
        });

        if (!room) {
          socket.emit('error-msg', 'Room not found');
          return;
        }

        if (room.status === 'ENDED') {
          socket.emit('error-msg', 'This quiz room has already ended');
          return;
        }

        if (isHost) {
          // If host is connecting
          socket.join(normalizedCode);
          socket.data = { roomCode: normalizedCode, isHost: true };
          console.log(`Host joined room: ${normalizedCode}`);
          
          // Send current player list to host
          const activePlayers = await prisma.player.findMany({
            where: { roomId: room.id, isDisconnected: false }
          });
          socket.emit('player-joined', activePlayers);
          return;
        }

        // For player connection
        if (room.status === 'PLAYING') {
          socket.emit('error-msg', 'Quiz has already started');
          return;
        }

        // Prevent duplicate joining by same username
        const duplicatePlayer = room.players.find(p => p.name.toLowerCase() === name.toLowerCase() && !p.isDisconnected);
        if (duplicatePlayer) {
          socket.emit('error-msg', 'Name is already taken in this room');
          return;
        }

        // Add player to DB
        const player = await prisma.player.create({
          data: {
            roomId: room.id,
            userId: userId || null,
            name,
            socketId: socket.id
          }
        });

        // Store identity in socket data
        socket.join(normalizedCode);
        socket.data = {
          roomCode: normalizedCode,
          playerName: name,
          playerId: player.id,
          isHost: false
        };

        console.log(`Player ${name} (${player.id}) joined room: ${normalizedCode}`);

        // Broadcast to everyone in room that player joined
        const activePlayers = await prisma.player.findMany({
          where: { roomId: room.id, isDisconnected: false }
        });
        io.to(normalizedCode).emit('player-joined', activePlayers);

      } catch (err) {
        console.error('Socket join-room error:', err);
        socket.emit('error-msg', 'Failed to join room');
      }
    });

    // Host starts quiz
    socket.on('host-start-quiz', async () => {
      try {
        const { roomCode, isHost } = socket.data;
        if (!isHost || !roomCode) {
          socket.emit('error-msg', 'Only hosts can start the quiz');
          return;
        }

        const room = await prisma.room.findUnique({
          where: { code: roomCode },
          include: {
            quiz: {
              include: {
                questions: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        });

        if (!room) return;

        // Reset player scores and responses for a fresh run
        await prisma.player.updateMany({
          where: { roomId: room.id },
          data: {
            score: 0,
            correctAnswersCount: 0,
            totalResponseTime: 0,
            warningCount: 0
          }
        });

        // Clear existing answers/logs if any
        await prisma.answer.deleteMany({
          where: { player: { roomId: room.id } }
        });
        await prisma.cheatLog.deleteMany({
          where: { player: { roomId: room.id } }
        });

        // Update Room Status in DB
        await prisma.room.update({
          where: { id: room.id },
          data: {
            status: 'PLAYING',
            currentQuestionIndex: 0,
            currentQuestionState: 'ANSWERING'
          }
        });

        // Initialize active room states
        activeRooms.set(roomCode, {
          roomCode,
          questionTimer: null,
          timeLeft: 0,
          questionStartTime: 0,
          totalQuestions: room.quiz.questions.length
        });

        io.to(roomCode).emit('quiz-started');

        // Launch first question
        sendQuestion(io, roomCode, 0);

      } catch (err) {
        console.error('Socket host-start-quiz error:', err);
        socket.emit('error-msg', 'Failed to start quiz');
      }
    });

    // Player submits answer
    socket.on('submit-answer', async (payload: { questionId: string; optionId: string }) => {
      try {
        const { roomCode, playerId, playerName } = socket.data;
        if (!roomCode || !playerId) {
          socket.emit('error-msg', 'Session not found');
          return;
        }

        const roomState = activeRooms.get(roomCode);
        if (!roomState) return;

        const room = await prisma.room.findUnique({
          where: { code: roomCode }
        });

        if (!room || room.currentQuestionState !== 'ANSWERING') {
          socket.emit('error-msg', 'Answers are locked for this question');
          return;
        }

        // Check if player has already submitted
        const existingAnswer = await prisma.answer.findFirst({
          where: { playerId, questionId: payload.questionId }
        });

        if (existingAnswer) {
          socket.emit('error-msg', 'You have already submitted an answer');
          return;
        }

        const question = await prisma.question.findUnique({
          where: { id: payload.questionId },
          include: { options: true }
        });

        if (!question) return;

        const responseTimeMs = Date.now() - roomState.questionStartTime;
        const isCorrect = question.correctOptionId === payload.optionId;

        // Score Formula: Base Points + Speed Bonus
        // Speed bonus scales from 50% of base points to 0% linearly based on response speed
        let pointsEarned = 0;
        if (isCorrect) {
          const totalDurationMs = question.timer * 1000;
          const timeLeftRatio = Math.max(0, (totalDurationMs - responseTimeMs) / totalDurationMs);
          const speedBonus = Math.round(question.points * 0.5 * timeLeftRatio);
          pointsEarned = question.points + speedBonus;
        }

        // Save Answer
        await prisma.answer.create({
          data: {
            playerId,
            questionId: payload.questionId,
            optionId: payload.optionId,
            responseTimeMs,
            pointsEarned
          }
        });

        // Update player score
        const player = await prisma.player.update({
          where: { id: playerId },
          data: {
            score: { increment: pointsEarned },
            correctAnswersCount: { increment: isCorrect ? 1 : 0 },
            totalResponseTime: { increment: responseTimeMs / 1000 }
          }
        });

        // Confirm lock to player
        socket.emit('answer-locked', {
          optionId: payload.optionId,
          isCorrect,
          pointsEarned,
          score: player.score
        });

        // Check if everyone has submitted
        const totalPlayers = await prisma.player.count({
          where: { roomId: room.id, isDisconnected: false }
        });

        const totalAnswers = await prisma.answer.count({
          where: {
            questionId: payload.questionId,
            player: { roomId: room.id, isDisconnected: false }
          }
        });

        if (totalAnswers >= totalPlayers) {
          // Everyone submitted, end question early!
          console.log(`All players submitted. Locking room: ${roomCode}`);
          lockQuestion(io, roomCode);
        }

      } catch (err) {
        console.error('Socket submit-answer error:', err);
        socket.emit('error-msg', 'Failed to submit answer');
      }
    });

    // Tab switching/cheat detection
    socket.on('detect-tab-switch', async () => {
      try {
        const { roomCode, playerId, playerName } = socket.data;
        if (!roomCode || !playerId) return;

        // Log cheat warning in DB
        await prisma.cheatLog.create({
          data: {
            playerId,
            type: 'TAB_SWITCH',
            details: 'Player switched window tabs'
          }
        });

        // Update Player warning count
        const player = await prisma.player.update({
          where: { id: playerId },
          data: {
            warningCount: { increment: 1 }
          }
        });

        console.log(`Cheat warning: Player ${playerName} in room ${roomCode} has ${player.warningCount} warnings.`);

        // Broadcast cheat warning to host and players in the room
        io.to(roomCode).emit('cheat-warning', {
          playerId,
          playerName,
          warningCount: player.warningCount
        });

      } catch (err) {
        console.error('Socket detect-tab-switch error:', err);
      }
    });

    // Host triggers next question
    socket.on('next-question', async () => {
      try {
        const { roomCode, isHost } = socket.data;
        if (!isHost || !roomCode) return;

        const roomState = activeRooms.get(roomCode);
        if (!roomState) return;

        const room = await prisma.room.findUnique({
          where: { code: roomCode }
        });

        if (!room) return;

        const nextIndex = room.currentQuestionIndex + 1;
        if (nextIndex < roomState.totalQuestions) {
          // Go to next question
          await prisma.room.update({
            where: { id: room.id },
            data: {
              currentQuestionIndex: nextIndex,
              currentQuestionState: 'ANSWERING'
            }
          });
          sendQuestion(io, roomCode, nextIndex);
        } else {
          // End Quiz
          await prisma.room.update({
            where: { id: room.id },
            data: { status: 'ENDED' }
          });

          // Compile scores and store in Score database for history/leaderboards
          const players = await prisma.player.findMany({
            where: { roomId: room.id },
            orderBy: { score: 'desc' }
          });

          for (let i = 0; i < players.length; i++) {
            const p = players[i];
            const avgTime = p.correctAnswersCount > 0 ? (p.totalResponseTime / p.correctAnswersCount) : 0;
            await prisma.score.create({
              data: {
                userId: p.userId,
                username: p.name,
                quizId: room.quizId,
                score: p.score,
                rank: i + 1,
                correctAnswers: p.correctAnswersCount,
                avgResponseTime: avgTime
              }
            });
          }

          // Emit quiz ended with final results
          io.to(roomCode).emit('quiz-ended', players);
          activeRooms.delete(roomCode);
        }

      } catch (err) {
        console.error('Socket next-question error:', err);
      }
    });

    // Client disconnection
    socket.on('disconnect', async () => {
      try {
        const { roomCode, playerId, playerName, isHost } = socket.data;
        if (!roomCode) return;

        if (isHost) {
          console.log(`Host disconnected from room: ${roomCode}`);
          return;
        }

        if (playerId) {
          await prisma.player.update({
            where: { id: playerId },
            data: { isDisconnected: true }
          });

          console.log(`Player ${playerName} disconnected from room: ${roomCode}`);

          // Inform others
          const room = await prisma.room.findUnique({ where: { code: roomCode } });
          if (room) {
            const activePlayers = await prisma.player.findMany({
              where: { roomId: room.id, isDisconnected: false }
            });
            io.to(roomCode).emit('player-disconnected', { playerId, playerName });
            io.to(roomCode).emit('player-joined', activePlayers);
          }
        }
      } catch (err) {
        console.error('Socket disconnect handler error:', err);
      }
    });
  });
};

// Start a question timer loop on backend
const sendQuestion = async (io: Server, roomCode: string, questionIndex: number) => {
  const roomState = activeRooms.get(roomCode);
  if (!roomState) return;

  // Clear existing timer if any
  if (roomState.questionTimer) {
    clearInterval(roomState.questionTimer);
  }

  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  if (!room) return;
  const question = room.quiz.questions[questionIndex];
  if (!question) return;

  // Set up timer variables
  roomState.timeLeft = question.timer;
  roomState.questionStartTime = Date.now();

  // Send question details to all players (excluding correctOptionId to prevent cheating!)
  const sanitizedQuestion = {
    id: question.id,
    text: question.text,
    timer: question.timer,
    points: question.points,
    options: question.options.map(opt => ({ id: opt.id, text: opt.text })),
    questionIndex,
    totalQuestions: roomState.totalQuestions
  };

  io.to(roomCode).emit('new-question', sanitizedQuestion);

  // Sync remaining timer
  io.to(roomCode).emit('timer-sync', roomState.timeLeft);

  // Set timer ticks
  roomState.questionTimer = setInterval(() => {
    roomState.timeLeft -= 1;
    io.to(roomCode).emit('timer-sync', roomState.timeLeft);

    if (roomState.timeLeft <= 0) {
      clearInterval(roomState.questionTimer!);
      roomState.questionTimer = null;
      lockQuestion(io, roomCode);
    }
  }, 1000);
};

// Lock the question, calculate correct details, and broadcast leaderboard updates
const lockQuestion = async (io: Server, roomCode: string) => {
  const roomState = activeRooms.get(roomCode);
  if (!roomState) return;

  if (roomState.questionTimer) {
    clearInterval(roomState.questionTimer);
    roomState.questionTimer = null;
  }

  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  if (!room) return;

  // Update room state
  await prisma.room.update({
    where: { id: room.id },
    data: { currentQuestionState: 'REVEALED' }
  });

  const question = room.quiz.questions[room.currentQuestionIndex];
  if (!question) return;

  // Emit answer locked details
  io.to(roomCode).emit('answer-locked-broadcast', {
    correctOptionId: question.correctOptionId
  });

  // Calculate current rankings
  const players = await prisma.player.findMany({
    where: { roomId: room.id },
    orderBy: { score: 'desc' }
  });

  // Send real-time leaderboard update
  const rankList = players.map((p, idx) => ({
    rank: idx + 1,
    name: p.name,
    score: p.score,
    correctAnswers: p.correctAnswersCount,
    avgResponseTime: p.correctAnswersCount > 0 ? (p.totalResponseTime / p.correctAnswersCount) : 0
  }));

  io.to(roomCode).emit('leaderboard-update', rankList);
};
