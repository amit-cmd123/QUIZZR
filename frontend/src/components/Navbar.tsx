import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, History, Zap, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-brand-darkBg/60 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple shadow-lg shadow-brand-blue/30 group-hover:scale-105 transition-transform duration-300">
            <Zap className="h-5 w-5 text-white fill-white animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-300">
            QUIZZR
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20'
                    : 'text-brand-textSec hover:text-brand-textPri hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/history')
                    ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/20'
                    : 'text-brand-textSec hover:text-brand-textPri hover:bg-white/5'
                }`}
              >
                <History className="h-4 w-4" />
                Session History
              </Link>
              
              <div className="h-5 w-[1px] bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-surface border border-white/5">
                  <User className="h-4 w-4 text-brand-cyan" />
                  <span className="text-sm font-semibold text-brand-textPri">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-brand-danger bg-brand-danger/10 border border-brand-danger/20 hover:bg-brand-danger/20 hover:scale-105 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/join"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg shadow-brand-cyan/20 hover:scale-105 hover:shadow-brand-cyan/35 transition-all duration-300"
              >
                Join Room
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-brand-textSec hover:text-brand-textPri transition-colors duration-200"
              >
                Host Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-surface border border-white/10 text-brand-textPri hover:bg-brand-surface/80 hover:border-white/20 transition-all duration-200"
              >
                Host Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
