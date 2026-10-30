
import { StateSchema, MessagesValue } from "@langchain/langgraph";
import { z } from "zod";

import {WORKFLOW_INTENTS,WORKFLOW_STEPS,APPROVAL_STATUS,EXPERIENCE_TYPES,} from "../constants/workflow.constants.js";

const requirementSchema = z.object({
    status: z.enum([
        "pending",
        "in_progress",
        "answered",
        "completed",
        "confirmed",
        "not_applicable",
    ]).default("pending"),

    value: z.unknown().optional(),

    updatedAt: z.string().nullable().default(null),
}).default({
    status: "pending",
    updatedAt: null,
});

const requirementsSchema = z.object({
    targetRole: requirementSchema,
    skills: requirementSchema,
    experienceType: requirementSchema,
    education: requirementSchema,
    experience: requirementSchema,
    internships: requirementSchema,
    projects: requirementSchema,
    achievements: requirementSchema,
    certifications: requirementSchema,
    professionalSummary: requirementSchema,
    links: requirementSchema,
});

const emptyRequirement = () => ({
    status: "pending",
    value: undefined,
    updatedAt: null,
});

export const ResumeWorkflowState = new StateSchema({
    
    userId: z.string(),
    sessionId: z.string(),

    resumeId: z.string().nullable().default(null),

    resumeVersionId: z.string().nullable().default(null),

    downloadUrl: z.string().nullable().default(null),

    fileName: z.string().nullable().default(null),

    format: z.enum(["pdf", "docx"]).nullable().default(null),

    pageCount: z.number().nullable().default(null),

    persistenceStatus: z.string().nullable().default(null),

    content: z.unknown().nullable().default(null),

    intent: z.enum([
        WORKFLOW_INTENTS.UNDECIDED,
        WORKFLOW_INTENTS.CREATE_RESUME,
        WORKFLOW_INTENTS.UPDATE_RESUME,
        WORKFLOW_INTENTS.IMPROVE_RESUME,
    ]).default(WORKFLOW_INTENTS.UNDECIDED),

    profile: z.record(z.string(), z.unknown()).default({}),

    requirements: requirementsSchema.default(() => ({
        targetRole: emptyRequirement(),
        skills: emptyRequirement(),
        experienceType: emptyRequirement(),
        education: emptyRequirement(),
        experience: emptyRequirement(),
        internships: emptyRequirement(),
        projects: emptyRequirement(),
        achievements: emptyRequirement(),
        certifications: emptyRequirement(),
        professionalSummary: emptyRequirement(),
        links: emptyRequirement(),
    })),

    currentStep: z.enum([
        ...Object.values(WORKFLOW_STEPS),
    ]).default(WORKFLOW_STEPS.GREETING),

    pendingQuestion: z.string().nullable().default(null),

    experienceType: z.enum([
        EXPERIENCE_TYPES.FRESHER,
        EXPERIENCE_TYPES.EXPERIENCED,
    ]).nullable().default(null),

    approvalStatus: z.enum([
        ...Object.values(APPROVAL_STATUS),
    ]).default(APPROVAL_STATUS.NOT_REQUIRED),

    // PDF is the default. DOCX is generated only when requested.
    requestedFormat: z.enum([
        "pdf",
        "docx",
    ]).default("pdf"),

    // If true, compact layout is attempted for a strict one-page resume.
    singlePageOnly: z.boolean().default(false),

    extractedInfo: z.record(
        z.string(),
        z.unknown()
    ).nullable().default(null),

    formStep: z.string().nullable().default(null),

    formValues: z.record(
        z.string(),
        z.unknown()
    ).nullable().default(null),

    sectionToEdit: z.string().nullable().default(null),

    sectionAction: z.enum([
        "edit",
        "add",
        "edit_and_add",
    ]).nullable().default(null),

    messages: MessagesValue,
});
