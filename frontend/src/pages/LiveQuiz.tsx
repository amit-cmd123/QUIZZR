import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Award, ShieldAlert, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveQuiz: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    players,
    currentQuestion,
    timeLeft,
    leaderboard,
    quizEndedResults,
    lockedAnswer,
    revealedCorrectOptionId,
    submitAnswer,
    nextQuestion,
    reportTabSwitch,
    cheatWarnings
  } = useSocket();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Tab switching cheat detection (Only active for guest players, not host)
  useEffect(() => {
    if (user) return; // Host is exempt

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportTabSwitch();
      }
    };

    const handleBlur = () => {
      reportTabSwitch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [user, reportTabSwitch]);

  // Navigate to results page when quiz ends
  useEffect(() => {
    if (quizEndedResults) {
      navigate(`/results/${code}`);
    }
  }, [quizEndedResults, code, navigate]);

  const handleSelectOption = (optionId: string) => {
    if (lockedAnswer || revealedCorrectOptionId || user) return;
    setSelectedOptionId(optionId);
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, optionId);
    }
  };

  const isHost = user !== null;

  // Render Host Panel Screen
  const renderHostScreen = () => {
    if (!currentQuestion) return null;

    const correctOption = currentQuestion.options.find(
      (o) => o.id === revealedCorrectOptionId
    );

    return (
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Question Arena */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            {/* Top Stats */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
                Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-brand-textSec">
                <Clock className="h-4 w-4 text-brand-purple" />
                <span>Timer: <span className="font-bold text-brand-textPri">{currentQuestion.timer}s</span></span>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-3xl font-extrabold text-brand-textPri mb-8 leading-tight">
              {currentQuestion.text}
            </h2>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const colors = ['border-brand-blue/30 bg-brand-blue/5', 'border-brand-purple/30 bg-brand-purple/5', 'border-brand-pink/30 bg-brand-pink/5', 'border-brand-cyan/30 bg-brand-cyan/5'];
                const isCorrectOption = opt.id === revealedCorrectOptionId;
                
                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      revealedCorrectOptionId 
                        ? isCorrectOption
                          ? 'bg-brand-success/15 border-brand-success/50 ring-1 ring-brand-success text-brand-success'
                          : 'bg-brand-surface/20 border-white/5 opacity-55'
                        : colors[idx % colors.length]
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-brand-textPri uppercase">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base font-medium">{opt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between glass-card rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-brand-cyan animate-pulse" />
                <span className="text-3xl font-black text-brand-cyan font-sans">{timeLeft}s</span>
              </div>
            </div>

            {revealedCorrectOptionId && (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1 px-6 h-12 bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>{currentQuestion.questionIndex + 1 === currentQuestion.totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Column: Standings & Cheat Log */}
        <div className="space-y-6">
          {/* Realtime Standings */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-4">
              Realtime Standings
            </h3>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-brand-textSec text-sm">
                Waiting for answer submissions...
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {leaderboard.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-brand-surface/40 border border-white/5 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-purple w-4">{p.rank}</span>
                      <span className="text-brand-textPri font-medium truncate max-w-28">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-textPri">{p.score}</span>
                      <span className="text-[10px] text-brand-textSec ml-1">PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Cheat Warning list */}
          <div className="glass-card rounded-3xl p-6 border border-brand-danger/10">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <ShieldAlert className="h-5 w-5 text-brand-danger" />
              <h3 className="text-lg font-bold text-brand-textPri">Cheat Warnings</h3>
            </div>

            {cheatWarnings.length === 0 ? (
              <div className="text-center py-6 text-brand-textSec text-xs">
                No security infractions recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {cheatWarnings.map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-brand-danger/5 border border-brand-danger/15 text-xs">
                    <span className="text-brand-textPri font-medium">{w.playerName}</span>
                    <span className="font-bold text-brand-danger">
                      {w.warningCount} {w.warningCount === 1 ? 'Warning' : 'Warnings'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Guest Player Screen
  const renderPlayerScreen = () => {
    if (!currentQuestion) return null;

    const isAnswered = lockedAnswer !== null;
    const isRevealed = revealedCorrectOptionId !== null;

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Question Panel */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple" />

          {/* Header row */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <span className="text-xs font-bold text-brand-textSec uppercase tracking-wider">
              Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-xs text-brand-textSec border border-white/5">
                <Clock className="h-3.5 w-3.5 text-brand-cyan" />
                <span className="font-bold text-brand-cyan font-sans">{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 text-xs text-brand-textSec border border-white/5">
                <Award className="h-3.5 w-3.5 text-brand-pink" />
                <span className="font-bold text-brand-pink">{currentQuestion.points} pts</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-textPri mb-8 text-center leading-tight">
            {currentQuestion.text}
          </h2>

          {/* Interactive Options list */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = opt.id === selectedOptionId;
              const isCorrectAnswer = opt.id === revealedCorrectOptionId;
              const isUserAnswerCorrect = isSelected && lockedAnswer?.isCorrect;

              // Styles resolver
              let btnStyle = 'bg-brand-surface/50 border-white/5 hover:border-brand-cyan/30 hover:bg-brand-surface/75';
              if (isSelected) {
                btnStyle = 'bg-brand-cyan/15 border-brand-cyan/50 ring-1 ring-brand-cyan';
              }

              if (isRevealed) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-brand-success/15 border-brand-success/60 text-brand-success ring-1 ring-brand-success';
                } else if (isSelected && !isUserAnswerCorrect) {
                  btnStyle = 'bg-brand-danger/15 border-brand-danger/60 text-brand-danger ring-1 ring-brand-danger';
                } else {
                  btnStyle = 'bg-brand-surface/20 border-white/5 opacity-40';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered || isRevealed}
                  className={`w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 group ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black uppercase transition-colors ${
                      isSelected ? 'bg-brand-cyan text-brand-darkBg' : 'bg-white/10 text-brand-textPri'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-base font-semibold">{opt.text}</span>
                  </div>

                  {isRevealed && isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0" />
                  )}
                  {isRevealed && isSelected && !isUserAnswerCorrect && (
                    <XCircle className="h-5 w-5 text-brand-danger shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic State Info Area */}
        <AnimatePresence mode="wait">
          {isRevealed ? (
            <motion.div
              key="revealed"
              className={`p-6 rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 ${
                lockedAnswer?.isCorrect
                  ? 'bg-brand-success/10 border border-brand-success/30 text-brand-success'
                  : 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {lockedAnswer?.isCorrect ? (
                <>
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  <h3 className="text-xl font-bold">Awesome! Correct Answer</h3>
                  <p className="text-sm opacity-90">
                    Earned <span className="font-extrabold">+{lockedAnswer.pointsEarned}</span> points. Current score: {lockedAnswer.score}.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-10 w-10 animate-shake" />
                  <h3 className="text-xl font-bold">Oops! Incorrect Answer</h3>
                  <p className="text-sm opacity-90">
                    No points gained. Current score: {lockedAnswer ? lockedAnswer.score : 0}.
                  </p>
                </>
              )}
            </motion.div>
          ) : isAnswered ? (
            <motion.div
              key="answered"
              className="p-6 rounded-2xl bg-brand-surface/60 border border-white/5 text-center flex flex-col items-center justify-center gap-2 text-brand-textSec"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent mb-1" />
              <h3 className="text-base font-bold text-brand-textPri">Response Locked</h3>
              <p className="text-xs">Waiting for other players to answer or countdown to expire.</p>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 text-center text-xs text-brand-cyan font-bold tracking-wider uppercase animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Select your option before time runs out!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full px-6 py-12 relative flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-blue/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-purple/5 blur-[80px]" />

      {isHost ? renderHostScreen() : renderPlayerScreen()}
    </div>
  );
};

export default LiveQuiz;
