import mongoose from "mongoose";
import chatSessionModel from "../models/chatSession.model.js";
import { createChatSession, sendMessage } from "../services/chatbot.service.js";
import chatMessageModel from "../models/chatMessage.model.js";

export async function createSession(req, res, next) {
  try {
    const language = ["en", "hi", "hinglish"].includes(req.body?.language)
      ? req.body.language
      : "hinglish";

    const session = await createChatSession(req.user._id, language);

    return res.status(201).json({
      success: true,
      session: {
        id: session._id,
        language: session.language,
        currentStep: session.currentStep,
        pendingQuestion: session.pendingQuestion,
        status: session.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessageController(req, res, next) {
    try {
        const { sessionId } = req.params;

        const {
            content,
            step = null,
            values = null,
            sectionAction = null,
        } = req.body;

        if (!mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content is required.",
            });
        }

        if (step !== null && typeof step !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid workflow step.",
            });
        }

        if (
            values !== null &&
            (typeof values !== "object" || Array.isArray(values))
        ) {
            return res.status(400).json({
                success: false,
                message: "Form values must be an object.",
            });
        }

        const allowedActions = ["edit", "add", "edit_and_add"];

        if (
            sectionAction !== null &&
            !allowedActions.includes(sectionAction)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid section action.",
            });
        }

        const result = await sendMessage({
            userId: req.user._id,
            sessionId,
            content: content.trim(),
            step,
            values,
            sectionAction,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const getSession = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const sessions = await chatSessionModel.find({ userId })
            .select("_id title language currentStep status createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: sessions.length,
            conversations: sessions.map((session) => ({
                id: session._id,
                title: session.title || "New Conversation",
                language: session.language,
                currentStep: session.currentStep,
                status: session.status,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};


export const getMessageController = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        if (!mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await chatSessionModel
            .findOne({
                _id: sessionId,
                userId,
            })
            .lean();

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        // Fetch messages for this conversation only.
        const messages = await chatMessageModel
            .find({
                sessionId: session._id,
                userId,
            })
            .sort({ createdAt: 1 })
            .lean();

        // Find the latest assistant message containing resume download data.
        const latestResumeMessage = [...messages]
            .reverse()
            .find(
                (message) =>
                    message.role === "assistant" &&
                    message.downloadUrl
            );

        const resumeData = latestResumeMessage
            ? {
                  resumeId:
                      latestResumeMessage.resumeId?.toString() ?? null,

                  resumeVersionId:
                      latestResumeMessage.resumeVersionId?.toString() ?? null,

                  format: latestResumeMessage.format ?? "pdf",

                  downloadUrl: latestResumeMessage.downloadUrl,
              }
            : null;

        return res.status(200).json({
            success: true,
            conversation: {
                id: session._id.toString(),
                title: session.title || "New Conversation",
                language: session.language,
                currentStep: session.currentStep,
                pendingQuestion: session.pendingQuestion,
                requirements: session.requirements ?? {},
                messages,
                resume: resumeData,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            },
        });

    } catch (error) {
        next(error);
    }
};


