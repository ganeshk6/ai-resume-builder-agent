
import UserProfile from "../auth/models/userProfile.model.js";
import ChatSession from "../chatbot/models/chatSession.model.js";

function hasValue(value) {
    if (typeof value === "string") {
        return value.trim().length > 0;
    }

    if (typeof value === "number") {
        return true;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (value && typeof value === "object") {
        return Object.keys(value).length > 0;
    }

    return false;
}

function mergeByKey(existing = [], incoming = [], key) {
    const result = [...existing];

    for (const item of incoming) {
        const value = item?.[key]?.trim?.().toLowerCase();

        if (!value) continue;

        const index = result.findIndex(
            (oldItem) =>
                oldItem?.[key]?.trim?.().toLowerCase() === value
        );

        if (index === -1) {
            result.push(item);
        } else {
            result[index] = {
                ...(result[index]?.toObject?.() ?? result[index]),
                ...Object.fromEntries(
                    Object.entries(item).filter(
                        ([, fieldValue]) =>
                            fieldValue !== null &&
                            fieldValue !== undefined &&
                            fieldValue !== ""
                    )
                ),
            };
        }
    }

    return result;
}

export async function validateAndSaveNode(state) {
    const { userId, sessionId } = state;
    const extracted = state.extractedInfo ?? {};

    if (!userId || !sessionId) {
        throw new Error("userId and sessionId are required.");
    }

    if (!/^[a-f\d]{24}$/i.test(userId)) {
        throw new Error("userId must be a valid MongoDB ObjectId.");
    }

    if (!/^[a-f\d]{24}$/i.test(sessionId)) {
        throw new Error("sessionId must be a valid MongoDB ObjectId.");
    }

    const session = await ChatSession.findOne({
        _id: sessionId,
        userId,
    });

    if (!session) {
        throw new Error("Chat session not found for this user.");
    }

    // Update the profile only when extracted information exists.
    const hasProfileData =
        hasValue(extracted.skills) ||
        hasValue(extracted.education) ||
        hasValue(extracted.projects) ||
        hasValue(extracted.internships) ||
        hasValue(extracted.targetRole) ||
        hasValue(extracted.achievements) ||
        hasValue(extracted.certifications) ||
        hasValue(extracted.professionalSummary);

    if (hasProfileData) {
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (hasValue(extracted.skills)) {
            const incomingSkills = extracted.skills.map((name) => ({
                name,
                level: null,
                verifiedByUser: false,
            }));

            profile.skills = mergeByKey(
                profile.skills,
                incomingSkills,
                "name"
            );
        }

        if (hasValue(extracted.education)) {
            profile.education = mergeByKey(
                profile.education,
                extracted.education.map((item) => ({
                    degree: item.degree ?? undefined,
                    institution: item.institution ?? undefined,
                    graduationYear: item.graduationYear ?? undefined,
                    grade: item.grade ?? undefined,
                })),
                "degree"
            );
        }

        if (hasValue(extracted.projects)) {
            profile.projects = mergeByKey(
                profile.projects,
                extracted.projects,
                "name"
            );
        }

        if (hasValue(extracted.internships)) {
            profile.internships = mergeByKey(
                profile.internships,
                extracted.internships,
                "organization"
            );
        }

        if (hasValue(extracted.targetRole)) {
            const targetRole = extracted.targetRole.trim();

            profile.targetRoles = [
                ...new Set([
                    ...(profile.targetRoles ?? []),
                    targetRole,
                ]),
            ];

            session.targetRole = targetRole;
        }

        if (typeof extracted.professionalSummary === "string") {
            const summary = extracted.professionalSummary.trim();

            if (summary) {
                profile.professionalSummary = summary;
            }
        }

        if (hasValue(extracted.achievements)) {
            const incomingAchievements = extracted.achievements
                .filter(
                    (item) =>
                        typeof item === "string" &&
                        item.trim() &&
                        item.trim().toLowerCase() !== "none"
                )
                .map((item) => ({
                    title: item.trim(),
                    description: "",
                }));

            if (incomingAchievements.length > 0) {
                profile.achievements = mergeByKey(
                    profile.achievements,
                    incomingAchievements,
                    "title"
                );
            }
        }

        if (hasValue(extracted.certifications)) {
            const incomingCertifications = extracted.certifications
                .filter(
                    (item) =>
                        typeof item === "string" &&
                        item.trim() &&
                        item.trim().toLowerCase() !== "none"
                )
                .map((item) => ({
                    name: item.trim(),
                }));

            if (incomingCertifications.length > 0) {
                profile.certifications = mergeByKey(
                    profile.certifications,
                    incomingCertifications,
                    "name"
                );
            }
        }

        await profile.save();
    }

    // Persist requirements and their statuses.
    const requirementKeys = [
        "targetRole",
        "skills",
        "experienceType",
        "education",
        "experience",
        "internships",
        "projects",
        "achievements",
        "certifications",
        "professionalSummary",
        "links",
    ];

    for (const key of requirementKeys) {
        const requirement = state.requirements?.[key];

        if (!requirement) continue;

        const existing = session.requirements?.[key];

        const update = {
            status: requirement.status,
            value:
                requirement.value !== undefined
                    ? requirement.value
                    : existing?.value ?? null,
            updatedAt: requirement.updatedAt
                ? new Date(requirement.updatedAt)
                : new Date(),
        };

        if (existing?.askedAt) {
            update.askedAt = existing.askedAt;
        }

        if (requirement.status === "confirmed") {
            update.confirmedAt = new Date();
        }

        session.set(`requirements.${key}`, update);
    }

    // Persist workflow progress even if extractedInfo is null.
    session.intent = state.intent ?? session.intent;
    session.currentStep = state.currentStep ?? session.currentStep;
    session.pendingQuestion = state.pendingQuestion ?? null;

    if (state.approvalStatus) {
        session.approvalStatus = state.approvalStatus;
    }

    const experienceType =
        state.requirements?.experienceType?.value ??
        state.experienceType;

    if (
        experienceType === "fresher" ||
        experienceType === "experienced"
    ) {
        session.experienceType = experienceType;
    }

    console.log("Saving workflow state:", {
        currentStep: session.currentStep,
        pendingQuestion: session.pendingQuestion,
        intent: session.intent,
    });

    if (
        state.requestedFormat === "pdf" ||
        state.requestedFormat === "docx"
    ) {
        session.requestedFormat = state.requestedFormat;
    }

    if (typeof state.singlePageOnly === "boolean") {
        session.singlePageOnly = state.singlePageOnly;
    }

    await session.save();

    const savedSession = await ChatSession.findById(sessionId).lean();

    console.log("Professional summary after save:", {
        requirement: savedSession?.requirements?.professionalSummary,
        experienceType: savedSession?.requirements?.experienceType,
        experience: savedSession?.requirements?.experience,
    });

    return {
        persistenceStatus: "saved",
    };
}
