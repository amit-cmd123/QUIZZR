import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await signup(username, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Try a different username/email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-brand-purple/10 blur-[120px] animate-pulse-slow" />

      <motion.div
        className="w-full max-w-md glass-card-glow-purple rounded-3xl p-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-textPri mb-2">Create Host Account</h2>
          <p className="text-brand-textSec text-sm">Register to build quizzes and run real-time game rooms</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textSec">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
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
                placeholder="Choose a password (min 6 chars)"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl pl-12 pr-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-brand-textPri font-bold shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-textSec">
          <span>Already have a host account? </span>
          <Link to="/login" className="text-brand-cyan font-bold hover:underline">
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
