
import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { ChatOpenRouter } from "@langchain/openrouter";
import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";

import Resume from "../resumes/models/resume.model.js";
import ResumeVersion from "../resumes/models/resumeVersion.model.js";
import ChatSession from "../chatbot/models/chatSession.model.js";
import UserProfile from "../auth/models/userProfile.model.js";

const OUTPUT_DIR = path.resolve(
    process.cwd(),
    "storage",
    "generated-resumes"
);

const DOWNLOAD_BASE_URL =
    process.env.API_BASE_URL || "http://localhost:3001";

const llm = new ChatOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "openai/gpt-4o-mini",
    temperature: 0,
});

const ResumeContentSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().default(""),
        email: z.string().default(""),
        phone: z.string().default(""),
        location: z.string().default(""),
        headline: z.string().default(""),
    }).default({}),

    professionalSummary: z.string().default(""),

    skills: z.array(
        z.object({
            name: z.string(),
            category: z.string().default(""),
        })
    ).default([]),

    education: z.array(
        z.object({
            degree: z.string().nullable().default(null),
            institution: z.string().nullable().default(null),
            graduationYear: z.string().nullable().default(null),
            grade: z.string().nullable().default(null),
        }).strip()
    ).default([]),

    experience: z.array(
        z.object({
            company: z.string(),
            designation: z.string().default(""),
            startDate: z.string().default(""),
            endDate: z.string().default(""),
            description: z.array(z.string()).default([]),
        })
    ).default([]),

    internships: z.array(
        z.object({
            organization: z.string(),
            designation: z.string().default(""),
            description: z.array(z.string()).default([]),
        })
    ).default([]),

    projects: z.array(
        z.object({
            name: z.string(),
            description: z.array(z.string()).default([]),
            technologies: z.array(z.string()).default([]),
        })
    ).default([]),

    achievements: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),

    links: z.object({
        linkedin: z.string().default(""),
        github: z.string().default(""),
        portfolio: z.string().default(""),
        other: z.array(z.string()).default([]),
    }).default({
        linkedin: "",
        github: "",
        portfolio: "",
        other: [],
    }),
});

const resumeLLM = llm.withStructuredOutput(ResumeContentSchema);

function clean(value) {
    return typeof value === "string" ? value.trim() : "";
}

function toPlainObject(value) {
    if (!value) return {};

    if (typeof value.toObject === "function") {
        return value.toObject();
    }

    return value;
}

function normalizeContent(content = {}) {
    const text = (value) => {
        if (typeof value === "string") return value.trim();

        if (value && typeof value === "object") {
            if (typeof value.title === "string") {
                return value.title.trim();
            }

            if (typeof value.description === "string") {
                return value.description.trim();
            }
        }

        return "";
    };

    return {
        personalInfo: content.personalInfo ?? {},
        professionalSummary: text(content.professionalSummary),

        skills: Array.isArray(content.skills)
            ? content.skills
            : [],

        education: Array.isArray(content.education)
            ? content.education
            : [],

        experience: Array.isArray(content.experience)
            ? content.experience
            : [],

        internships: Array.isArray(content.internships)
            ? content.internships
            : [],

        projects: Array.isArray(content.projects)
            ? content.projects
            : [],

        achievements: Array.isArray(content.achievements)
            ? content.achievements.map(text).filter(Boolean)
            : [],

        certifications: Array.isArray(content.certifications)
            ? content.certifications.map(text).filter(Boolean)
            : [],

        links: content.links ?? {
            linkedin: "",
            github: "",
            portfolio: "",
            other: [],
        },
    };
}

