"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const quizController_1 = require("./controllers/quizController");
const authMiddleware_1 = require("./middleware/authMiddleware");
// Import Socket Handler
const socketHandler_1 = require("./socket/socketHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// CORS Config
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// REST Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.get('/api/history', authMiddleware_1.authenticateToken, quizController_1.getHistory);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});
// Socket.io Server Setup
const io = new socket_io_1.Server(server, {
    cors: corsOptions
});
(0, socketHandler_1.initSocketHandler)(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
