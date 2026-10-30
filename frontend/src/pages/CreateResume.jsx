
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  Menu,
  FileText,
  Paperclip,
  ArrowUp,
  PanelRight,
  ChevronDown,
  Download,
  FileDown,
} from "lucide-react";
import Sidebar from "../components/chatbot/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { setCollapseArtifact, setCollapseSidebar } from "../features/chatboatslice/sidebarMenuCollapase";
import Artifact from "../components/chatbot/Artifact";
import { useNavigate, useParams } from "react-router-dom";
import {createChatSession,sendChatMessage,clearChatError,clearChat,fetchChatMessages} from "../features/chatboatslice/chatSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DynamicStepForm from "../components/chatbot/DynamicStepForm";
import ResumeDownload from "../components/chatbot/ResumeDownload";

const CreateResume = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const shouldScrollToBottomRef = useRef(false);
    const skipNextHistoryFetchRef = useRef(false);
    const { isOpen, artifact } =  useSelector((state)=>state.sidebarCollapse);
    const { sessionId: urlSessionId } = useParams();
    const {messages,currentStep,pendingQuestion,sectionAction,requirements,isCreatingSession,isSendingMessage,isLoadingHistory,error,resume} = useSelector((state) => state.chat);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [pendingMessage, setPendingMessage] = useState(null);

    const [prompt, setPrompt] = useState("");
    const loading = isCreatingSession || isSendingMessage;

    const scrollToBottom = (behavior = "smooth") => {
        const container = chatContainerRef.current;

        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior,
        });
    };

    const handleChatScroll = () => {
        const container = chatContainerRef.current;

        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        setShowScrollBottom(distanceFromBottom > 100);
    };

    useEffect(() => {
        if (urlSessionId) {

            // Skip history fetch for newly created session
            if (skipNextHistoryFetchRef.current) {
                skipNextHistoryFetchRef.current = false;
                return;
            }

            shouldScrollToBottomRef.current = true;
            dispatch(fetchChatMessages(urlSessionId));

        } else {
            dispatch(clearChat());
            setPendingMessage(null);
            shouldScrollToBottomRef.current = false;
        }
    }, [urlSessionId, dispatch]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const content = prompt.trim();

        if (!content || loading) return;

        dispatch(clearChatError());

        shouldScrollToBottomRef.current = true;

        // Immediately show user's first message
        setPendingMessage({
            _id: `temp-${Date.now()}`,
            role: "user",
            content,
        });

        // Immediately clear textarea
        setPrompt("");

        try {
            let activeSessionId = urlSessionId;

            // Create session only for a new conversation
            if (!activeSessionId) {
                const session = await dispatch(
                    createChatSession()
                ).unwrap();

                activeSessionId = session.id;

                // Skip history fetch after navigation
                skipNextHistoryFetchRef.current = true;

                navigate(`/create-resume/${activeSessionId}`, {
                    replace: true,
                });
            }

            await dispatch(
                sendChatMessage({
                    sessionId: activeSessionId,
                    content,
                })
            ).unwrap();

        } catch (error) {
            console.error("Chat error:", error);

            // Restore message if request fails
            setPrompt(content);
        } finally {
            setPendingMessage(null);
        }
    };

    const formatStepName = (step) => {
        const labels = {
            target_role: "Target Role",
            skills: "Skills",
            experience_type: "Experience Type",
            education: "Education",
            experience: "Work Experience",
            internships: "Internships",
            projects: "Projects",
            achievements: "Achievements",
            certifications: "Certifications",
            professional_summary: "Professional Summary",
            professionalSummary: "Professional Summary",
            links: "Professional Links",
        };

        return labels[step] ?? step.replaceAll("_", " ");
    };

    
    const formatAnswer = (values) => {
        if (values && typeof values === "object") {
            if (values.hasInternship === false) return "No";
            if (values.hasAchievement === false) return "No";
            if (values.hasCertification === false) return "No";
            if (values.hasLinks === false) return "None";
        }

        // Professional links
        if (values?.hasLinks === true && Array.isArray(values.entries)) {
            return values.entries
                .map((link, index) => {
                    const details = [
                        link.label ? `${link.label}: ${link.url}` : link.url,
                    ].filter(Boolean);

                    return details.length
                        ? `${index + 1}. ${details.join(" - ")}`
                        : "";
                })
                .filter(Boolean)
                .join("\n");
        }

        // Internships
        if (
            typeof values === "object" &&
            values !== null &&
            typeof values.hasInternship === "boolean"
        ) {
            if (!values.hasInternship) return "No";

            const entries = Array.isArray(values.entries)
                ? values.entries
                : [];

            const labels = {
                companyName: "Company",
                organization: "Organization",
                role: "Role",
                designation: "Designation",
                startDate: "Start date",
                endDate: "End date",
                description: "Description",
                organizationUrl: "Company website",
            };

            return entries
                .map((entry, index) => {
                    const details = Object.entries(entry)
                        .filter(
                            ([key, value]) =>
                                key !== "isCurrent" &&
                                value !== "" &&
                                value !== null &&
                                value !== undefined
                        )
                        .map(([key, value]) => {
                            const label = labels[key] ?? key;
                            const formattedValue = Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value);

                            return `- ${label}: ${formattedValue}`;
                        })
                        .join("\n");

                    return details
                        ? `Internship ${index + 1}:\n${details}`
                        : "";
                })
                .filter(Boolean)
                .join("\n\n");
        }

        // Arrays of entries
        if (Array.isArray(values)) {
            return values
                .map((entry, index) => {
                    if (!entry || typeof entry !== "object") {
                        return `${index + 1}. ${String(entry)}`;
                    }

                    const details = Object.entries(entry)
                        .filter(
                            ([key, value]) =>
                                key !== "isCurrent" &&
                                value !== "" &&
                                value !== null &&
                                value !== undefined
                        )
                        .map(([key, value]) => {
                            const label = {
                                jobTitle: "Job role",
                                companyName: "Company",
                                experienceType: "Experience type",
                                startDate: "Start date",
                                endDate: "End date",
                                description: "Description",
                                skills: "Skills",
                                summary: "Summary",
                            }[key] ?? key;

                            const formattedValue = Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value);

                            return `${label}: ${formattedValue}`;
                        })
                        .join(", ");

                    return details ? `${index + 1}. ${details}` : "";
                })
                .filter(Boolean)
                .join("\n");
        }

        // Regular form objects (Target Role, Skills, Education, Summary, etc.)
        if (typeof values === "object" && values !== null) {
            const labels = {
                jobTitle: "Job role",
                targetRole: "Target role",
                experienceType: "Experience type",
                skills: "Skills",
                summary: "Summary",
                degree: "Degree",
                institution: "Institution",
                graduationYear: "Graduation year",
                grade: "Grade",
                hasInternship: "Internship",
                hasAchievement: "Achievements",
                hasCertification: "Certifications",
                hasLinks: "Professional links",
            };

            return Object.entries(values)
                .filter(
                    ([key, value]) =>
                        key !== "isCurrent" &&
                        value !== "" &&
                        value !== null &&
                        value !== undefined
                )
                .map(([key, value]) => {
                    const label = labels[key] ?? key;

                    let formattedValue;

                    if (Array.isArray(value)) {
                        formattedValue = value
                            .map((item) =>
                                typeof item === "object" && item !== null
                                    ? Object.entries(item)
                                        .filter(
                                            ([itemKey, itemValue]) =>
                                                itemKey !== "isCurrent" &&
                                                itemValue !== "" &&
                                                itemValue !== null &&
                                                itemValue !== undefined
                                        )
                                        .map(
                                            ([itemKey, itemValue]) =>
                                                `${itemKey}: ${
                                                    Array.isArray(itemValue)
                                                        ? itemValue.join(", ")
                                                        : itemValue
                                                }`
                                        )
                                        .join(", ")
                                    : String(item)
                            )
                            .filter(Boolean)
                            .join(", ");
                    } else if (typeof value === "object") {
                        formattedValue = JSON.stringify(value);
                    } else {
                        formattedValue = String(value);
                    }

                    return `${label}: ${formattedValue}`;
                })
                .join("\n");
        }

        return String(values ?? "");
    };
    
    const handleDynamicFormSubmit = async ({
        step,
        values,
        content: customContent,
        sectionAction: submittedAction = sectionAction ?? "edit",
    }) => {
        if (!urlSessionId || loading) return;

        dispatch(clearChatError());
        shouldScrollToBottomRef.current = true;

        const formattedValues = Array.isArray(values)
            ? { entries: values }
            : values;

        const content =
            customContent ??
            `${formatStepName(step)}:\n${formatAnswer(values)}`;

        try {
            await dispatch(
                sendChatMessage({
                    sessionId: urlSessionId,
                    content,
                    step,
                    values: formattedValues,
                    sectionAction: submittedAction,
                })
            ).unwrap();
        } catch (error) {
            shouldScrollToBottomRef.current = false;
            console.error("Form submission error:", error);
        }
    };

    useLayoutEffect(() => {
        if (isLoadingHistory || !shouldScrollToBottomRef.current) {
            return;
        }

        const frameId = requestAnimationFrame(() => {
            scrollToBottom("auto");
            shouldScrollToBottomRef.current = false;
        });

        return () => cancelAnimationFrame(frameId);
    }, [messages, pendingMessage, isLoadingHistory]);

    return (
        <div className="flex h-dvh overflow-hidden bg-[#090914] text-white">
        <Sidebar />

        {/* Main chat */}
            <section className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
                    <div className="flex items-center gap-3">
                        {!isOpen && (
                            <button
                                onClick={() => {dispatch(setCollapseSidebar())}}
                                className="rounded-lg p-2 hover:bg-white/10"
                                aria-label="Open sidebar"
                            >
                                <Menu size={19} />
                            </button>
                        )}

                        <h1 className="text-sm font-semibold">
                        Resume Assistant
                        </h1>
                    </div>

                    <button
                        onClick={() => dispatch(setCollapseArtifact())}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                        aria-label="Toggle resume preview"
                    >
                        <PanelRight size={19} />
                    </button>
                </header>

                <div className="flex min-h-0 flex-1">
                    <main className="flex min-w-0 flex-1 flex-col">
                        
                        <div className="relative flex min-h-0 flex-1 flex-col">
                            <div
                                ref={chatContainerRef}
                                onScroll={handleChatScroll}
                                className="chat-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-8"
                            >
                                {isLoadingHistory ? (
                                    <div className="flex min-h-full items-center justify-center text-center text-sm text-slate-400">
                                        Loading conversation...
                                    </div>
                                ) : messages.length === 0 && !pendingMessage ? (
                                    // Yahan apna existing welcome screen wala JSX rakho
                                    <div className="flex min-h-full items-center justify-center">
                                        <div className="w-full max-w-2xl">
                                            <div className="mb-8 text-center">
                                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                                                    <FileText
                                                    size={28}
                                                    className="text-violet-300"
                                                    />
                                                </div>

                                                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                                    Let's build your resume.
                                                </h2>

                                                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                                                    Tell me about your experience, skills, and
                                                    career goals. I'll help you create an
                                                    ATS-friendly resume.
                                                </p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {[
                                                    "Create a resume from scratch",
                                                    "Improve my existing resume",
                                                    "Tailor my resume to a job",
                                                    "Highlight my technical skills",
                                                ].map((suggestion) => (
                                                    <button
                                                    key={suggestion}
                                                    onClick={() => setPrompt(suggestion)}
                                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/[0.06]"
                                                    >
                                                    {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                                        {messages.map((message, index) => (
                                            <div
                                                key={message._id ?? `${index}-${message.role}`}
                                                className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                                                    message.role === "user"
                                                        ? "ml-auto whitespace-pre-wrap bg-violet-600 text-white"
                                                        : "mr-auto w-full border border-white/10 bg-[#141421] text-slate-200"
                                                }`}
                                            >
                                                
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        h1: ({ children }) => (
                                                            <h1 className="mb-4 mt-2 text-2xl font-bold tracking-tight text-white">
                                                                {children}
                                                            </h1>
                                                        ),
                                                        h2: ({ children }) => (
                                                            <h2 className="mb-3 mt-6 border-b border-white/10 pb-2 text-lg font-semibold text-white">
                                                                {children}
                                                            </h2>
                                                        ),
                                                        h3: ({ children }) => (
                                                            <h3 className="mb-2 mt-4 text-base font-semibold text-violet-200">
                                                                {children}
                                                            </h3>
                                                        ),
                                                        p: ({ children }) => (
                                                            <p className="mb-3 leading-7 text-slate-300 last:mb-0">
                                                                {children}
                                                            </p>
                                                        ),
                                                        ul: ({ children }) => (
                                                            <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-300">
                                                                {children}
                                                            </ul>
                                                        ),
                                                        ol: ({ children }) => (
                                                            <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-300">
                                                                {children}
                                                            </ol>
                                                        ),
                                                        li: ({ children }) => (
                                                            <li className="pl-1 leading-7">{children}</li>
                                                        ),
                                                        strong: ({ children }) => (
                                                            <strong className="font-semibold text-white">
                                                                {children}
                                                            </strong>
                                                        ),
                                                        a: ({ href, children }) => (
                                                            <a
                                                                href={href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-violet-300 underline underline-offset-4 hover:text-violet-200"
                                                            >
                                                                {children}
                                                            </a>
                                                        ),
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="my-4 border-l-2 border-violet-400 pl-4 text-slate-400">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        table: ({ children }) => (
                                                            <div className="my-4 overflow-x-auto">
                                                                <table className="w-full border-collapse text-left text-sm">
                                                                    {children}
                                                                </table>
                                                            </div>
                                                        ),
                                                        th: ({ children }) => (
                                                            <th className="border border-white/10 bg-white/5 px-3 py-2 font-semibold text-white">
                                                                {children}
                                                            </th>
                                                        ),
                                                        td: ({ children }) => (
                                                            <td className="border border-white/10 px-3 py-2 text-slate-300">
                                                                {children}
                                                            </td>
                                                        ),
                                                        hr: () => <hr className="my-5 border-white/10" />,
                                                        code: ({ children, className }) => (
                                                            <code className={`${className ?? ""} rounded bg-black/30 px-1.5 py-0.5 text-violet-200`}>
                                                                {children}
                                                            </code>
                                                        ),
                                                    }}
                                                >
                                                    {message.content ?? ""}
                                                </ReactMarkdown>
                                                
                                                {message.role === "assistant" && message.downloadUrl && (
                                                    <ResumeDownload
                                                        downloadUrl={message.downloadUrl}
                                                        format={message.format ?? "pdf"}
                                                    />
                                                )}
                                                {message.role === "assistant" &&
                                                    index === messages.length - 1 &&
                                                    currentStep &&
                                                    currentStep !== "greeting" &&
                                                    currentStep !== "review" && (
                                                        <DynamicStepForm
                                                            key={`${urlSessionId}-${currentStep}`}
                                                            step={currentStep}
                                                            requirements={requirements}
                                                            sectionAction={sectionAction}
                                                            onSubmit={handleDynamicFormSubmit}
                                                            disabled={loading}
                                                        />
                                                    )}
                                            </div>
                                        ))}

                                        {(isSendingMessage || pendingMessage) && (
                                            <div className="mr-auto flex items-center gap-2 rounded-xl border border-white/10 bg-[#141421] px-4 py-3 text-sm text-slate-400">
                                                <span className="flex gap-1">
                                                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                                                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                                                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
                                                </span>
                                                <span>Thinking...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {showScrollBottom && (
                                <button
                                    type="button"
                                    onClick={() => scrollToBottom("smooth")}
                                    className="absolute bottom-4 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#20202e] text-white shadow-lg transition hover:bg-violet-600"
                                    aria-label="Scroll to latest message"
                                    title="Scroll to bottom"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            )}
                        </div>

                        <div className="w-full px-4 pb-5">
                            <form
                                onSubmit={handleSubmit}
                                className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#141421] p-3 shadow-xl focus-within:border-violet-400/40"
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    placeholder="Tell me what kind of resume you want..."
                                    rows={2}
                                    disabled={loading}
                                    className="chat-scrollbar-hidden max-h-40 min-h-14 w-full resize-y overflow-y-auto bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                                />

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                                        aria-label="Attach resume"
                                    >
                                        <Paperclip size={19} />
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!prompt.trim() || loading}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Send message"
                                    >
                                        {loading ? "..." : <ArrowUp size={20} />}
                                    </button>
                                </div>
                            </form>
                            {error && (
                                <p className="mx-auto mt-2 max-w-3xl text-sm text-red-400">
                                    {error}
                                </p>
                            )}
                            <p className="mt-3 text-center text-[11px] text-slate-600">
                                AI-generated content may need review before use.
                            </p>
                        </div>
                    </main>

                    {artifact && (
                        <Artifact />
                    )}
                </div>
            </section>
        </div>
    );
};

export default CreateResume;
