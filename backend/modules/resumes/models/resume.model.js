import mongoose from "mongoose";

const { Schema } = mongoose;

const resumeSchema = new Schema(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    targetRole: {
        type: String,
        required: true,
        trim: true,
    },

    templateId: {
        type: Schema.Types.ObjectId,
        ref: "Template",
        default: null,
    },

    status: {
        type: String,
        enum: ["draft", "generating", "ready", "archived"],
        default: "draft",
    },

    currentVersionId: {
        type: Schema.Types.ObjectId,
        ref: "ResumeVersion",
        default: null,
    },

    source: {
        type: {
            type: String,
            enum: ["manual", "uploaded", "ai_generated"],
            default: "manual",
        },
        originalFileKey: {
            type: String,
            default: null,
        },
    },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model("Resume", resumeSchema);