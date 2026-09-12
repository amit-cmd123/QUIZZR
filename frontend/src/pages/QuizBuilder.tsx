import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionForm {
  text: string;
  timer: number;
  points: number;
  options: string[];
  correctOptionIndex: number;
}

const QuizBuilder: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      text: '',
      timer: 20,
      points: 100,
      options: ['', '', '', ''],
      correctOptionIndex: 0,
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        timer: 20,
        points: 100,
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setError('Quiz Title is required.');
      return;
    }

    if (!category.trim()) {
      setError('Quiz Category is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} does not have any text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${j + 1} in Question ${i + 1} is empty.`);
          return;
        }
      }
    }

    try {
      setError(null);
      setIsSaving(true);

      await api.post('/quizzes', {
        title,
        description,
        category,
        questions,
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] w-full max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface border border-white/5 text-brand-textSec hover:text-brand-textPri hover:border-brand-purple/40 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-textPri">Quiz Builder</h1>
          <p className="text-brand-textSec text-sm">Design your custom question package.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Meta details card */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-brand-textPri border-b border-white/5 pb-2">Quiz Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Quiz Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Closures Trivia"
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl px-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl px-4 text-brand-textPri focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              >
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="General">General Knowledge</option>
                <option value="Programming">Programming</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for your quiz room."
              rows={3}
              className="w-full bg-brand-surface/40 border border-white/10 rounded-xl p-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all resize-none"
            />
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-textPri">Questions Checklist ({questions.length})</h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 px-4 h-10 bg-brand-surface border border-white/5 hover:border-brand-purple/40 text-brand-textPri rounded-xl text-sm font-semibold transition-all duration-200"
            >
              <Plus className="h-4 w-4 text-brand-purple" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <motion.div
              key={qIdx}
              className="glass-card rounded-2xl p-6 relative border-l-4 border-l-brand-purple"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="text-sm font-bold text-brand-purple uppercase tracking-wider">Question #{qIdx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/25 p-2 rounded-xl transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">Question Text</label>
                  <input
                    type="text"
                    required
                    value={q.text}
                    onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                    placeholder="Enter the question prompt here"
                    className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl px-4 text-brand-textPri placeholder-brand-textSec focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>

                {/* Configurations */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Timer (seconds)
                    </label>
                    <select
                      value={q.timer}
                      onChange={(e) => handleQuestionChange(qIdx, 'timer', parseInt(e.target.value))}
                      className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl px-4 text-brand-textPri focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    >
                      <option value={10}>10 Seconds</option>
                      <option value={15}>15 Seconds</option>
                      <option value={20}>20 Seconds</option>
                      <option value={30}>30 Seconds</option>
                      <option value={45}>45 Seconds</option>
                      <option value={60}>60 Seconds</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      Points
                    </label>
                    <select
                      value={q.points}
                      onChange={(e) => handleQuestionChange(qIdx, 'points', parseInt(e.target.value))}
                      className="w-full h-12 bg-brand-surface/40 border border-white/10 rounded-xl px-4 text-brand-textPri focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    >
                      <option value={50}>50 Points</option>
                      <option value={100}>100 Points</option>
                      <option value={150}>150 Points</option>
                      <option value={200}>200 Points</option>
                      <option value={300}>300 Points</option>
                    </select>
                  </div>
                </div>

                {/* Options and selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-textSec uppercase tracking-wider">
                    Options & Correct Answer Choice
                  </label>
                  
                  <div className="space-y-2.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-option-${qIdx}`}
                          checked={q.correctOptionIndex === oIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', oIdx)}
                          className="h-5 w-5 accent-brand-purple cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className={`flex-1 h-11 border rounded-xl px-4 text-sm text-brand-textPri placeholder-brand-textSec focus:outline-none transition-all ${
                            q.correctOptionIndex === oIdx
                              ? 'bg-brand-purple/10 border-brand-purple/50 focus:border-brand-purple'
                              : 'bg-brand-surface/20 border-white/5 focus:border-brand-purple/40'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-4 border-t border-white/5 pt-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 h-12 bg-brand-surface border border-white/10 rounded-xl text-brand-textPri font-bold hover:bg-brand-surface/80 hover:border-white/20 transition-all duration-200"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 h-12 bg-gradient-to-r from-brand-blue to-brand-purple text-brand-textPri font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200"
          >
            {isSaving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Quiz Package</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;
