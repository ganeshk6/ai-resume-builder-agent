
import { AIMessage } from "@langchain/core/messages";

import {
    WORKFLOW_INTENTS,
    REQUIREMENT_STATUS,
    WORKFLOW_STEPS,
    EXPERIENCE_TYPES,
} from "./constants/workflow.constants.js";


function isPending(requirement) {
    if (!requirement) {
        return true;
    }

    return [
        REQUIREMENT_STATUS.PENDING,
        REQUIREMENT_STATUS.IN_PROGRESS,
    ].includes(requirement.status);
}


// Convert field names such as companyName into Company Name
function formatLabel(key) {
    return String(key)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/^./, (char) => char.toUpperCase());
}


function isEmpty(value) {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
    );
}


// Format strings, numbers, arrays and nested objects safely
function formatValue(value, indent = "") {
    if (isEmpty(value)) {
        return "Not provided";
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
        const formattedItems = value
            .map((item) => formatValue(item, indent))
            .filter((item) => item !== "Not provided");

        return formattedItems.length
            ? formattedItems.join(", ")
            : "Not provided";
    }

    if (typeof value === "object") {
        const entries = Object.entries(value).filter(
            ([, fieldValue]) => !isEmpty(fieldValue)
        );

        if (!entries.length) {
            return "Not provided";
        }

        return entries
            .map(([key, fieldValue]) => {
                const label = formatLabel(key);

                if (
                    typeof fieldValue === "object" &&
                    fieldValue !== null
                ) {
                    if (Array.isArray(fieldValue)) {
                        return `${indent}- **${label}:** ${formatValue(fieldValue, indent)}`;
                    }

                    return (
                        `${indent}- **${label}:**\n` +
                        formatValue(fieldValue, `${indent}  `)
                    );
                }

                return (
                    `${indent}- **${label}:** ` +
                    formatValue(fieldValue, indent)
                );
            })
            .join("\n");
    }

    return String(value);
}


// Format list-type requirements such as projects and internships
function formatSection(value, sectionName) {
    if (isEmpty(value)) {
        return "Not provided";
    }

    if (!Array.isArray(value)) {
        return formatValue(value);
    }

    return value
        .map((item, index) => {
            if (isEmpty(item)) {
                return null;
            }

            if (typeof item !== "object") {
                return `- ${formatValue(item)}`;
            }

            return (
                `### ${sectionName} ${index + 1}\n` +
                formatValue(item)
            );
        })
        .filter(Boolean)
        .join("\n\n") || "Not provided";
}


function buildResumeReview(requirements) {
    const getValue = (key) => requirements[key]?.value;

    const targetRole = getValue("targetRole");
    const experienceType = getValue("experienceType");

    const education = getValue("education");

    const internships = getValue("internships");
    const projects = getValue("projects");
    const achievements = getValue("achievements");
    const certifications = getValue("certifications");
    const links = getValue("links");
    const skills = getValue("skills");
    const experience = getValue("experience");

    const professionalSummary = getValue("professionalSummary");

    const summaryText =
        professionalSummary &&
        typeof professionalSummary === "object" &&
        professionalSummary.mode === "ai"
            ? "Will be generated using your confirmed resume details."
            : formatValue(
                professionalSummary &&
                typeof professionalSummary === "object"
                    ? professionalSummary.summary
                    : professionalSummary
            );

    const educationText = Array.isArray(education)
        ? education
            .map((item, index) => {
                if (typeof item !== "object" || item === null) {
                    return `- ${formatValue(item)}`;
                }

                const fields = [
                    `- **Degree:** ${formatValue(item.degree)}`,
                    `- **Institution:** ${formatValue(item.institution)}`,
                    `- **Graduation Year:** ${formatValue(
                        item.graduationYear ?? item.year
                    )}`,
                ];

                if (item.fieldOfStudy) {
                    fields.push(
                        `- **Field of Study:** ${formatValue(item.fieldOfStudy)}`
                    );
                }

                return `### Education ${index + 1}\n${fields.join("\n")}`;
            })
            .join("\n\n")
        : formatValue(education);

    return `
# Resume Review

# ${formatValue(targetRole) === "Not provided"
    ? "Professional Resume"
    : formatValue(targetRole)}

**Experience Type:** ${formatValue(experienceType)}

## Technical Skills
${formatSection(skills, "Skill")}

## Education
${educationText || "Not provided"}

## Work Experience
${formatSection(experience, "Experience")}

## Internships
${formatSection(internships, "Internship")}

## Projects
${formatSection(projects, "Project")}

## Achievements
${formatSection(achievements, "Achievement")}

## Certifications
${formatSection(certifications, "Certification")}

## Professional Summary
${summaryText}

## Professional Links
${formatSection(links, "Link")}

---

Please review your resume details carefully.

Reply "approve" to confirm these details and continue to resume generation, or tell me which section you want to change.
`.trim();
}