function removeDuplicates(items, getKey) {
    const seen = new Set();

    return items.filter((item) => {
        const key = getKey(item).toLowerCase().trim();

        if (!key || seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

function deduplicateResumeContent(content) {
    content.skills = removeDuplicates(
        content.skills,
        (item) => item.name
    );

    content.projects = removeDuplicates(
        content.projects,
        (item) => item.name
    );

    content.education = removeDuplicates(
        content.education,
        (item) => `${item.degree}-${item.institution}`
    );

    content.internships = removeDuplicates(
        content.internships,
        (item) => `${item.organization}-${item.designation}`
    );

    content.achievements = removeDuplicates(
        content.achievements,
        (item) => item
    );

    content.certifications = removeDuplicates(
        content.certifications,
        (item) => item
    );

    return content;
}

function getRequirementValue(requirements, key) {
    const item = requirements?.[key];

    if (!item) return null;

    // Requirement object: { status, value, updatedAt }
    if (
        typeof item === "object" &&
        !Array.isArray(item) &&
        Object.prototype.hasOwnProperty.call(item, "value")
    ) {
        return item.value;
    }

    return item;
}

function buildResumePrompt(state) {
    const requirements = state.requirements ?? {};

    const data = {
        targetRole: getRequirementValue(requirements, "targetRole"),

        experienceType:
            state.experienceType ??
            getRequirementValue(requirements, "experienceType"),

        skills: getRequirementValue(requirements, "skills") ?? [],
        education: getRequirementValue(requirements, "education") ?? [],
        experience: getRequirementValue(requirements, "experience") ?? [],
        internships: getRequirementValue(requirements, "internships") ?? [],
        projects: getRequirementValue(requirements, "projects") ?? [],
        achievements: getRequirementValue(requirements, "achievements") ?? [],
        certifications: getRequirementValue(requirements, "certifications") ?? [],
        professionalSummary: getRequirementValue(
            requirements,
            "professionalSummary"
        ),
        links: getRequirementValue(requirements, "links") ?? {},
    };

    return `
You are a professional resume formatter.

Create a resume using ONLY the information supplied in CURRENT CHAT DATA.

STRICT RULES:
1. Use only the facts provided in CURRENT CHAT DATA.
2. Never use previous conversations, old resumes, database profile data,
   or information from external sources.
3. Never invent employers, job titles, dates, projects, internships,
   certifications, achievements, skills or qualifications.
4. Do not add generic skills such as communication, teamwork,
   problem solving or analytical thinking unless explicitly provided.
5. Do not add projects or internships that are not in CURRENT CHAT DATA.
6. Do not duplicate skills, projects, education or achievements.
7. Preserve the original meaning of all user-provided information.
8. Do not change company names and job titles.
9. Keep missing fields empty.
10. Do not generate additional content to make the resume look impressive.
11. Return only data matching the supplied resume schema.

CURRENT CHAT DATA:
${JSON.stringify(data, null, 2)}
`;
}

function buildImprovementPrompt({
    existingContent,
    targetRole,
    userRequest,
    singlePageOnly,
}) {
    return `
You are an expert resume editor and ATS optimization specialist.

Improve the EXISTING resume, rather than creating an unrelated resume.

Rules:
1. Preserve factual information from the existing resume.
2. Never invent employers, dates, metrics, skills, qualifications or projects.
3. Improve grammar, clarity, professional wording and ATS readability.
4. Use concise bullet points without adding unsupported claims.
5. Remove unnecessary repetition while preserving meaningful details.
6. Keep personal information and links unchanged unless explicitly requested.
7. Do not remove relevant qualifications without a clear reason.
8. Tailor wording to the target role using existing facts only.
9. Return data matching the application's resume schema.
10. Achievements and certifications must be arrays of strings.
11. Do not include Markdown fences or commentary.
12. Leave missing information empty.
${singlePageOnly ? `
13. Prefer concise wording suitable for a one-page resume.
    Do not invent information or silently remove important qualifications.
` : ""}

TARGET ROLE:
${targetRole || "Use the existing resume's target role"}

USER'S REQUEST:
${userRequest || "Improve professionalism and ATS readability."}

EXISTING RESUME:
${JSON.stringify(existingContent, null, 2)}
`;
}

function toResumeVersionContent(content) {
    return {
        personalInfo: content.personalInfo,
        professionalSummary: content.professionalSummary,
        skills: content.skills,
        education: content.education,
        experience: content.experience,
        internships: content.internships,
        projects: content.projects,
        achievements: content.achievements,
        certifications: content.certifications,
        links: content.links,
    };
}

// ---------------- PDF helpers ----------------

function addPdfText(doc, value, options = {}) {
    const text = clean(value);
    if (!text) return;

    doc.text(text, {
        width:
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right,
        lineGap: 1,
        paragraphGap: 2,
        ...options,
    });
}

function addPdfSection(doc, title, compact) {
    doc.moveDown(compact ? 0.25 : 0.5);

    doc.font("Helvetica-Bold")
        .fontSize(compact ? 10 : 11)
        .text(title.toUpperCase());

    doc.moveDown(compact ? 0.1 : 0.2);

    doc.font("Helvetica")
        .fontSize(compact ? 8.5 : 9.5);
}

function addPdfBullet(doc, value, compact) {
    const text = clean(value);
    if (!text) return;

    addPdfText(doc, `•  ${text}`, {
        indent: compact ? 5 : 10,
        lineGap: compact ? 0 : 1,
        paragraphGap: compact ? 1 : 3,
    });
}

function renderPdf(content, { compact = false } = {}) {
    const margins = compact
        ? { top: 24, bottom: 24, left: 30, right: 30 }
        : { top: 42, bottom: 42, left: 45, right: 45 };

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margins,
            compress: true,
            info: {
                Title: `${content.personalInfo.fullName || "Resume"} - Resume`,
                Author: content.personalInfo.fullName || "Resume Builder",
            },
        });

        const chunks = [];
        let pageCount = 1;

        doc.on("pageAdded", () => pageCount++);
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("error", reject);

        doc.on("end", () => {
            resolve({
                buffer: Buffer.concat(chunks),
                pageCount,
            });
        });

        const info = content.personalInfo ?? {};
        const fontSize = compact ? 8.5 : 10;

        doc.font("Helvetica-Bold")
            .fontSize(compact ? 15 : 19)
            .text(info.fullName || "Resume", { align: "center" });

        const contact = [
            info.headline,
            info.email,
            info.phone,
            info.location,
        ].filter(Boolean).join(" | ");

        if (contact) {
            doc.moveDown(0.15);
            doc.font("Helvetica")
                .fontSize(compact ? 7.5 : 9)
                .text(contact, { align: "center" });
        }

        const links = Object.values(content.links ?? {})
            .flatMap((value) => Array.isArray(value) ? value : [value])
            .filter((value) => typeof value === "string" && value.trim());

        if (links.length) {
            doc.moveDown(0.15);
            doc.font("Helvetica")
                .fontSize(compact ? 7.5 : 8.5)
                .text(links.join(" | "), { align: "center" });
        }

        doc.moveDown(compact ? 0.25 : 0.45);
        doc.font("Helvetica").fontSize(fontSize);

        if (content.professionalSummary) {
            addPdfSection(doc, "Professional Summary", compact);
            addPdfText(doc, content.professionalSummary);
        }

        if (content.skills.length) {
            addPdfSection(doc, "Skills", compact);
            addPdfText(
                doc,
                content.skills.map((skill) =>
                    skill.category
                        ? `${skill.category}: ${skill.name}`
                        : skill.name
                ).join(" | ")
            );
        }

        if (content.experience.length) {
            addPdfSection(doc, "Experience", compact);

            for (const item of content.experience) {
                doc.font("Helvetica-Bold").text(
                    [item.designation, item.company]
                        .filter(Boolean)
                        .join(" — ")
                );

                const dates = [item.startDate, item.endDate]
                    .filter(Boolean)
                    .join(" - ");

                if (dates) {
                    doc.font("Helvetica-Oblique").text(dates);
                }

                doc.font("Helvetica");

                for (const bullet of item.description ?? []) {
                    addPdfBullet(doc, bullet, compact);
                }
            }
        }

        if (content.internships.length) {
            addPdfSection(doc, "Internships", compact);

            for (const item of content.internships) {
                doc.font("Helvetica-Bold").text(
                    [item.designation, item.organization]
                        .filter(Boolean)
                        .join(" — ")
                );

                doc.font("Helvetica");

                for (const bullet of item.description ?? []) {
                    addPdfBullet(doc, bullet, compact);
                }
            }
        }

        if (content.projects.length) {
            addPdfSection(doc, "Projects", compact);

            for (const project of content.projects) {
                doc.font("Helvetica-Bold").text(project.name || "Project");
                doc.font("Helvetica");

                for (const bullet of project.description ?? []) {
                    addPdfBullet(doc, bullet, compact);
                }

                if (project.technologies?.length) {
                    addPdfText(
                        doc,
                        `Technologies: ${project.technologies.join(", ")}`
                    );
                }
            }
        }

        if (content.education.length) {
            addPdfSection(doc, "Education", compact);

            for (const item of content.education) {
                doc.font("Helvetica-Bold").text(
                    [item.degree, item.institution]
                        .filter(Boolean)
                        .join(" — ")
                );

                doc.font("Helvetica");

                const details = [
                    item.graduationYear,
                    item.grade,
                ].filter(Boolean).join(" | ");

                if (details) addPdfText(doc, details);
            }
        }

        for (const [key, title] of [
            ["certifications", "Certifications"],
            ["achievements", "Achievements"],
        ]) {
            if (content[key].length) {
                addPdfSection(doc, title, compact);

                for (const item of content[key]) {
                    addPdfBullet(doc, item, compact);
                }
            }
        }

        doc.end();
    });
}

