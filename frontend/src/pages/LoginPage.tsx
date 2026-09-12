import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await login(loginId, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-brand-blue/10 blur-[120px] animate-pulse-slow" />

      <motion.div
        className="w-full max-w-md glass-card-glow-blue rounded-3xl p-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-textPri mb-2">Welcome Back</h2>
          <p className="text-brand-textSec text-sm">Log in to manage and run your multiplayer lobbies</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Username or Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter username or email"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri font-bold shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/35 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-textSec">
          <span>Don't have a host account? </span>
          <Link to="/signup" className="text-brand-pink font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
