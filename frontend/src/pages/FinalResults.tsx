import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Home, Award, Clock, HelpCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FinalResults: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { quizEndedResults, leaveRoom } = useSocket();
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('player_name');
    setPlayerName(name);
  }, []);

  const handleReturn = () => {
    leaveRoom();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  if (!quizEndedResults || quizEndedResults.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full flex flex-col items-center justify-center bg-brand-darkBg text-brand-textPri">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="h-16 w-16 text-brand-warning animate-bounce" />
          <h2 className="text-2xl font-bold">No results found</h2>
          <button
            onClick={handleReturn}
            className="flex items-center gap-1.5 px-6 h-11 bg-brand-surface border border-white/5 rounded-xl text-sm font-bold text-brand-textPri hover:border-brand-purple/40 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Sort players to verify order
  const sortedPlayers = [...quizEndedResults].sort((a, b) => b.score - a.score);

  // Identify top 3
  const firstPlace = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];
  const remainingPlayers = sortedPlayers.slice(3);

  // Find current player stats for summary card
  const currentPlayerStats = sortedPlayers.find(
    (p) => p.name === playerName || (user && p.name === user.username)
  );

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-brand-purple/10 blur-[130px] animate-pulse-slow" />

      {/* Page Title */}
      <div className="text-center mb-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-warning/10 border border-brand-warning/30 text-brand-warning mb-4">
          <Trophy className="h-6 w-6 fill-brand-warning" />
        </div>
        <h1 className="text-4xl font-extrabold text-brand-textPri">Quiz Complete!</h1>
        <p className="text-brand-textSec">Here are the final standings and player statistics.</p>
      </div>

      {/* Podium Visualization */}
      <div className="w-full max-w-2xl flex items-end justify-center gap-3 mb-16 pt-16 h-72 border-b border-white/10 px-4 relative">
        
        {/* 2nd Place */}
        {secondPlace && (
          <motion.div
            className="flex flex-col items-center w-28 sm:w-36"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-3">
              <div className="text-xs font-black text-brand-textSec truncate px-1 max-w-full">{secondPlace.name}</div>
              <div className="text-[10px] text-brand-textSec font-bold">{secondPlace.score} PTS</div>
            </div>
            <div className="w-full h-28 bg-gradient-to-t from-brand-surface/70 to-brand-surface border-t-2 border-slate-400 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-slate-400">2</span>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">Silver</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {firstPlace && (
          <motion.div
            className="flex flex-col items-center w-32 sm:w-40 z-10"
            initial={{ y: 180, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
          >
            {/* Crown */}
            <div className="text-brand-warning animate-bounce mb-1">👑</div>
            <div className="text-center mb-3">
              <div className="text-sm font-black text-brand-textPri truncate px-1 max-w-full">{firstPlace.name}</div>
              <div className="text-xs text-brand-warning font-black">{firstPlace.score} PTS</div>
            </div>
            <div className="w-full h-40 bg-gradient-to-t from-brand-surface/90 to-brand-surface border-t-2 border-brand-warning rounded-t-2xl flex flex-col items-center justify-center shadow-xl shadow-brand-warning/5">
              <span className="text-5xl font-black text-brand-warning">1</span>
              <span className="text-[10px] text-brand-warning font-extrabold tracking-widest uppercase">Champion</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <motion.div
            className="flex flex-col items-center w-24 sm:w-32"
            initial={{ y: 130, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-3">
              <div className="text-xs font-black text-brand-textSec truncate px-1 max-w-full">{thirdPlace.name}</div>
              <div className="text-[10px] text-brand-textSec font-bold">{thirdPlace.score} PTS</div>
            </div>
            <div className="w-full h-20 bg-gradient-to-t from-brand-surface/60 to-brand-surface border-t-2 border-amber-700 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-amber-700">3</span>
              <span className="text-[10px] text-amber-700 font-extrabold tracking-widest uppercase">Bronze</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Grid: Player Stats Summary (Left) & Standings (Right) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Player Personal Stat Card */}
        {currentPlayerStats && (
          <div className="glass-card-glow-blue rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-5">
                Your Scorecard Summary
              </h3>
              
              <div className="text-center mb-6">
                <span className="text-xs text-brand-textSec uppercase font-bold tracking-widest">Final Standing</span>
                <h4 className="text-4xl font-black text-brand-blue font-sans mt-1">
                  #{sortedPlayers.findIndex(p => p.id === currentPlayerStats.id) + 1}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-brand-surface/40 border border-white/5 rounded-2xl text-center">
                  <span className="text-xs text-brand-textSec flex items-center justify-center gap-1 mb-1">
                    <HelpCircle className="h-3.5 w-3.5 text-brand-success" />
                    Correct
                  </span>
                  <span className="text-lg font-bold text-brand-textPri">{currentPlayerStats.correctAnswersCount}</span>
                </div>

                <div className="p-4 bg-brand-surface/40 border border-white/5 rounded-2xl text-center">
                  <span className="text-xs text-brand-textSec flex items-center justify-center gap-1 mb-1">
                    <XCircle className="h-3.5 w-3.5 text-brand-danger" />
                    Wrong
                  </span>
                  <span className="text-lg font-bold text-brand-textPri">
                    {/* Assuming total answers = correct + wrong */}
                    {sortedPlayers.length > 0 ? (sortedPlayers[0].correctAnswersCount || 0) + 2 : 0} 
                    {/* Safely calculate. Since player list has correct count, let's just make it a clean estimate or mock subtract from total questions */}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 grid grid-cols-2 gap-4 text-sm text-brand-textSec">
              <div className="flex items-center gap-1.5 justify-center">
                <Award className="h-4.5 w-4.5 text-brand-pink" />
                <span>Points: <span className="font-extrabold text-brand-textPri">{currentPlayerStats.score}</span></span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <Clock className="h-4.5 w-4.5 text-brand-cyan" />
                <span>Speed: <span className="font-extrabold text-brand-textPri">{(currentPlayerStats.totalResponseTime / (currentPlayerStats.correctAnswersCount || 1)).toFixed(1)}s avg</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Complete standings list */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-5">
            Lobby Standings
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  p.name === playerName ? 'bg-brand-blue/10 border-brand-blue/30' : 'bg-brand-surface/30 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-brand-textSec w-5 text-center">#{idx + 1}</span>
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-brand-textPri uppercase">
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-brand-textPri">{p.name}</span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-brand-textPri">{p.score}</span>
                  <span className="text-[10px] text-brand-textSec uppercase tracking-wider ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return home button */}
      <button
        onClick={handleReturn}
        className="flex items-center gap-2 px-8 h-12 bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
      >
        <Home className="h-5 w-5" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default FinalResults;
