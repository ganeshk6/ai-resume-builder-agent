
import { REQUIREMENT_STATUS, WORKFLOW_STEPS } from "./constants/workflow.constants.js";

const { PENDING, ANSWERED, NOT_APPLICABLE } = REQUIREMENT_STATUS;

function createRequirement(status, value, previous = {}) {
    return {
        ...previous,
        status,
        value,
        updatedAt: new Date().toISOString(),
    };
}

function mergeSkills(existing = [], incoming = []) {
    const result = [...existing];

    const seen = new Set(
        result
            .filter((item) => typeof item === "string")
            .map((item) => item.trim().toLowerCase())
    );

    for (const skill of incoming) {
        if (typeof skill !== "string" || !skill.trim()) continue;

        const normalized = skill.trim().toLowerCase();

        if (!seen.has(normalized)) {
            result.push(skill.trim());
            seen.add(normalized);
        }
    }

    return result;
}

function isValidString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isExplicitNone(items) {
    if (
        !Array.isArray(items) ||
        items.length !== 1 ||
        typeof items[0] !== "string"
    ) {
        return false;
    }

    return /^(none|no|nothing|n\/a|na|not applicable|i have none|i don't have any|i have no .+)$/i
        .test(items[0].trim());
}

function normalizeStringList(items) {
    if (!Array.isArray(items)) return [];

    return items
        .filter(isValidString)
        .map((item) => item.trim());
}

function updateFromForm(state, requirements) {
    const { formStep, formValues } = state;
    const sectionAction = state.sectionAction ?? "edit";

    if (!formStep || !formValues) {
        return null;
    }

    // Normalize the legacy step name to one canonical key.
    const stepAliases = {
        professional_summary: "professionalSummary",
    };

    const step = stepAliases[formStep] ?? formStep;

    const entries = Array.isArray(formValues.entries)
        ? formValues.entries
        : [];

    const markNotApplicable = (key) => {
        requirements[key] = createRequirement(
            NOT_APPLICABLE,
            null,
            requirements[key] ?? {}
        );
    };

    const markAnswered = (key, value) => {
        requirements[key] = createRequirement(
            ANSWERED,
            value,
            requirements[key] ?? {}
        );
    };

    // Optional sections: explicit "No" means the section is complete.
    
    // Optional sections: do not delete existing data during "add".
    if (step === "internships" && formValues.hasInternship === false) {
        if (sectionAction !== "add") {
            markNotApplicable("internships");
        }
        return requirements;
    }

    if (step === "achievements" && formValues.hasAchievement === false) {
        if (sectionAction !== "add") {
            markNotApplicable("achievements");
        }
        return requirements;
    }

    if (step === "certifications" && formValues.hasCertification === false) {
        if (sectionAction !== "add") {
            markNotApplicable("certifications");
        }
        return requirements;
    }

    if (step === "links" && formValues.hasLinks === false) {
        if (sectionAction !== "add") {
            markNotApplicable("links");
        }
        return requirements;
    }

    // Skills may arrive as a comma-separated string or an array.
    const skills =
        typeof formValues.skills === "string"
            ? formValues.skills
                  .split(/[,\n]/)
                  .map((skill) => skill.trim())
                  .filter(Boolean)
            : Array.isArray(formValues.skills)
                ? normalizeStringList(formValues.skills)
                : [];

    const formMappings = {
        target_role: {
            key: "targetRole",
            value: formValues.jobTitle?.trim(),
        },

        skills: {
            key: "skills",
            value: skills,
        },

        experience_type: {
            key: "experienceType",
            value: formValues.experienceType?.trim()?.toLowerCase(),
        },

        education: {
            key: "education",
            value: entries.filter((item) =>
                isValidString(item.degree) ||
                isValidString(item.institution) ||
                isValidString(item.graduationYear ?? item.year) ||
                isValidString(item.fieldOfStudy)
            ),
        },

        experience: {
            key: "experience",
            value: entries
                .filter((item) =>
                    isValidString(item.companyName ?? item.organization) ||
                    isValidString(item.role ?? item.designation) ||
                    isValidString(item.description)
                )
                .map((item) => ({
                    ...item,
                    companyName: item.companyName ?? item.organization ?? "",
                    role: item.role ?? item.designation ?? "",
                    startDate: item.startDate ?? "",
                    endDate: item.isCurrent ? "" : (item.endDate ?? ""),
                    isCurrent: Boolean(item.isCurrent),
                    description: item.description ?? "",
                })),
        },

        internships: {
            key: "internships",
            value: entries
                .filter((item) =>
                    isValidString(item.companyName ?? item.organization) ||
                    isValidString(item.role ?? item.designation) ||
                    isValidString(item.description)
                )
                .map((item) => ({
                    organization: item.companyName ?? item.organization ?? "",
                    designation: item.role ?? item.designation ?? "",
                    startDate: item.startDate ?? "",
                    endDate: item.isCurrent ? "" : (item.endDate ?? ""),
                    isCurrent: Boolean(item.isCurrent),
                    organizationUrl: item.organizationUrl ?? "",
                    description: item.description ?? "",
                })),
        },

        projects: {
            key: "projects",
            value: entries
                .filter((item) =>
                    isValidString(item.projectName ?? item.name) ||
                    isValidString(item.description) ||
                    isValidString(item.githubUrl) ||
                    isValidString(item.projectUrl)
                )
                .map((item) => ({
                    name: item.projectName ?? item.name ?? "",
                    technologies:
                        typeof item.technologies === "string"
                            ? item.technologies
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean)
                            : item.technologies ?? [],
                    role: item.role ?? "",
                    description: item.description ?? "",
                    projectUrl: item.projectUrl ?? "",
                    githubUrl: item.githubUrl ?? "",
                })),
        },

        achievements: {
            key: "achievements",
            value: entries
                .map((item) =>
                    [item.title, item.description]
                        .filter(isValidString)
                        .map((value) => value.trim())
                        .join(" — ")
                )
                .filter(Boolean),
        },

        certifications: {
            key: "certifications",
            value: entries
                .map((item) =>
                    [
                        item.name,
                        item.issuer ? `Issuer: ${item.issuer}` : "",
                        item.issueDate ? `Date: ${item.issueDate}` : "",
                        item.credentialUrl ? `URL: ${item.credentialUrl}` : "",
                    ]
                        .filter(isValidString)
                        .map((value) => value.trim())
                        .join(" — ")
                )
                .filter(Boolean),
        },

        professionalSummary: {
            key: "professionalSummary",
            value:
                formValues.summaryMode === "manual"
                    ? formValues.summary?.trim()
                    : formValues.summaryMode === "ai"
                        ? {
                            mode: "ai",
                            summary: "",
                        }
                        : undefined,
        },

        links: {
            key: "links",
            value: entries
                .filter(
                    (item) =>
                        isValidString(item.label) &&
                        isValidString(item.url)
                )
                .map((item) => ({
                    label: item.label.trim(),
                    url: item.url.trim(),
                })),
        },
    };

    const updateRepeatableRequirement = (key, newValue) => {
        const previousValue = Array.isArray(requirements[key]?.value)
            ? requirements[key].value
            : [];

        let finalValue;

        if (sectionAction === "add") {
            // Add-only form mein sirf new entries submit hoti hain.
            // Existing entries preserve karke new entries append karo.
            finalValue = [...previousValue, ...newValue];
        } else {
            // "edit" aur "edit_and_add" mein form existing entries
            // bhi contain karta hai, isliye complete list save karo.
            finalValue = newValue;
        }

        markAnswered(key, finalValue);
    };

    const mapping = formMappings[step];

    if (!mapping) {
        return null;
    }

    const { key, value } = mapping;

    // Validate values before marking the requirement as answered.
    const isValid =
        value !== undefined &&
        value !== null &&
        (
            Array.isArray(value)
                ? value.length > 0
                : typeof value === "string"
                    ? value.trim().length > 0
                    : typeof value === "object" &&
                      value.mode === "ai" &&
                      key === "professionalSummary"
        );

    if (!isValid) {
        return null;
    }

    // Prevent invalid experience types from entering the workflow.
    if (
        key === "experienceType" &&
        !["fresher", "experienced"].includes(value)
    ) {
        return null;
    }

    const repeatableSections = [
        "education",
        "experience",
        "internships",
        "projects",
        "achievements",
        "certifications",
        "links",
    ];

    if (repeatableSections.includes(key) && Array.isArray(value)) {
        updateRepeatableRequirement(key, value);
    } else {
        markAnswered(key, value);
    }

    // A fresher does not need to provide work experience.
    if (key === "experienceType" && value === "fresher") {
        markNotApplicable("experience");
    }

    if (
        key === "experienceType" &&
        value === "experienced" &&
        requirements.experience?.status === NOT_APPLICABLE
    ) {
        requirements.experience = createRequirement(
            PENDING,
            null,
            requirements.experience ?? {}
        );
    }

    return requirements;
}