// ---------------- DOCX helpers ----------------

function resumeToDocxParagraphs(content, compact) {
    const paragraphs = [];
    const spacingAfter = compact ? 50 : 100;

    function addText(value, options = {}) {
        const text = clean(value);
        if (!text) return;

        paragraphs.push(new Paragraph({
            spacing: { after: spacingAfter },
            children: [
                new TextRun({
                    text,
                    bold: Boolean(options.bold),
                    size: options.size ?? (compact ? 17 : 20),
                    font: "Arial",
                }),
            ],
        }));
    }

    function addSection(title) {
        paragraphs.push(new Paragraph({
            spacing: {
                before: compact ? 90 : 180,
                after: compact ? 40 : 80,
            },
            children: [
                new TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: compact ? 18 : 21,
                    font: "Arial",
                }),
            ],
        }));
    }

    function addBullet(value) {
        const text = clean(value);
        if (!text) return;

        paragraphs.push(new Paragraph({
            bullet: { level: 0 },
            spacing: { after: spacingAfter },
            children: [
                new TextRun({
                    text,
                    size: compact ? 17 : 20,
                    font: "Arial",
                }),
            ],
        }));
    }

    const info = content.personalInfo ?? {};

    addText(info.fullName || "Resume", {
        bold: true,
        size: compact ? 30 : 36,
    });

    addText([
        info.headline,
        info.email,
        info.phone,
        info.location,
    ].filter(Boolean).join(" | "), {
        size: compact ? 16 : 18,
    });

    const links = Object.values(content.links ?? {})
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value) => typeof value === "string" && value.trim());

    if (links.length) addText(links.join(" | "));

    if (content.professionalSummary) {
        addSection("Professional Summary");
        addText(content.professionalSummary);
    }

    if (content.skills.length) {
        addSection("Skills");
        addText(content.skills.map((skill) =>
            skill.category ? `${skill.category}: ${skill.name}` : skill.name
        ).join(" | "));
    }

    if (content.experience.length) {
        addSection("Experience");

        for (const item of content.experience) {
            addText(
                [item.designation, item.company].filter(Boolean).join(" — "),
                { bold: true }
            );

            addText(
                [item.startDate, item.endDate].filter(Boolean).join(" - ")
            );

            for (const bullet of item.description ?? []) addBullet(bullet);
        }
    }

    if (content.internships.length) {
        addSection("Internships");

        for (const item of content.internships) {
            addText(
                [item.designation, item.organization]
                    .filter(Boolean)
                    .join(" — "),
                { bold: true }
            );

            for (const bullet of item.description ?? []) addBullet(bullet);
        }
    }

    if (content.projects.length) {
        addSection("Projects");

        for (const project of content.projects) {
            addText(project.name, { bold: true });

            for (const bullet of project.description ?? []) addBullet(bullet);

            if (project.technologies?.length) {
                addText(`Technologies: ${project.technologies.join(", ")}`);
            }
        }
    }

    if (content.education.length) {
        addSection("Education");

        for (const item of content.education) {
            addText(
                [item.degree, item.institution].filter(Boolean).join(" — "),
                { bold: true }
            );

            addText(
                [item.graduationYear, item.grade].filter(Boolean).join(" | ")
            );
        }
    }

    for (const [key, title] of [
        ["certifications", "Certifications"],
        ["achievements", "Achievements"],
    ]) {
        if (content[key].length) {
            addSection(title);
            for (const item of content[key]) addBullet(item);
        }
    }

    return paragraphs;
}

