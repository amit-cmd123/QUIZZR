import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('quizzr_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user info:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (loginId: string, password: string) => {
    const response = await api.post('/auth/login', { loginId, password });
    const { token: receivedToken, user: receivedUser } = response.data;
    
    localStorage.setItem('quizzr_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const signup = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/signup', { username, email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('quizzr_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('quizzr_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
