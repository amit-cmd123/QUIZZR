import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface Player {
  id: string;
  name: string;
  score: number;
  correctAnswersCount: number;
  totalResponseTime: number;
  isDisconnected: boolean;
  warningCount: number;
}

interface QuestionOption {
  id: string;
  text: string;
}

interface CurrentQuestion {
  id: string;
  text: string;
  timer: number;
  points: number;
  options: QuestionOption[];
  questionIndex: number;
  totalQuestions: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  correctAnswers: number;
  avgResponseTime: number;
}

interface AnswerLockedData {
  optionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  score: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  players: Player[];
  currentQuestion: CurrentQuestion | null;
  timeLeft: number;
  leaderboard: LeaderboardEntry[];
  quizEndedResults: Player[] | null;
  lockedAnswer: AnswerLockedData | null;
  revealedCorrectOptionId: string | null;
  errorMsg: string | null;
  cheatWarnings: { playerName: string; warningCount: number }[];
  joinRoom: (roomCode: string, name: string, userId?: string, isHost?: boolean) => void;
  startQuiz: () => void;
  submitAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  reportTabSwitch: () => void;
  leaveRoom: () => void;
  setErrorMsg: (msg: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizEndedResults, setQuizEndedResults] = useState<Player[] | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<AnswerLockedData | null>(null);
  const [revealedCorrectOptionId, setRevealedCorrectOptionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cheatWarnings, setCheatWarnings] = useState<{ playerName: string; warningCount: number }[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Socket client connected to server');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket client disconnected');
    });

    s.on('error-msg', (msg: string) => {
      setErrorMsg(msg);
    });

    // Game Events
    s.on('player-joined', (activePlayers: Player[]) => {
      setPlayers(activePlayers);
    });

    s.on('quiz-started', () => {
      setQuizEndedResults(null);
      setLeaderboard([]);
      setCheatWarnings([]);
    });

    s.on('new-question', (question: CurrentQuestion) => {
      setCurrentQuestion(question);
      setLockedAnswer(null);
      setRevealedCorrectOptionId(null);
      setTimeLeft(question.timer);
    });

    s.on('timer-sync', (remainingTime: number) => {
      setTimeLeft(remainingTime);
    });

    s.on('answer-locked', (answerData: AnswerLockedData) => {
      setLockedAnswer(answerData);
    });

    s.on('answer-locked-broadcast', (data: { correctOptionId: string }) => {
      setRevealedCorrectOptionId(data.correctOptionId);
    });

    s.on('leaderboard-update', (rankList: LeaderboardEntry[]) => {
      setLeaderboard(rankList);
    });

    s.on('quiz-ended', (finalPlayers: Player[]) => {
      setQuizEndedResults(finalPlayers);
      setCurrentQuestion(null);
    });

    s.on('cheat-warning', (data: { playerId: string; playerName: string; warningCount: number }) => {
      setCheatWarnings(prev => {
        // Remove existing warning from the same player and add the new one
        const filtered = prev.filter(w => w.playerName !== data.playerName);
        return [...filtered, { playerName: data.playerName, warningCount: data.warningCount }];
      });
      
      // Update warningCount inside players state list in real time
      setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, warningCount: data.warningCount } : p));
    });

    s.on('player-disconnected', (data: { playerId: string; playerName: string }) => {
      setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, isDisconnected: true } : p));
    });

    s.connect();

    return () => {
      s.disconnect();
    };
  }, []);

  const joinRoom = (roomCode: string, name: string, userId?: string, isHost?: boolean) => {
    if (socketRef.current) {
      setErrorMsg(null);
      socketRef.current.emit('join-room', { roomCode, name, userId, isHost });
    }
  };

  const startQuiz = () => {
    if (socketRef.current) {
      socketRef.current.emit('host-start-quiz');
    }
  };

  const submitAnswer = (questionId: string, optionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('submit-answer', { questionId, optionId });
    }
  };

  const nextQuestion = () => {
    if (socketRef.current) {
      socketRef.current.emit('next-question');
    }
  };

  const reportTabSwitch = () => {
    if (socketRef.current) {
      socketRef.current.emit('detect-tab-switch');
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      // Clear game states
      setPlayers([]);
      setCurrentQuestion(null);
      setTimeLeft(0);
      setLeaderboard([]);
      setQuizEndedResults(null);
      setLockedAnswer(null);
      setRevealedCorrectOptionId(null);
      setCheatWarnings([]);
      setErrorMsg(null);

      // Reconnect to clear room references
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        players,
        currentQuestion,
        timeLeft,
        leaderboard,
        quizEndedResults,
        lockedAnswer,
        revealedCorrectOptionId,
        errorMsg,
        cheatWarnings,
        joinRoom,
        startQuiz,
        submitAnswer,
        nextQuestion,
        reportTabSwitch,
        leaveRoom,
        setErrorMsg
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