export async function updateRequirementsNode(state) {
    
    const extracted = state.extractedInfo;

    const sectionToEdit =
        extracted?.sectionToEdit ?? state.sectionToEdit ?? null;

    // Handle AI-detected user action at the review step.

    const action = extracted?.action ?? "none";

    if (
        state.currentStep === WORKFLOW_STEPS.REVIEW &&
        action === "approve"
    ) {
        return {
            approvalStatus: "approved",
            currentStep: WORKFLOW_STEPS.GENERATE_RESUME,
            pendingQuestion:
                "Your resume details are approved. Generating your resume now.",

            sectionToEdit: null,
            sectionAction: null,

            requestedFormat:
                extracted?.requestedFormat ??
                state.requestedFormat ??
                "pdf",

            singlePageOnly:
                extracted?.singlePageOnly ??
                state.singlePageOnly ??
                false,
        };
    }

    const requirements = Object.fromEntries(
        Object.entries(state.requirements ?? {}).map(([key, value]) => [
            key,
            value ? { ...value } : value,
        ])
    );

    if (state.formStep && state.formValues) {
        const updatedRequirements = updateFromForm(
            state,
            requirements
        );

        if (updatedRequirements) {
            return {
                requirements: updatedRequirements,
                sectionToEdit: null,
                sectionAction: null,
            };
        }

        return {
            requirements,
            sectionToEdit: null,
            sectionAction: null,
        };
    }

    if (!extracted) {
        return { requirements };
    }

    const updateIfProvided = (key, value, isValid) => {
        if (!isValid) return;

        requirements[key] = createRequirement(
            ANSWERED,
            value,
            requirements[key] ?? {}
        );
    };


    const updateRepeatableFromMessage = (key, incomingValue, isValid) => {
        if (!isValid) return;

        const previousValue = Array.isArray(requirements[key]?.value)
            ? requirements[key].value
            : [];

        const action =
            extracted.sectionAction ??
            state.sectionAction ??
            "edit";

        const finalValue =
            action === "add"
                ? [...previousValue, ...incomingValue]
                : incomingValue;

        requirements[key] = createRequirement(
            ANSWERED,
            finalValue,
            requirements[key] ?? {}
        );
    };


    // 1. Target role
    updateIfProvided(
        "targetRole",
        isValidString(extracted.targetRole)
            ? extracted.targetRole.trim()
            : null,
        isValidString(extracted.targetRole)
    );

    // 2. Skills: merge without duplicates
    if (Array.isArray(extracted.skills) && extracted.skills.length > 0) {
        const incomingSkills = normalizeStringList(extracted.skills);

        if (incomingSkills.length > 0) {
            const previousSkills = requirements.skills?.value ?? [];

            const mergedSkills = mergeSkills(
                Array.isArray(previousSkills) ? previousSkills : [],
                incomingSkills
            );

            requirements.skills = createRequirement(
                ANSWERED,
                mergedSkills,
                requirements.skills ?? {}
            );
        }
    }

    // 3. Experience type
    // Only update when the active step is the experience-type question,
    // or when the user explicitly corrects their previously confirmed answer.
    const latestMessage = (state.messages ?? [])
        .filter((message) => message.getType() === "human")
        .at(-1);

    const latestText = String(latestMessage?.content ?? "");

    const isExperienceTypeStep = state.currentStep === WORKFLOW_STEPS.EXPERIENCE_TYPE;

    const explicitlyCorrectsExperienceType =
        /\b(change|correct|update|actually|instead)\b/i.test(latestText) &&
        /\b(fresher|experienced|experience)\b/i.test(latestText);

    const validExperienceType = ["fresher", "experienced"].includes(
        extracted.experienceType
    );

    const canUpdateExperienceType =
        isExperienceTypeStep || explicitlyCorrectsExperienceType;

    if (validExperienceType && canUpdateExperienceType) {
        requirements.experienceType = createRequirement(
            ANSWERED,
            extracted.experienceType,
            requirements.experienceType ?? {}
        );

        if (extracted.experienceType === "fresher") {
            requirements.experience = createRequirement(
                NOT_APPLICABLE,
                null,
                requirements.experience ?? {}
            );
        } else if (
            requirements.experience?.status === NOT_APPLICABLE
        ) {
            requirements.experience = createRequirement(
                PENDING,
                null,
                requirements.experience ?? {}
            );
        }
    }

    // 4. Education
    updateRepeatableFromMessage(
        "education",
        extracted.education,
        Array.isArray(extracted.education) &&
            extracted.education.length > 0
    );

    // 5. Projects
    const latestUserMessage = (state.messages ?? [])
        .filter((message) => message.getType() === "human")
        .at(-1);

    const latestUserText = String(latestUserMessage?.content ?? "");

    const isProjectsQuestion =
        /project/i.test(String(state.pendingQuestion ?? "")) ||
        /project/i.test(String(state.currentStep ?? ""));

    if (extracted.projectsNone && isProjectsQuestion) {
        requirements.projects = createRequirement(
            NOT_APPLICABLE,
            null,
            requirements.projects ?? {}
        );
    } else {
        updateRepeatableFromMessage(
            "projects",
            extracted.projects,
            Array.isArray(extracted.projects) &&
                extracted.projects.length > 0
        );
    }

    // 6. Internships
    updateRepeatableFromMessage(
        "internships",
        extracted.internships,
        Array.isArray(extracted.internships) &&
            extracted.internships.length > 0
    );

    // 7. Achievements and certifications
    function updateListRequirement(key, items) {
        const normalizedItems = normalizeStringList(items);

        if (normalizedItems.length === 0) return;

        if (isExplicitNone(normalizedItems)) {
            const action =
                extracted.sectionAction ??
                state.sectionAction ??
                "edit";

            // Add mode mein existing entries delete nahi karni.
            if (action !== "add") {
                requirements[key] = createRequirement(
                    NOT_APPLICABLE,
                    null,
                    requirements[key] ?? {}
                );
            }

            return;
        }

        updateRepeatableFromMessage(
            key,
            normalizedItems,
            normalizedItems.length > 0
        );
    }

    updateListRequirement("achievements", extracted.achievements);
    updateListRequirement("certifications", extracted.certifications);

    // 8. Professional summary
    const extractedSummary = extracted.professionalSummary;

    if (typeof extractedSummary === "string") {
        // Manual or plain AI-generated summary
        updateIfProvided(
            "professionalSummary",
            extractedSummary.trim(),
            isValidString(extractedSummary)
        );
    } else if (
        extractedSummary &&
        typeof extractedSummary === "object" &&
        ["ai", "manual"].includes(extractedSummary.mode)
    ) {
        // Structured summary from AI
        requirements.professionalSummary = createRequirement(
            ANSWERED,
            {
                mode: extractedSummary.mode,
                summary: extractedSummary.summary?.trim() ?? "",
            },
            requirements.professionalSummary ?? {}
        );
    }

    // 9. Links
    updateRepeatableFromMessage(
        "links",
        extracted.links,
        Array.isArray(extracted.links) &&
            extracted.links.length > 0
    );

    
    return {
        requirements,
        sectionToEdit,
        sectionAction: extracted.sectionAction ?? state.sectionAction ?? null,

        requestedFormat:
            extracted.requestedFormat ??
            state.requestedFormat ??
            "pdf",

        singlePageOnly:
            extracted.singlePageOnly ??
            state.singlePageOnly ??
            false,

        ...(extracted.intent && extracted.intent !== "undecided"
            ? { intent: extracted.intent }
            : {}),
    };

}
