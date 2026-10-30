import mongoose from "mongoose";

const { Schema } = mongoose;

const resumeContentSchema = new Schema(
    {
        personalInfo: Schema.Types.Mixed,
        professionalSummary: String,
        skills: [Schema.Types.Mixed],
        education: [Schema.Types.Mixed],
        experience: [Schema.Types.Mixed],
        internships: [Schema.Types.Mixed],
        projects: [Schema.Types.Mixed],
        achievements: [Schema.Types.Mixed],
        certifications: [Schema.Types.Mixed],
        links: Schema.Types.Mixed,
    },
    { _id: false }
);

const resumeVersionSchema = new Schema(
  {
    resumeId: {
        type: Schema.Types.ObjectId,
        ref: "Resume",
        required: true,
    },

    versionNumber: {
        type: Number,
        required: true,
        min: 1,
    },

    content: {
        type: resumeContentSchema,
        required: true,
    },

    changeType: {
        type: String,
        enum: ["manual", "ai_generated", "imported"],
        default: "manual",
    },

    changeNote: String,

    files: {
        pdfKey: String,
        docxKey: String,
        previewImageKey: String,
    },

    createdBy: {
        type: String,
        enum: ["user", "ai", "system"],
        default: "user",
    },
  },
  { timestamps: true }
);

resumeVersionSchema.index(
    { resumeId: 1, versionNumber: 1 },
    { unique: true }
);

resumeVersionSchema.index({ resumeId: 1, createdAt: -1 });

export default mongoose.model("ResumeVersion", resumeVersionSchema);