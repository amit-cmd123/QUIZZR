import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/quizRoutes';
import roomRoutes from './routes/roomRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { getHistory } from './controllers/quizController';
import { authenticateToken } from './middleware/authMiddleware';

// Import Socket Handler
import { initSocketHandler } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS Config
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/api/history', authenticateToken, getHistory);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Socket.io Server Setup
const io = new Server(server, {
  cors: corsOptions
});

initSocketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
