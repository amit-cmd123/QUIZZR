"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'quizzr-secret-key-12345';
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                passwordHash
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Internal server error during registration' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { loginId, password } = req.body; // loginId can be email or username
        if (!loginId || !password) {
            return res.status(400).json({ error: 'Email/Username and password are required' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email: loginId },
                    { username: loginId }
                ]
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (err) {
        console.error('GetMe error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMe = getMe;
