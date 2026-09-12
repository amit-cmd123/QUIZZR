import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Gamepad2, User, Key, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PlayerJoin: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [searchParams] = useSearchParams();
  const { joinRoom, errorMsg, setErrorMsg } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto fill code if present in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setRoomCode(code.toUpperCase());
    }
    // If Host user is logged in, auto fill their username
    if (user) {
      setName(user.username);
    }
  }, [searchParams, user]);

  // Sync socket-level error messages
  useEffect(() => {
    if (errorMsg) {
      setError(errorMsg);
      setIsValidating(false);
    }
  }, [errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorMsg(null);

    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode || !trimmedName) {
      setError('Please fill in both name and room code');
      return;
    }

    if (trimmedCode.length !== 6) {
      setError('Room code must be exactly 6 characters');
      return;
    }

    try {
      setIsValidating(true);
      // Call REST API to check if room is valid before socket connection
      const response = await api.get(`/rooms/${trimmedCode}`);
      const room = response.data;

      if (room.status !== 'LOBBY') {
        setError('Quiz has already started or room is unavailable');
        setIsValidating(false);
        return;
      }

      // Check if username is already taken in the room
      const nameTaken = room.players.some((p: any) => p.name.toLowerCase() === trimmedName.toLowerCase());
      if (nameTaken) {
        setError('That username is already taken in this room');
        setIsValidating(false);
        return;
      }

      // Emit socket event to join
      joinRoom(trimmedCode, trimmedName, user?.id);
      
      // Navigate to lobby
      localStorage.setItem('player_name', trimmedName);
      navigate(`/lobby/${trimmedCode}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Room not found or server is unreachable');
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-brand-cyan/10 blur-[120px] animate-pulse-slow" />

      <motion.div
        className="w-full max-w-md glass-card-glow-cyan rounded-3xl p-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="h-6 w-6 text-brand-cyan animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-textPri mb-2 font-sans">Enter Lobby</h2>
          <p className="text-brand-textSec text-sm">Enter your nickname and the room code to join the live match.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Code */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Room Code</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <Key className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-CHAR CODE"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-cyan font-black tracking-widest placeholder-brand-textSec focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Your Nickname</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player nickname"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isValidating}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-textPri font-bold shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/35 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span>Join Lobby</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PlayerJoin;
