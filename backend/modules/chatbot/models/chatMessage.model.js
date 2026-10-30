import mongoose from "mongoose";

const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: "ChatSession",
        required: true,
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    role: {
        type: String,
        enum: ["user", "assistant", "tool", "system"],
        required: true,
    },

    messageType: {
        type: String,
        enum: ["text", "form", "form_submission", "system"],
        default: "text",
    },

    content: {
        type: String,
        default: "",
    },

    form: {
        type: {
            type: String,
            default: null,
        },
        schemaVersion: {
            type: String,
            default: null,
        },
    },
    downloadUrl: {
        type: String,
        default: null,
    },
    format: {
        type: String,
        enum: ["pdf", "docx", null],
        default: null,
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: "Resume",
        default: null,
    },
    resumeVersionId: {
        type: Schema.Types.ObjectId,
        ref: "ResumeVersion",
        default: null,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);