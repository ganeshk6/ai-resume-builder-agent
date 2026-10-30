
import { useEffect, useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";

const field = (name, label, type = "text", placeholder = "") => ({
    name,
    label,
    type,
    placeholder,
});

const formDefinitions = {
    target_role: {
        title: "Target Job Role",
        fields: [
            field("jobTitle", "", "text", "e.g. MERN Stack Developer"),
        ],
    },

    skills: {
        title: "Your Skills",
        fields: [
            field(
                "skills",
                "Technical and professional skills",
                "textarea",
                "React, Node.js, Express.js, MongoDB..."
            ),
        ],
    },

    experience_type: {
        title: "Experience Type",
        fields: [
            field(
                "experienceType",
                "Are you a fresher or experienced?",
                "select"
            ),
        ],
    },

    education: {
        title: "Education Details",
        repeatable: true,
        fields: [
            field("degree", "Degree", "text", "MCA, BCA, B.Tech"),
            field("institution", "University / Institution"),
            field("fieldOfStudy", "Branch / Field of study"),
            field("startYear", "Start year", "number"),
            field("graduationYear", "Graduation year", "number"),
            field("description", "Additional details", "textarea"),
        ],
    },

    experience: {
        title: "Work Experience",
        repeatable: true,
        fields: [
            field("companyName", "Company name"),
            field("organizationUrl", "Organization website (optional)", "url"),
            field("jobTitle", "Designation"),
            field("employmentType", "Employment type", "text", "Full-time"),
            field("startDate", "Start date", "month"),
            field("endDate", "End date", "month"),
            field("responsibilities", "Responsibilities", "textarea"),
        ],
    },

    internships: {
        title: "Internship Details",
        repeatable: true,
        optional: true,
        fields: [
            field("companyName", "Company name"),
            field("role", "Internship role"),
            field("startDate", "Start date", "month"),
            field("endDate", "End date", "month"),
            field("description", "What did you work on?", "textarea"),
            field("organizationUrl", "Company website (optional)", "url"),
        ],
    },

    
    projects: {
        title: "Project Details",
        repeatable: true,
        fields: [
            field("projectName", "Project name"),
            field("technologies", "Technologies used", "text", "React, Node.js"),
            field("role", "Your role"),
            field("description", "Project description", "textarea"),
            field("projectUrl", "Project URL (optional)", "url"),
            field("githubUrl", "GitHub repository URL (optional)", "url"),
        ],
    },


    achievements: {
        title: "Achievements",
        repeatable: true,
        fields: [
            field("title", "Achievement title"),
            field("description", "Description", "textarea"),
        ],
    },

    certifications: {
        title: "Certifications",
        repeatable: true,
        fields: [
            field("name", "Certification name"),
            field("issuer", "Issuing organization"),
            field("issueDate", "Issue date", "date"),
            field("credentialUrl", "Credential URL"),
        ],
    },

    professionalSummary: {
        title: "Professional Summary",
        fields: [
            field(
                "summary",
                "Your professional summary",
                "textarea",
                "Briefly describe your experience, strengths and career goals..."
            ),
        ],
    },

    professional_summary: {
        title: "Professional Summary",
        fields: [
            field(
                "summary",
                "Your professional summary",
                "textarea",
                "Describe your experience, strengths and career goals..."
            ),
        ],
    },

    links: {
        title: "Professional Links",
        repeatable: true,
        optional: true,
        fields: [
            field("label", "Link name", "text", "e.g. GitHub, HackerRank"),
            field("url", "Profile URL", "url", "https://example.com/username"),
        ],
    },
};

const createEmptyEntry = (fields) => ({
    ...Object.fromEntries(
        fields.map(({ name }) => [name, ""])
    ),
    isCurrent: false,
});

const getExistingEntries = (step, requirements, fields) => {
    const requirementKeyMap = {
        target_role: "targetRole",
        skills: "skills",
        experience_type: "experienceType",
        education: "education",
        experience: "experience",
        internships: "internships",
        projects: "projects",
        achievements: "achievements",
        certifications: "certifications",
        professionalSummary: "professionalSummary",
        professional_summary: "professionalSummary",
        links: "links",
    };

    const key = requirementKeyMap[step];
    const value = requirements?.[key]?.value;

    if (value === null || value === undefined) {
        const repeatableSteps = [
            "education",
            "experience",
            "internships",
            "projects",
            "achievements",
            "certifications",
            "links",
        ];

        return repeatableSteps.includes(step)
            ? []
            : [createEmptyEntry(fields)];
    }

    if (step === "target_role") {
        return [{
            ...createEmptyEntry(fields),
            jobTitle: typeof value === "string" ? value : "",
        }];
    }

    if (step === "skills") {
        return [{
            ...createEmptyEntry(fields),
            skills: Array.isArray(value) ? value.join(", ") : String(value),
        }];
    }

    if (step === "experience_type") {
        return [{
            ...createEmptyEntry(fields),
            experienceType: String(value),
        }];
    }

    if (step === "professionalSummary" || step === "professional_summary") {
        return [{
            ...createEmptyEntry(fields),
            summary:
                typeof value === "object"
                    ? value.summary ?? ""
                    : typeof value === "string"
                        ? value
                        : "",
        }];
    }

    const list = Array.isArray(value) ? value : [value];

    const normalizeEntry = (item) => {
        const entry = { ...createEmptyEntry(fields) };

        if (!item || typeof item !== "object") {
            return entry;
        }

        const aliases = {
            jobTitle: ["jobTitle", "role", "designation", "title"],
            companyName: ["companyName", "organization", "company"],
            projectName: ["projectName", "name"],
            technologies: ["technologies", "technology"],
            responsibilities: ["responsibilities", "description"],
            description: ["description"],
            startYear: ["startYear"],
            graduationYear: ["graduationYear", "year"],
            organizationUrl: ["organizationUrl", "url"],
            issueDate: ["issueDate", "date"],
            credentialUrl: ["credentialUrl", "url"],
        };

        for (const { name } of fields) {
            const candidates = aliases[name] ?? [name];
            const matchedKey = candidates.find(
                (candidate) => item[candidate] !== undefined && item[candidate] !== null
            );

            if (matchedKey) {
                entry[name] = String(item[matchedKey]);
            }
        }

        if (item.isCurrent !== undefined) {
            entry.isCurrent = Boolean(item.isCurrent);
        }

        return entry;
    };

    const populated = list.map(normalizeEntry);

    return populated.length ? populated : [createEmptyEntry(fields)];
};

export default function DynamicStepForm({
    step,
    onSubmit,
    requirements = {},
    sectionAction = "edit",
    disabled = false,
}) {
    const config = formDefinitions[step];
    const [entries, setEntries] = useState([]);
    const [hasInternship, setHasInternship] = useState(null);
    const [hasAchievement, setHasAchievement] = useState(null);
    const [hasCertification, setHasCertification] = useState(null);
    const [summaryChoice, setSummaryChoice] = useState(null);
    const [hasLinks, setHasLinks] = useState(null);

    useEffect(() => {
        if (!config) {
            setEntries([]);
            return;
        }

        const existingEntries = getExistingEntries(
            step,
            requirements,
            config.fields
        );

        if (
            sectionAction === "add" &&
            config.repeatable
        ) {
            setEntries([createEmptyEntry(config.fields)]);
        } else if (
            sectionAction === "edit_and_add" &&
            config.repeatable
        ) {
            setEntries([
                ...existingEntries,
                createEmptyEntry(config.fields),
            ]);
        } else {
            setEntries(
                existingEntries.length > 0
                    ? existingEntries
                    : [createEmptyEntry(config.fields)]
            );
        }

        const existingValue =
            requirements?.[
                {
                    internships: "internships",
                    achievements: "achievements",
                    certifications: "certifications",
                    links: "links",
                }[step]
            ]?.value;

        if (step === "internships") {
            setHasInternship(
                Array.isArray(existingValue) ? existingValue.length > 0 : null
            );
        } else {
            setHasInternship(null);
        }

        if (step === "achievements") {
            setHasAchievement(
                Array.isArray(existingValue) ? existingValue.length > 0 : null
            );
        } else {
            setHasAchievement(null);
        }

        if (step === "certifications") {
            setHasCertification(
                Array.isArray(existingValue) ? existingValue.length > 0 : null
            );
        } else {
            setHasCertification(null);
        }

        if (step === "links") {
            setHasLinks(
                Array.isArray(existingValue) ? existingValue.length > 0 : null
            );
        } else {
            setHasLinks(null);
        }

        const summaryValue = requirements?.professionalSummary?.value;

        if (step === "professionalSummary" || step === "professional_summary") {
            setSummaryChoice(
                summaryValue && typeof summaryValue === "object"
                    ? summaryValue.mode === "ai" ? "ai" : "manual"
                    : summaryValue ? "manual" : null
            );
        } else {
            setSummaryChoice(null);
        }
    }, [step, requirements, config, sectionAction]);

    if (!config) return null;

    const updateField = (index, name, value) => {
        setEntries((previous) =>
            previous.map((entry, i) =>
                i === index ? { ...entry, [name]: value } : entry
            )
        );
    };

    const addEntry = () => {
        setEntries((previous) => [
            ...previous,
            createEmptyEntry(config.fields),
        ]);
    };

    const removeEntry = (index) => {
        setEntries((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // 1. Professional Links
        if (step === "links") {
            if (hasLinks === false) {
                onSubmit({
                    step,
                    sectionAction,
                    values: {
                        hasLinks: false,
                        entries: [],
                    },
                    content: "Professional Links: None",
                });
                return;
            }

            if (hasLinks !== true) return;

            const validLinks = entries
                .map((entry) => ({
                    label: entry.label.trim(),
                    url: entry.url.trim(),
                }))
                .filter((entry) => entry.label && entry.url);

            if (validLinks.length === 0) return;

            onSubmit({
                step,
                sectionAction,
                values: {
                    hasLinks: true,
                    entries: validLinks,
                },
                content: `Professional Links:\n${validLinks
                    .map((link) => `${link.label}: ${link.url}`)
                    .join("\n")}`,
            });

            return;
        }

        // 2. Professional Summary
        if (
            step === "professionalSummary" ||
            step === "professional_summary"
        ) {
            if (summaryChoice === null) return;

            if (summaryChoice === "ai") {
                onSubmit({
                    step,
                    sectionAction,
                    values: {
                        summaryMode: "ai",
                        summary: "",
                    },
                    content: "Professional Summary: Generate with AI",
                });
                return;
            }

            const summary = entries[0]?.summary?.trim() ?? "";

            if (!summary) return;

            onSubmit({
                step,
                sectionAction,
                values: {
                    summaryMode: "manual",
                    summary,
                },
                content: `Professional Summary:\n${summary}`,
            });

            return;
        }

        // 3. Certifications
        if (step === "certifications") {
            if (hasCertification === null) return;

            if (hasCertification === false) {
                onSubmit({
                    step,
                    sectionAction,
                    values: {
                        hasCertification: false,
                        entries: [],
                    },
                    content: "Certifications: No",
                });
                return;
            }
        }

        // 4. Achievements
        if (step === "achievements") {
            if (hasAchievement === null) return;

            if (hasAchievement === false) {
                onSubmit({
                    step,
                    sectionAction,
                    values: {
                        hasAchievement: false,
                        entries: [],
                    },
                    content: "Achievements: No",
                });
                return;
            }
        }

        // 5. Internships
        if (step === "internships") {
            if (hasInternship === null) return;

            if (hasInternship === false) {
                onSubmit({
                    step,
                    sectionAction,
                    values: {
                        hasInternship: false,
                        entries: [],
                    },
                    content: "Internships: No",
                });
                return;
            }
        }

        // 6. Trim all string values
        const cleanedEntries = entries.map((entry) =>
            Object.fromEntries(
                Object.entries(entry).map(([key, value]) => [
                    key,
                    typeof value === "string" ? value.trim() : value,
                ])
            )
        );

        // 7. Remove completely empty entries
        const validEntries = cleanedEntries.filter((entry) =>
            Object.entries(entry).some(
                ([key, value]) =>
                    key !== "isCurrent" &&
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            )
        );

        // 8. Validate repeatable sections
        if (config.repeatable && validEntries.length === 0) {
            return;
        }

        // 9. Submit internships
        if (step === "internships" && hasInternship === true) {
            if (validEntries.length === 0) return;

            onSubmit({
                step,
                sectionAction,
                values: {
                    hasInternship: true,
                    entries: validEntries,
                },
            });

            return;
        }

        // 10. Submit achievements
        if (step === "achievements" && hasAchievement === true) {
            if (validEntries.length === 0) return;

            onSubmit({
                step,
                sectionAction,
                values: {
                    hasAchievement: true,
                    entries: validEntries,
                },
            });

            return;
        }

        // 11. Submit certifications
        if (step === "certifications" && hasCertification === true) {
            if (validEntries.length === 0) return;

            onSubmit({
                step,
                sectionAction,
                values: {
                    hasCertification: true,
                    entries: validEntries,
                },
            });

            return;
        }

        // 12. Submit other sections
        if (validEntries.length === 0) return;

        onSubmit({
            step,
            sectionAction,
            values: config.repeatable
                ? validEntries
                : cleanedEntries[0],
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-3 w-full space-y-4 rounded-2xl border border-violet-400/20 bg-[#10101c] p-4 sm:p-5"
        >
            <div>
                <h3 className="font-semibold text-white">{config.title}</h3>
                {config.repeatable && (
                    <p className="mt-1 text-xs text-slate-400">
                        Add multiple entries if needed.
                    </p>
                )}
            </div>
            {step === "internships" && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                        Have you completed any internships you want to include?
                    </p>

                    <div className="flex gap-5">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasInternship"
                                checked={hasInternship === true}
                                disabled={disabled}
                                onChange={() => setHasInternship(true)}
                                className="accent-violet-500"
                            />
                            Yes
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasInternship"
                                checked={hasInternship === false}
                                disabled={disabled}
                                onChange={() => setHasInternship(false)}
                                className="accent-violet-500"
                            />
                            No
                        </label>
                    </div>
                </div>
            )}

            {step === "achievements" && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                        Do you have any achievements, awards or notable accomplishments to include?
                    </p>

                    <div className="flex gap-5">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasAchievement"
                                checked={hasAchievement === true}
                                disabled={disabled}
                                onChange={() => setHasAchievement(true)}
                                className="accent-violet-500"
                            />
                            Yes
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasAchievement"
                                checked={hasAchievement === false}
                                disabled={disabled}
                                onChange={() => setHasAchievement(false)}
                                className="accent-violet-500"
                            />
                            No
                        </label>
                    </div>
                </div>
            )}

            {(step === "professionalSummary" || step === "professional_summary") && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                        Would you like to write your own professional summary,
                        or should our AI generate one using your confirmed information?
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="summaryChoice"
                                value="manual"
                                checked={summaryChoice === "manual"}
                                disabled={disabled}
                                onChange={() => setSummaryChoice("manual")}
                                className="accent-violet-500"
                            />
                            I'll write my own
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="summaryChoice"
                                value="ai"
                                checked={summaryChoice === "ai"}
                                disabled={disabled}
                                onChange={() => setSummaryChoice("ai")}
                                className="accent-violet-500"
                            />
                            Generate with AI
                        </label>
                    </div>
                </div>
            )}

            {step === "links" && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                        Share any professional links you want to include,
                        such as GitHub, LinkedIn, GitLab, HackerRank or your portfolio.
                    </p>

                    <div className="flex gap-5">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasLinks"
                                checked={hasLinks === true}
                                disabled={disabled}
                                onChange={() => setHasLinks(true)}
                                className="accent-violet-500"
                            />
                            Yes, add links
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasLinks"
                                checked={hasLinks === false}
                                disabled={disabled}
                                onChange={() => setHasLinks(false)}
                                className="accent-violet-500"
                            />
                            No links
                        </label>
                    </div>
                </div>
            )}

            {step === "certifications" && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                        Do you have any certifications to include in your resume?
                    </p>

                    <div className="flex gap-5">
                        <label className="flex items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasCertification"
                                checked={hasCertification === true}
                                disabled={disabled}
                                onChange={() => setHasCertification(true)}
                                className="accent-violet-500"
                            />
                            Yes
                        </label>

                        <label className="flex items-center gap-2 text-sm text-white">
                            <input
                                type="radio"
                                name="hasCertification"
                                checked={hasCertification === false}
                                disabled={disabled}
                                onChange={() => setHasCertification(false)}
                                className="accent-violet-500"
                            />
                            No
                        </label>
                    </div>
                </div>
            )}

            {((step !== "internships" || hasInternship === true) && 
                (step !== "achievements" || hasAchievement === true) && 
                (step !== "certifications" || hasCertification === true) && 
                (
                    (step !== "professionalSummary" &&
                        step !== "professional_summary") ||
                    summaryChoice === "manual"
                ) &&
                (step !== "links" || hasLinks === true)
            ) &&
                <>
                    {entries.map((entry, index) => (
                        <div
                            key={`${step}-${index}`}
                            className="space-y-4"
                        >
                            {config.repeatable && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-violet-200">
                                        Entry {index + 1}
                                    </span>

                                    {entries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEntry(index)}
                                            disabled={disabled}
                                            className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-300"
                                            aria-label={`Remove entry ${index + 1}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                {config.fields.map((item) => (
                                    <div
                                        key={item.name}
                                        className={
                                            item.type === "textarea" ? "sm:col-span-2" : ""
                                    }
                                        >
                                        {item.label && (
                                            <label className="mb-1.5 block text-sm text-slate-300">
                                            {item.label}
                                            </label>
                                        )}

                                        {!(step === "experience" && item.name === "endDate" && entry.isCurrent) && item.type === "select" ? (
                                            <select
                                                value={entry[item.name] ?? ""}
                                                disabled={disabled}
                                                onChange={(event) =>
                                                    updateField(index, item.name, event.target.value)
                                                }
                                                className="w-full rounded-lg border border-white/10 bg-[#090914] p-3 text-sm text-white outline-none focus:border-violet-400/60 disabled:opacity-50"
                                            >
                                                <option value="">Select experience type</option>
                                                <option value="fresher">Fresher</option>
                                                <option value="experienced">Experienced</option>
                                            </select>
                                        ) : item.type === "textarea" ? (
                                            <textarea
                                                rows={3}
                                                value={entry[item.name] ?? ""}
                                                placeholder={item.placeholder}
                                                disabled={disabled}
                                                onChange={(event) =>
                                                    updateField(index, item.name, event.target.value)
                                                }
                                                className="w-full resize-y rounded-lg border border-white/10 bg-[#090914] p-3 text-sm text-white outline-none focus:border-violet-400/60 disabled:opacity-50"
                                            />
                                        ) : (
                                            <input
                                                type={item.type}
                                                value={entry[item.name] ?? ""}
                                                placeholder={item.placeholder}
                                                disabled={disabled}
                                                onChange={(event) =>
                                                    updateField(index, item.name, event.target.value)
                                                }
                                                className="w-full rounded-lg border border-white/10 bg-[#090914] p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/60 disabled:opacity-50"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {step === "experience" && (
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(entry.isCurrent)}
                                        disabled={disabled}
                                        onChange={(event) => {
                                            const checked = event.target.checked;

                                            setEntries((previous) =>
                                                previous.map((item, i) =>
                                                    i === index
                                                        ? {
                                                            ...item,
                                                            isCurrent: checked,
                                                            endDate: checked
                                                                ? ""
                                                                : item.endDate,
                                                        }
                                                        : item
                                                )
                                            );
                                        }}
                                        className="h-4 w-4 accent-violet-500"
                                    />
                                    I currently work here
                                </label>
                            )}
                        </div>
                    ))}
                </>
            }

            <div className="flex flex-wrap items-center justify-between gap-3">
                {config.repeatable && 
                    (step !== "internships" || hasInternship === true) && 
                    (step !== "achievements" || hasAchievement === true) && 
                    (step !== "certifications" || hasCertification === true) &&
                    (
                        (step !== "professionalSummary" &&
                            step !== "professional_summary") ||
                        summaryChoice === "manual"
                    ) &&
                    (step !== "links" || hasLinks === true)
                && (
                        <button
                            type="button"
                            onClick={addEntry}
                            disabled={disabled}
                            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                        >
                            <Plus size={16} />
                            Add another
                        </button>
                    )}

                <button
                    type="submit"
                    disabled={
                        disabled ||
                        (step === "internships" && hasInternship === null) ||
                        (step === "achievements" && hasAchievement === null) ||
                        (step === "certifications" && hasCertification === null) ||
                        (
                            (step === "professionalSummary" ||
                                step === "professional_summary") &&
                            (
                                summaryChoice === null ||
                                (
                                    summaryChoice === "manual" &&
                                    !entries[0]?.summary?.trim()
                                )
                            )
                        ) ||
                        (
                            step === "links" &&
                            (
                                hasLinks === null ||
                                (
                                    hasLinks === true &&
                                    !entries.some(
                                        (entry) =>
                                            entry.label?.trim() &&
                                            entry.url?.trim()
                                    )
                                )
                            )
                        )
                    }
                    className="ml-auto flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Submit
                    <Send size={15} />
                </button>
            </div>
        </form>
    );
}
