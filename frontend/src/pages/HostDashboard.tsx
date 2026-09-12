import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Play, BarChart3, HelpCircle, Calendar, Tag, ArrowRight, Library } from 'lucide-react';
import { motion } from 'framer-motion';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  questions: { id: string }[];
}

const HostDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoomId, setCreatingRoomId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartRoom = async (quizId: string) => {
    try {
      setCreatingRoomId(quizId);
      const response = await api.post('/rooms', { quizId });
      const { code } = response.data;
      navigate(`/lobby/${code}`);
    } catch (err) {
      console.error('Failed to start room:', err);
      alert('Could not start live room. Please try again.');
    } finally {
      setCreatingRoomId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-7xl mx-auto px-6 py-12">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-textPri tracking-tight mb-2">Host Panel</h1>
          <p className="text-brand-textSec">Create and manage your custom quiz collection, monitor analytics, and host live games.</p>
        </div>
        <Link
          to="/builder"
          className="flex items-center gap-2 px-6 h-12 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl text-brand-textPri font-bold shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 self-start md:self-auto"
        >
          <Plus className="h-5 w-5" />
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
            <p className="text-brand-textSec text-sm">Loading quizzes...</p>
          </div>
        </div>
      ) : quizzes.length === 0 ? (
        /* Empty State */
        <motion.div 
          className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Library className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-2xl font-bold text-brand-textPri mb-2">No Quizzes Found</h3>
          <p className="text-brand-textSec mb-8 leading-relaxed">
            You haven't built any quizzes yet. Start by creating your first MCQ quiz. Add categories, set timers, and define speed points.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-6 h-12 bg-brand-surface border border-white/10 rounded-xl text-brand-textPri font-bold hover:bg-brand-surface/80 hover:border-brand-purple/40 transition-all duration-200"
          >
            Create Your First Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        /* Quiz Grid */
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {quizzes.map((quiz) => (
            <motion.div 
              key={quiz.id} 
              variants={cardVariants}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-brand-darkBg"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold">
                    <Tag className="h-3 w-3" />
                    {quiz.category}
                  </span>
                  <span className="text-xs text-brand-textSec flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-brand-textPri mb-2 line-clamp-1">{quiz.title}</h3>
                <p className="text-sm text-brand-textSec mb-6 line-clamp-2 leading-relaxed">
                  {quiz.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 text-sm text-brand-textSec border-t border-white/5 pt-4 mb-6">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-brand-purple" />
                    <span className="font-bold text-brand-textPri">{quiz.questions.length}</span> Questions
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartRoom(quiz.id)}
                    disabled={creatingRoomId !== null}
                    className="flex items-center justify-center gap-1.5 h-11 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-md shadow-brand-blue/15 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200"
                  >
                    {creatingRoomId === quiz.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-white" />
                        <span>Host Live</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/analytics/${quiz.id}`}
                    className="flex items-center justify-center gap-1.5 h-11 bg-brand-surface border border-white/5 text-brand-textPri rounded-xl text-sm font-bold hover:bg-brand-surface/75 hover:border-brand-purple/30 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4 text-brand-purple" />
                    <span>Analytics</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default HostDashboard;
