import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, Check, Play, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const RoomLobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const { players, currentQuestion, startQuiz, leaveRoom, joinRoom } = useSocket();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Redirect automatically when quiz starts and questions are received
  useEffect(() => {
    if (currentQuestion) {
      navigate(`/play/${code}`);
    }
  }, [currentQuestion, code, navigate]);

  // Handle case where user refreshes the page and loses socket state
  useEffect(() => {
    if (players.length === 0 && code) {
      const storedName = localStorage.getItem('player_name');
      const isHost = user !== null;

      if (isHost) {
        joinRoom(code, user.username, user.id, true);
      } else if (storedName) {
        joinRoom(code, storedName);
      } else {
        // Redirect back if no name/role is saved
        navigate('/join');
      }
    }
  }, [code, players, user, joinRoom, navigate]);

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const isHost = user !== null;

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
      {/* Code Display Area */}
      <motion.div
        className="w-full max-w-2xl glass-card rounded-3xl p-8 mb-8 flex flex-col items-center text-center relative overflow-hidden"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink" />

        <span className="text-xs font-black tracking-widest text-brand-textSec uppercase mb-2">Room Entry Code</span>
        
        {/* Copyable code */}
        <button
          onClick={handleCopyCode}
          className="group flex items-center gap-4 bg-brand-surface border border-white/5 px-8 py-4 rounded-2xl hover:border-brand-purple/40 hover:scale-105 active:scale-98 transition-all duration-300 mb-4"
        >
          <span className="text-5xl font-black text-brand-cyan tracking-widest font-sans">{code}</span>
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-textSec group-hover:text-brand-textPri group-hover:bg-white/10 transition-all">
            {copied ? <Check className="h-5 w-5 text-brand-success" /> : <Copy className="h-5 w-5" />}
          </div>
        </button>

        <p className="text-sm text-brand-textSec">Share this room code with players so they can join the lobby.</p>
      </motion.div>

      {/* Players List Grid */}
      <motion.div
        className="w-full max-w-4xl glass-card rounded-3xl p-8 flex-1 flex flex-col justify-between"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div>
          {/* List Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-purple" />
              <span className="text-lg font-bold text-brand-textPri">Players Connected</span>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-black tracking-wider uppercase">
              {players.length} Joined
            </span>
          </div>

          {/* Lobby entries */}
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-dashed border-brand-purple animate-spin mb-4" />
              <p className="text-brand-textSec font-medium">Waiting for players to link up...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map((p, idx) => (
                <motion.div
                  key={p.id}
                  className="p-4 rounded-2xl bg-brand-surface border border-white/5 text-center flex flex-col items-center justify-center gap-2 hover:border-brand-purple/35 transition-all"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple text-brand-textPri font-black flex items-center justify-center">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-brand-textPri truncate w-full px-2">{p.name}</span>
                  {p.isDisconnected && (
                    <span className="text-[10px] text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded border border-brand-danger/20">
                      Disconnected
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 mt-12 gap-4">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-6 h-12 bg-brand-surface border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/10 rounded-xl font-bold transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Lobby</span>
          </button>

          {isHost ? (
            <button
              onClick={startQuiz}
              disabled={players.length === 0}
              className="flex items-center gap-2 px-8 h-12 bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>Start Live Quiz</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 text-brand-textSec">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
              <span className="text-sm font-medium">Waiting for Host to start...</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RoomLobby;
