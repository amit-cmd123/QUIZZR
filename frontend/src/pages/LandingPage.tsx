import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Shield, Play, Trophy, Users, Star, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/join?code=${roomCode.toUpperCase().trim()}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-6 pt-20 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-blue/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-purple/20 blur-[100px] animate-pulse-slow" />

        {/* Hero Left Content */}
        <motion.div 
          className="flex-1 text-center lg:text-left"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs font-semibold tracking-wider text-brand-purple uppercase mb-6">
            <Star className="h-3.5 w-3.5 fill-brand-purple text-brand-purple" />
            Next-Gen Quiz Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Rush Into Realtime <br />
            <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink bg-clip-text text-transparent glow-text-purple">
              Multiplayer Quizzes
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-brand-textSec max-w-xl mb-8 leading-relaxed">
            Create custom MCQ lobbies, invite players instantly, and watch the leaderboard shift in real-time. Power up your quizzes with speed scoring and built-in anti-cheat parameters.
          </p>

          {/* Join Room Form */}
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto lg:mx-0">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-CHAR CODE"
                className="w-full h-14 bg-brand-cardBg/90 border border-white/10 rounded-2xl px-5 text-lg font-black tracking-widest text-center text-brand-cyan placeholder-brand-textSec focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri text-lg font-bold shadow-lg shadow-brand-blue/30 hover:shadow-brand-blue/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 fill-white" />
              Join LOBBY
            </button>
          </form>

          <div className="mt-6 text-sm text-brand-textSec flex items-center justify-center lg:justify-start gap-2">
            <span>Want to create your own quiz?</span>
            <Link to="/signup" className="text-brand-pink font-bold hover:underline">
              Register as Host
            </Link>
          </div>
        </motion.div>

        {/* Hero Right Content - Live Leaderboard Mockup */}
        <motion.div 
          className="flex-1 w-full max-w-md glass-card-glow-purple rounded-3xl p-6 relative overflow-hidden"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-success animate-ping" />
              <span className="text-sm font-bold text-brand-textPri uppercase tracking-wider">Live Lobby Preview</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-brand-surface border border-white/5 text-brand-textSec">
              Room: <span className="font-bold text-brand-cyan">DEV502</span>
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-brand-textPri mb-3">Quiz: Web Dev Masterclass</h3>

          {/* Leaderboard entries */}
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Alex_Vite', score: 1420, avgTime: '1.2s', status: 'Correct', color: 'text-amber-400' },
              { rank: 2, name: 'Sora_React', score: 1250, avgTime: '1.9s', status: 'Correct', color: 'text-slate-300' },
              { rank: 3, name: 'PixelNinja', score: 1090, avgTime: '2.5s', status: 'Correct', color: 'text-amber-600' },
              { rank: 4, name: 'CyberCodex', score: 920, avgTime: '3.1s', status: 'Correct', color: 'text-brand-textSec' }
            ].map((p, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  i === 0 ? 'bg-brand-blue/10 border-brand-blue/30 shadow shadow-brand-blue/20' : 'bg-brand-surface/40 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-base font-black w-6 text-center ${p.color}`}>
                    {p.rank}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-brand-textPri">{p.name}</div>
                    <div className="text-xs text-brand-textSec flex items-center gap-1.5">
                      <span>Time: {p.avgTime}</span>
                      <span>•</span>
                      <span className="text-brand-success">+{p.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-brand-textPri">{p.score}</div>
                  <div className="text-[10px] text-brand-textSec tracking-wide uppercase">PTS</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-brand-textSec bg-white/5 py-2.5 rounded-xl border border-white/5">
            Leaderboard updates live after every question!
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section className="w-full max-w-7xl px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Designed for High-Octane Classrooms & Communities
          </h2>
          <p className="text-brand-textSec max-w-xl mx-auto">
            Enjoy low-latency synchronization and gaming dashboard statistics out of the box.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 hover:scale-[1.03] transition-all duration-300 hover:border-brand-blue/30 group">
            <div className="h-14 w-14 rounded-2xl bg-brand-blue/15 border border-brand-blue/35 flex items-center justify-center mb-6 group-hover:bg-brand-blue/25 transition-colors duration-300">
              <Users className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-xl font-bold text-brand-textPri mb-3">Realtime Multi-Lobbies</h3>
            <p className="text-brand-textSec leading-relaxed">
              No page refreshes. Players connect instantly to the room code, and the host controls the live flow, keeping all connected devices synced automatically.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 hover:scale-[1.03] transition-all duration-300 hover:border-brand-purple/30 group">
            <div className="h-14 w-14 rounded-2xl bg-brand-purple/15 border border-brand-purple/35 flex items-center justify-center mb-6 group-hover:bg-brand-purple/25 transition-colors duration-300">
              <Cpu className="h-6 w-6 text-brand-purple" />
            </div>
            <h3 className="text-xl font-bold text-brand-textPri mb-3">Speed-Adjusted Scoring</h3>
            <p className="text-brand-textSec leading-relaxed">
              Answering correctly is only half the battle. Earn extra speed bonuses for locked responses, rewarding fastest responders with high rankings.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 hover:scale-[1.03] transition-all duration-300 hover:border-brand-pink/30 group">
            <div className="h-14 w-14 rounded-2xl bg-brand-pink/15 border border-brand-pink/35 flex items-center justify-center mb-6 group-hover:bg-brand-pink/25 transition-colors duration-300">
              <Shield className="h-6 w-6 text-brand-pink" />
            </div>
            <h3 className="text-xl font-bold text-brand-textPri mb-3">Active Shield Anti-Cheat</h3>
            <p className="text-brand-textSec leading-relaxed">
              Auto-detect when players toggle window tabs. Real-time warnings are piped directly to the host scoreboard, maintaining platform integrity.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-brand-surface/20 border-t border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How Quizzr Works</h2>
            <p className="text-brand-textSec max-w-xl mx-auto">
              Get your multiplayer game lobby up and running in less than three minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Register Host', desc: 'Create your account to unlock full custom quiz setups.' },
              { step: '02', title: 'Build MCQ Quiz', desc: 'Add titles, questions, options, individual timers, and points.' },
              { step: '03', title: 'Open Lobby', desc: 'Generate a 6-character code and invite players live.' },
              { step: '04', title: 'Let Quiz Begin', desc: 'Start the live quiz, trace responses, and check the podium.' }
            ].map((s, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-brand-cardBg/40 border border-white/5 rounded-2xl">
                <div className="text-4xl font-black text-brand-blue/30 mb-4">{s.step}</div>
                <h3 className="text-lg font-bold text-brand-textPri mb-2">{s.title}</h3>
                <p className="text-sm text-brand-textSec leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
