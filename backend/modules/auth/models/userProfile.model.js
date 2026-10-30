import mongoose from "mongoose";

const { Schema } = mongoose;

const skillSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", null],
            default: null,
        },
        verifiedByUser: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const educationSchema = new Schema({
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    isCurrentlyStudying: { type: Boolean, default: false },
    grade: String,
    description: String,
});

const experienceSchema = new Schema({
    organization: { type: String, trim: true },
    designation: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    isCurrentlyWorking: { type: Boolean, default: false },
    description: String,
    website: String,
    additionalNotes: String,
});

const internshipSchema = new Schema({
    organization: { type: String, trim: true },
    designation: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    description: String,
    website: String,
});

const projectSchema = new Schema({
    name: { type: String, trim: true },
    description: String,
    technologies: [String],
    githubUrl: String,
    liveUrl: String,
});

const achievementSchema = new Schema({
    title: { type: String, trim: true },
    description: String,
    date: Date,
});

const certificationSchema = new Schema({
    name: { type: String, trim: true },
    issuer: String,
    issueDate: Date,
    credentialUrl: String,
});

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    personalInfo: {
        fullName: { type: String, trim: true },
        email: { type: String, lowercase: true, trim: true },
        phone: String,
        location: String,
        headline: String,
    },

    professionalSummary: {
        type: String,
        trim: true,
        default: "",
    },

    targetRoles: [String],
    skills: [skillSchema],
    education: [educationSchema],
    experience: [experienceSchema],
    internships: [internshipSchema],
    projects: [projectSchema],
    achievements: [achievementSchema],
    certifications: [certificationSchema],

    links: {
        linkedin: String,
        github: String,
        portfolio: String,
        leetcode: String,
        other: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);