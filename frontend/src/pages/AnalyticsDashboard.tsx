import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft, Users, Trophy, Percent, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalSessions: number;
  totalPlayers: number;
  averageScore: number;
  hardestQuestion: string;
  fastestPlayer: string;
  questionAccuracy: { questionText: string; accuracy: number; totalAnswers: number }[];
  scoreDistribution: { name: string; count: number }[];
  leaderboardHistory: { rank: number; name: string; score: number; date: string }[];
  cheatStats: { totalWarnings: number; flaggedPlayers: number };
}

const AnalyticsDashboard: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(`/analytics/${quizId}`);
        setData(response.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-darkBg text-brand-textPri">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
          <p className="text-brand-textSec text-sm">Aggregating session metrics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-brand-textPri mb-4">No analytics reports found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 h-11 bg-brand-surface border border-white/5 rounded-xl text-brand-textPri font-bold hover:border-brand-purple/40 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface border border-white/5 text-brand-textSec hover:text-brand-textPri hover:border-brand-purple/40 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-textPri">Quiz Analytics</h1>
          <p className="text-brand-textSec text-sm">Deep-dive review on score ranges, response speeds, and security audits.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total players */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-blue/15 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-textSec uppercase font-bold tracking-wider">Total Responders</span>
            <h3 className="text-2xl font-black text-brand-textPri mt-0.5">{data.totalPlayers}</h3>
          </div>
        </div>

        {/* Average Score */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-textSec uppercase font-bold tracking-wider">Average Score</span>
            <h3 className="text-2xl font-black text-brand-textPri mt-0.5">{data.averageScore}</h3>
          </div>
        </div>

        {/* Speed details */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-textSec uppercase font-bold tracking-wider">Fastest Responder</span>
            <h3 className="text-sm font-black text-brand-textPri mt-1.5 truncate max-w-44">{data.fastestPlayer}</h3>
          </div>
        </div>

        {/* Cheat Stats */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
            data.cheatStats.totalWarnings > 0
              ? 'bg-brand-danger/15 border-brand-danger/25 text-brand-danger animate-pulse'
              : 'bg-brand-surface border-white/5 text-brand-textSec'
          }`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-brand-textSec uppercase font-bold tracking-wider">Cheat Flags</span>
            <h3 className="text-2xl font-black text-brand-textPri mt-0.5">{data.cheatStats.totalWarnings}</h3>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Stats details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Distribution Chart (Left 2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-6">
            Score Distribution
          </h3>

          <div className="h-72 w-full">
            {data.totalPlayers === 0 ? (
              <div className="h-full flex items-center justify-center text-brand-textSec text-sm">
                No score records exist yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    itemStyle={{ color: '#06B6D4' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} name="Players Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Hardest Question & Question Accuracy list */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-4 flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-brand-purple" />
            Hardest Question
          </h3>
          <div className="p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl text-sm font-semibold text-brand-purple leading-relaxed mb-6">
            {data.hardestQuestion}
          </div>

          <h3 className="text-sm font-bold text-brand-textSec uppercase tracking-wider mb-3">
            Question Accuracy Details
          </h3>
          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            {data.questionAccuracy.map((q, idx) => (
              <div key={idx} className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-brand-textPri truncate max-w-48">{q.questionText}</span>
                  <span className={q.accuracy < 50 ? 'text-brand-danger font-bold' : 'text-brand-success font-bold'}>
                    {q.accuracy}%
                  </span>
                </div>
                <div className="h-2 w-full bg-brand-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${q.accuracy < 50 ? 'bg-brand-danger' : 'bg-brand-success'}`}
                    style={{ width: `${q.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Leaderboard Record (Left 2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-6">
            Top Scoring History
          </h3>

          <div className="h-72 w-full">
            {data.leaderboardHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-brand-textSec text-sm">
                No games have completed yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.leaderboardHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    itemStyle={{ color: '#7C3AED' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Global Standings list */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-3 mb-5">
            Leaderboard Records
          </h3>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {data.leaderboardHistory.length === 0 ? (
              <div className="text-center py-10 text-brand-textSec text-sm">
                No rankings recorded yet.
              </div>
            ) : (
              data.leaderboardHistory.slice(0, 5).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-brand-surface/40 border border-white/5 rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-blue w-4">#{s.rank}</span>
                    <span className="text-brand-textPri font-medium truncate max-w-28">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-textPri">{s.score} PTS</div>
                    <div className="text-[9px] text-brand-textSec">{s.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
