"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomController_1 = require("../controllers/roomController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticateToken, roomController_1.createRoom);
router.get('/:code', roomController_1.getRoomByCode);
exports.default = router;
