import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, Calendar, BarChart3, HelpCircle, Trophy, User, ArrowLeft, Gamepad } from 'lucide-react';
import { motion } from 'framer-motion';

interface HostedSession {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  quizId: string;
  quiz: {
    title: string;
    category: string;
  };
  players: {
    id: string;
    name: string;
    score: number;
    correctAnswersCount: number;
  }[];
}

interface PlayedHistory {
  id: string;
  score: number;
  correctAnswersCount: number;
  totalResponseTime: number;
  createdAt: string;
  quiz: {
    title: string;
    category: string;
  };
}

const SessionHistory: React.FC = () => {
  const [hosted, setHosted] = useState<HostedSession[]>([]);
  const [played, setPlayed] = useState<PlayedHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'hosted' | 'played'>('hosted');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/quizzes/history');
        setHosted(response.data.hosted || []);
        setPlayed(response.data.played || []);
      } catch (err) {
        console.error('Failed to load session history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface border border-white/5 text-brand-textSec hover:text-brand-textPri hover:border-brand-purple/40 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-textPri">Session History</h1>
          <p className="text-brand-textSec text-sm">Review past quiz runs, player results, and accuracy metrics.</p>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex gap-4 border-b border-white/5 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('hosted')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'hosted'
              ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20'
              : 'text-brand-textSec hover:text-brand-textPri hover:bg-white/5'
          }`}
        >
          Hosted Sessions ({hosted.length})
        </button>
        <button
          onClick={() => setActiveTab('played')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'played'
              ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/20'
              : 'text-brand-textSec hover:text-brand-textPri hover:bg-white/5'
          }`}
        >
          My Played Scores ({played.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
            <p className="text-brand-textSec text-sm">Loading records...</p>
          </div>
        </div>
      ) : activeTab === 'hosted' ? (
        /* Hosted Sessions list */
        hosted.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
            <Gamepad className="h-12 w-12 text-brand-blue mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-brand-textPri mb-1">No Hosted Rooms</h3>
            <p className="text-sm text-brand-textSec mb-6">
              You haven't run any live quizzes yet. Go to your dashboard to spin up a multiplayer lobby.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-blue text-white shadow shadow-brand-blue/25"
            >
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {hosted.map((session) => (
              <motion.div
                key={session.id}
                className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-white/10 transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Session metadata */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="inline-block text-[10px] font-black px-2.5 py-1 rounded bg-brand-surface border border-white/5 text-brand-cyan tracking-wider uppercase mb-2">
                      Room Code: {session.code}
                    </span>
                    <h3 className="text-xl font-bold text-brand-textPri">{session.quiz.title}</h3>
                    <p className="text-xs text-brand-textSec mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>

                  {/* Leaderboard snippet */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Top Participants</span>
                    {session.players.length === 0 ? (
                      <p className="text-xs text-brand-textSec italic">No players participated in this session.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {session.players.slice(0, 3).map((p, idx) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-brand-textPri"
                          >
                            <Trophy className={`h-3.5 w-3.5 ${
                              idx === 0 ? 'text-brand-warning' : idx === 1 ? 'text-slate-400' : 'text-amber-700'
                            }`} />
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-[10px] text-brand-textSec">({p.score} pts)</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Session actions */}
                <div className="flex md:flex-col justify-end items-stretch gap-3 self-end md:self-center">
                  <div className="text-right hidden md:block">
                    <span className="text-xs text-brand-textSec">Total Players</span>
                    <h4 className="text-2xl font-black text-brand-textPri mt-0.5">{session.players.length}</h4>
                  </div>

                  <Link
                    to={`/analytics/${session.quizId}`}
                    className="flex items-center justify-center gap-1.5 px-5 h-11 bg-brand-surface border border-white/5 text-brand-textPri rounded-xl text-sm font-bold hover:bg-brand-surface/75 hover:border-brand-purple/35 transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4 text-brand-purple" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Played history scores list */
        played.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
            <Trophy className="h-12 w-12 text-brand-purple mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-brand-textPri mb-1">No Scores Logged</h3>
            <p className="text-sm text-brand-textSec mb-6">
              You haven't played in any quiz lobbies as a guest participant yet. Grab a room code and join in!
            </p>
            <Link
              to="/join"
              className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-purple text-white shadow shadow-brand-purple/25"
            >
              Join a Room
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {played.map((score) => (
              <motion.div
                key={score.id}
                className="glass-card rounded-2xl p-5 flex items-center justify-between gap-6 hover:border-white/10 transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h4 className="text-base font-bold text-brand-textPri">{score.quiz.title}</h4>
                  <p className="text-xs text-brand-textSec mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(score.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-brand-success" />
                      {score.correctAnswersCount} Correct Responses
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-brand-textSec uppercase font-bold tracking-wider block">Score Achieved</span>
                  <span className="text-xl font-black text-brand-cyan">{score.score} PTS</span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SessionHistory;