async function renderDocx(content, compact = false) {
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    size: { width: 11906, height: 16838 },
                    margin: compact
                        ? {
                            top: 360,
                            bottom: 360,
                            left: 480,
                            right: 480,
                        }
                        : {
                            top: 720,
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                },
            },
            children: resumeToDocxParagraphs(content, compact),
        }],
    });

    return Packer.toBuffer(doc);
}

// ---------------- Main generation node ----------------

export async function generateResumeNode(state) {
    const { userId, sessionId } = state;

    if (!userId || !sessionId) {
        throw new Error("userId and sessionId are required.");
    }

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is missing.");
    }

    const session = await ChatSession.findOne({
        _id: sessionId,
        userId,
    });

    if (!session) {
        throw new Error("Chat session not found.");
    }

    if (state.approvalStatus !== "approved") {
        throw new Error("Resume generation requires user approval.");
    }

    const isImprovement = state.intent === "update_resume" || state.intent === "improve_resume";

    // Prefer the session's selected resume, then the workflow state.
    const requestedResumeId =
        state.resumeId ?? session.resumeId ?? null;

    const workflowState = {
        ...state,
        profile: {},
    };

    let existingResume = null;
    let existingVersion = null;
    let existingContent = {};

    if (isImprovement) {
        if (!requestedResumeId) {
            throw new Error(
                "No existing resume is selected. Please select a resume to improve."
            );
        }

        existingResume = await Resume.findOne({
            _id: requestedResumeId,
            userId,
        });

        if (!existingResume) {
            throw new Error(
                "The selected resume was not found for this user."
            );
        }

        if (!existingResume.currentVersionId) {
            throw new Error("The selected resume has no current version.");
        }

        existingVersion = await ResumeVersion.findOne({
            _id: existingResume.currentVersionId,
            resumeId: existingResume._id,
        }).lean();

        if (!existingVersion) {
            throw new Error("The current resume version was not found.");
        }

        existingContent = toPlainObject(existingVersion.content);
    }

    const requestedTargetRole =
        clean(state.requirements?.targetRole?.value) ||
        clean(state.requirements?.targetRole) ||
        clean(state.extractedInfo?.targetRole) ||
        clean(existingResume?.targetRole);

    if (!isImprovement && !requestedTargetRole) {
        throw new Error(
            "Target role is missing. Complete the resume requirements first."
        );
    }

    const lastHumanMessage = (state.messages ?? [])
        .filter((message) => {
            if (typeof message?.getType === "function") {
                return message.getType() === "human";
            }

            return message?.type === "human" ||
                message?.role === "user";
        })
        .at(-1);

    const userRequest =
        typeof lastHumanMessage?.content === "string"
            ? lastHumanMessage.content
            : "";

    const singlePageOnly = state.singlePageOnly === true;

    const prompt = isImprovement
        ? buildImprovementPrompt({
            existingContent,
            targetRole: requestedTargetRole,
            userRequest,
            singlePageOnly,
        })
        : buildResumePrompt(state);

    const generated = await resumeLLM.invoke(prompt);

    let content = normalizeContent(generated);

    content = deduplicateResumeContent(content);

    // Preserve existing personal information during improvement.
    
    const oldPersonalInfo = existingContent.personalInfo ?? {};
    const generatedPersonalInfo = content.personalInfo ?? {};

    const personalInfoFields = [
        "fullName",
        "email",
        "phone",
        "location",
        "headline",
    ];

    content.personalInfo = {};

    for (const key of personalInfoFields) {
        content.personalInfo[key] =
            clean(oldPersonalInfo[key]) ||
            clean(generatedPersonalInfo[key]);
    }

    // Preserve existing links during resume improvement.
    if (isImprovement) {
        const oldLinks = existingContent.links ?? {};
        const newLinks = content.links ?? {};

        content.links = {
            linkedin: clean(oldLinks.linkedin) || clean(newLinks.linkedin),
            github: clean(oldLinks.github) || clean(newLinks.github),
            portfolio: clean(oldLinks.portfolio) || clean(newLinks.portfolio),
            other: Array.isArray(oldLinks.other) && oldLinks.other.length
                ? oldLinks.other
                : (newLinks.other ?? []),
        };
    }

    const targetRole = requestedTargetRole || "Professional";
    const requestedFormat = state.requestedFormat === "docx"
        ? "docx"
        : "pdf";

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const fileName = `${crypto.randomUUID()}.${requestedFormat}`;
    const absolutePath = path.join(OUTPUT_DIR, fileName);

    let buffer;
    let pageCount = null;

    if (requestedFormat === "pdf") {
        let rendered;

        if (singlePageOnly) {
            rendered = await renderPdf(content, { compact: true });
        } else {
            rendered = await renderPdf(content, { compact: false });

            if (rendered.pageCount > 1) {
                rendered = await renderPdf(content, { compact: true });
            }
        }

        if (singlePageOnly && rendered.pageCount > 1) {
            throw new Error(
                "The resume still exceeds one page. Please reduce content and try again."
            );
        }

        buffer = rendered.buffer;
        pageCount = rendered.pageCount;
    } else {
        buffer = await renderDocx(content, singlePageOnly);

        // DOCX pagination is controlled by Word-compatible renderers.
        // A compact layout targets one page but does not guarantee it.
    }

    await fs.writeFile(absolutePath, buffer);

    let resume;
    let version;
    let createdResume = false;

    try {
        // Improvements always update the selected resume.
        // Normal generation updates a selected resume only if one is provided.
        const resumeIdToUpdate = isImprovement
            ? existingResume._id
            : requestedResumeId;

        if (resumeIdToUpdate) {
            resume = await Resume.findOne({
                _id: resumeIdToUpdate,
                userId,
            });

            if (!resume) {
                throw new Error(
                    "The selected resume was not found for this user."
                );
            }
        } else {
            resume = await Resume.create({
                userId,
                title: `${targetRole} Resume`,
                targetRole,
                status: "generating",
                source: { type: "ai_generated" },
            });

            createdResume = true;
        }

        const latestVersion = await ResumeVersion.findOne({
            resumeId: resume._id,
        }).sort({ versionNumber: -1 });

        const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;

        version = await ResumeVersion.create({
            resumeId: resume._id,
            versionNumber,
            content: toResumeVersionContent(content),
            changeType: "ai_generated",
            changeNote: isImprovement
                ? "AI improved the existing resume"
                : "Generated after user approval",
            files: {
                ...(requestedFormat === "pdf" ? { pdfKey: fileName } : {}),
                ...(requestedFormat === "docx" ? { docxKey: fileName } : {}),
            },
            createdBy: "ai",
        });

        resume.currentVersionId = version._id;
        resume.status = "ready";
        resume.targetRole = targetRole;
        await resume.save();

        session.resumeId = resume._id;
        session.currentStep = "completed";
        session.status = "active";
        session.pendingQuestion = null;
        session.approvalStatus = "approved";
        await session.save();
    } catch (error) {
        await fs.unlink(absolutePath).catch(() => {});

        // Avoid leaving a newly created, empty resume behind on failure.
        if (createdResume && resume?._id && !version) {
            await Resume.deleteOne({
                _id: resume._id,
                userId,
            }).catch(() => {});
        }

        throw error;
    }

    const downloadUrl =
        `${DOWNLOAD_BASE_URL}/api/resumes/download/${encodeURIComponent(fileName)}`;

    return {
        persistenceStatus: "saved",
        currentStep: "completed",
        resumeId: resume._id.toString(),
        resumeVersionId: version._id.toString(),
        fileName,
        format: requestedFormat,
        pageCount,
        downloadUrl,
        content,
        messages: [
            new AIMessage(
                requestedFormat === "pdf"
                    ? "Your resume PDF has been generated and saved."
                    : "Your resume DOCX has been generated and saved."
            ),
        ],
    };
}
