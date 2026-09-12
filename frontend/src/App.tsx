import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HostDashboard from './pages/HostDashboard';
import QuizBuilder from './pages/QuizBuilder';
import PlayerJoin from './pages/PlayerJoin';
import RoomLobby from './pages/RoomLobby';
import LiveQuiz from './pages/LiveQuiz';
import FinalResults from './pages/FinalResults';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SessionHistory from './pages/SessionHistory';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-brand-darkBg text-brand-textPri relative z-0 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Routes */}
        <main className="flex-1 w-full relative">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/join" element={<PlayerJoin />} />
            <Route path="/lobby/:code" element={<RoomLobby />} />
            <Route path="/play/:code" element={<LiveQuiz />} />
            <Route path="/results/:code" element={<FinalResults />} />
            
            {/* Protected Host Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <ProtectedRoute>
                  <QuizBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:quizId"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <SessionHistory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