function selectRequirementStep(state) {
    const requirements = state.requirements;
    const intent = state.intent;

    const experienceType =
        requirements.experienceType?.value ??
        state.experienceType;

    const sectionToEdit = state.sectionToEdit;

    if (sectionToEdit) {
        const sectionSteps = {
            targetRole: {
                step: WORKFLOW_STEPS.TARGET_ROLE,
                question: "Update your target job role.",
            },
            skills: {
                step: WORKFLOW_STEPS.SKILLS,
                question: "Update your technical and professional skills.",
            },
            experienceType: {
                step: WORKFLOW_STEPS.EXPERIENCE_TYPE,
                question: "Update your experience type.",
            },
            education: {
                step: WORKFLOW_STEPS.EDUCATION,
                question: "Update your education details.",
            },
            experience: {
                step: WORKFLOW_STEPS.EXPERIENCE,
                question: "Update your work experience.",
            },
            internships: {
                step: WORKFLOW_STEPS.INTERNSHIPS,
                question: "Update your internship details.",
            },
            projects: {
                step: WORKFLOW_STEPS.PROJECTS,
                question: "Update your projects.",
            },
            achievements: {
                step: WORKFLOW_STEPS.ACHIEVEMENTS,
                question: "Update your achievements.",
            },
            certifications: {
                step: WORKFLOW_STEPS.CERTIFICATIONS,
                question: "Update your certifications.",
            },
            professionalSummary: {
                step: WORKFLOW_STEPS.PROFESSIONAL_SUMMARY,
                question: "Update your professional summary.",
            },
            links: {
                step: WORKFLOW_STEPS.LINKS,
                question: "Update your professional links.",
            },
        };

        const selectedSection = sectionSteps[sectionToEdit];

        if (selectedSection) {
            return selectedSection;
        }
    }

    if (intent === WORKFLOW_INTENTS.UNDECIDED) {
        return {
            step: WORKFLOW_STEPS.INTENT_SELECTION,
            question:
                "Would you like to create a new resume or update an existing one?",
        };
    }

    if (intent === WORKFLOW_INTENTS.UPDATE_RESUME) {
        return {
            step: WORKFLOW_STEPS.INTENT_SELECTION,
            question:
                "Which existing resume would you like to update?",
        };
    }

    if (intent === WORKFLOW_INTENTS.IMPROVE_RESUME) {
        return {
            step: WORKFLOW_STEPS.REVIEW,
            question:
                "I can help improve your existing resume. Please confirm that you want me to improve the selected resume and generate a new version.",
        };
    }
    const orderedRequirements = [
        {
            key: "targetRole",
            step: WORKFLOW_STEPS.TARGET_ROLE,
            question: "Which job role are you targeting?",
        },
        {
            key: "skills",
            step: WORKFLOW_STEPS.SKILLS,
            question:
                "Which technical and professional skills do you have? You can list them together.",
        },
        {
            key: "experienceType",
            step: WORKFLOW_STEPS.EXPERIENCE_TYPE,
            question:
                "Are you a fresher or an experienced professional?",
        },
    ];

    for (const item of orderedRequirements) {
        if (isPending(requirements[item.key])) {
            return {
                step: item.step,
                question: item.question,
            };
        }
    }

    if (experienceType === EXPERIENCE_TYPES.FRESHER) {
        if (isPending(requirements.education)) {
            return {
                step: WORKFLOW_STEPS.EDUCATION,
                question:
                    "Please share your education details, including degree, institution and graduation year if available.",
            };
        }

        if (isPending(requirements.internships)) {
            return {
                step: WORKFLOW_STEPS.INTERNSHIPS,
                question:
                    "Have you completed any internships? If not, you can say that you have none.",
            };
        }

        if (isPending(requirements.projects)) {
            return {
                step: WORKFLOW_STEPS.PROJECTS,
                question:
                    "Tell me about your academic or personal projects. If you have none, let me know.",
            };
        }
    }

    if (experienceType === EXPERIENCE_TYPES.EXPERIENCED) {
        if (isPending(requirements.experience)) {
            return {
                step: WORKFLOW_STEPS.EXPERIENCE,
                question:
                    "Please share your work experience: company, designation, dates and responsibilities.",
            };
        }

        if (isPending(requirements.education)) {
            return {
                step: WORKFLOW_STEPS.EDUCATION,
                question:
                    "Please share your education details, including degree, institution and graduation year if available.",
            };
        }
        
        if (isPending(requirements.internships)) {
            return {
                step: WORKFLOW_STEPS.INTERNSHIPS,
                question:
                    "Have you completed any internships you want to include?",
            };
        }

        if (isPending(requirements.projects)) {
            return {
                step: WORKFLOW_STEPS.PROJECTS,
                question:
                    "Which projects would you like to include in your resume?",
            };
        }
    }

    const remainingRequirements = [
        {
            key: "achievements",
            step: WORKFLOW_STEPS.ACHIEVEMENTS,
            question:
                "Do you have any achievements, awards or notable accomplishments to include?",
        },
        {
            key: "certifications",
            step: WORKFLOW_STEPS.CERTIFICATIONS,
            question:
                "Do you have any certifications? If not, you can say none.",
        },
        {
            key: "professionalSummary",
            step: WORKFLOW_STEPS.PROFESSIONAL_SUMMARY,
            question:
                "Would you like to share a professional summary, or should we draft one from your confirmed information?",
        },
        {
            key: "links",
            step: WORKFLOW_STEPS.LINKS,
            question:
                "Share any professional links you want to include, such as GitHub, LinkedIn, portfolio or LeetCode. You can also say none.",
        },
    ];

    for (const item of remainingRequirements) {
        if (isPending(requirements[item.key])) {
            return {
                step: item.step,
                question: item.question,
            };
        }
    }

    return {
        step: WORKFLOW_STEPS.REVIEW,
        question: buildResumeReview(requirements),
    };
}


export async function selectNextStepNode(state) {
    const next = selectRequirementStep(state);

    return {
        currentStep: next.step,
        pendingQuestion: next.question,
        messages: [
            new AIMessage(next.question),
        ],
    };
}
