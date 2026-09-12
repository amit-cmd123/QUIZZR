"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.getQuizById = exports.getQuizzes = exports.createQuiz = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createQuiz = async (req, res) => {
    try {
        const { title, description, category, questions } = req.body;
        const hostId = req.user?.userId;
        if (!hostId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Quiz title, category and at least one question are required' });
        }
        // Use a transaction to create quiz, questions, options, and link correctOptionId
        const quiz = await prisma_1.default.$transaction(async (tx) => {
            const createdQuiz = await tx.quiz.create({
                data: {
                    title,
                    description,
                    category,
                    hostId
                }
            });
            for (const q of questions) {
                const { text, timer, points, options, correctOptionIndex } = q;
                if (!text || !options || !Array.isArray(options) || options.length !== 4 || correctOptionIndex === undefined) {
                    throw new Error('Each question must have text, 4 options, and a correct option index');
                }
                // Create question
                const question = await tx.question.create({
                    data: {
                        quizId: createdQuiz.id,
                        text,
                        timer: timer || 20,
                        points: points || 100
                    }
                });
                // Create options
                const createdOptions = [];
                for (const optText of options) {
                    const option = await tx.option.create({
                        data: {
                            questionId: question.id,
                            text: optText
                        }
                    });
                    createdOptions.push(option);
                }
                // Update correctOptionId
                const correctOption = createdOptions[correctOptionIndex];
                if (!correctOption) {
                    throw new Error('Invalid correct option index');
                }
                await tx.question.update({
                    where: { id: question.id },
                    data: { correctOptionId: correctOption.id }
                });
            }
            return createdQuiz;
        });
        const fullQuiz = await prisma_1.default.quiz.findUnique({
            where: { id: quiz.id },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });
        return res.status(201).json(fullQuiz);
    }
    catch (err) {
        console.error('CreateQuiz error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error during quiz creation' });
    }
};
exports.createQuiz = createQuiz;
const getQuizzes = async (req, res) => {
    try {
        const hostId = req.user?.userId;
        if (!hostId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const quizzes = await prisma_1.default.quiz.findMany({
            where: { hostId },
            include: {
                questions: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(quizzes);
    }
    catch (err) {
        console.error('GetQuizzes error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizzes = getQuizzes;
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        return res.json(quiz);
    }
    catch (err) {
        console.error('GetQuizById error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizById = getQuizById;
const getHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get quizzes hosted by user
        const hostedHistory = await prisma_1.default.room.findMany({
            where: {
                hostId: userId,
                status: 'ENDED'
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        category: true
                    }
                },
                players: {
                    orderBy: { score: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        // Get scores of user if they played in any quizzes (matched by user ID or username)
        const userObj = await prisma_1.default.user.findUnique({ where: { id: userId } });
        const username = userObj?.username || '';
        const playedHistory = await prisma_1.default.score.findMany({
            where: {
                OR: [
                    { userId },
                    { username }
                ]
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        category: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({
            hosted: hostedHistory,
            played: playedHistory
        });
    }
    catch (err) {
        console.error('GetHistory error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getHistory = getHistory;
