"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/:quizId', authMiddleware_1.authenticateToken, analyticsController_1.getQuizAnalytics);
exports.default = router;
