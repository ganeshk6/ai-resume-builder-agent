
import { Router } from "express";
import authMiddleware from "../../../middleware/auth.middleware.js";
import { createSession, sendMessageController, getSession, getMessageController } from "../controllers/chatbot.controller.js";

const router = Router();

router.get("/sessions",authMiddleware,getSession);
router.get("/sessions/:sessionId/messages",authMiddleware,getMessageController);
router.post("/sessions", authMiddleware, createSession);
router.post("/sessions/:sessionId/messages",authMiddleware,sendMessageController);

export default router;
