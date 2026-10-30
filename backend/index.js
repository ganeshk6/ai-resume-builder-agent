import express from "express";
import dotenv from "dotenv";
import { mongoDB } from "./config/db.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from 'morgan'
import chatbotRoutes from "./modules/chatbot/routes/chatbot.routes.js";
import resumeRoutes from "./modules/resumes/routes/downloadResume.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json())

app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server started successfully"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume-chat", chatbotRoutes);
app.use("/api/resumes", resumeRoutes);

app.listen(PORT, () => {
    mongoDB()
    console.log(`Server started on port ${PORT}`);
});
