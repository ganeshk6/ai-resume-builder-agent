import mongoose from "mongoose";

const { Schema } = mongoose;


const requirementSchema = new Schema(
    {
        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "answered",
                "completed",
                "confirmed",
                "not_applicable",
            ],
            default: "pending",
        },

        value: {
            type: Schema.Types.Mixed,
            default: null,
        },

        askedAt: Date,
        confirmedAt: Date,
        updatedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);


const chatSessionSchema = new Schema(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        trim: true,
        default: "New Conversation",
        maxlength: 100,
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: "Resume",
        default: null,
    },

    language: {
        type: String,
        enum: ["en", "hi", "hinglish", "other", "auto"],
        default: "en",
    },

    intent: {
        type: String,
        enum: [
            "undecided",
            "create_resume",
            "update_resume",
            "improve_resume"
        ],
        default: "undecided"
    },

    targetRole: {
        type: String,
        default: null,
    },

    experienceType: {
        type: String,
        enum: ["fresher", "experienced", null],
        default: null,
    },

    currentStep: {
        type: String,
        default: "greeting",
    },

    status: {
        type: String,
        enum: ["active", "collecting", "review", "completed", "abandoned"],
        default: "active",
    },

    approvalStatus: {
        type: String,
        enum: ["not_required", "pending", "approved", "rejected"],
        default: "not_required",
    },

    requestedFormat: {
        type: String,
        enum: ["pdf", "docx"],
        default: "pdf",
    },

    singlePageOnly: {
        type: Boolean,
        default: false,
    },
    
    requirements: {
        targetRole: {
            type: requirementSchema,
            default: () => ({}),
        },
        skills: {
            type: requirementSchema,
            default: () => ({}),
        },
        experienceType: {
            type: requirementSchema,
            default: () => ({}),
        },
        education: {
            type: requirementSchema,
            default: () => ({}),
        },
        experience: {
            type: requirementSchema,
            default: () => ({}),
        },
        internships: {
            type: requirementSchema,
            default: () => ({}),
        },
        projects: {
            type: requirementSchema,
            default: () => ({}),
        },
        achievements: {
            type: requirementSchema,
            default: () => ({}),
        },
        certifications: {
            type: requirementSchema,
            default: () => ({}),
        },
        professionalSummary: {
            type: requirementSchema,
            default: () => ({}),
        },
        links: {
            type: requirementSchema,
            default: () => ({}),
        },
    },

    pendingForm: {
        type: {
            type: String,
            default: null,
        },
        section: {
            type: String,
            default: null,
        },
        schemaVersion: {
            type: String,
            default: null,
        },
    },
    pendingQuestion: {
        type: String,
        default: null,
    },
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model("ChatSession", chatSessionSchema);