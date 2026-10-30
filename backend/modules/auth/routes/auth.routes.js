import express from "express";
import { getUserprofile, googleLogin, login, register, logout } from "../controllers/auth.controller.js";
import authMiddleware from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", authMiddleware, getUserprofile)

export default router;