import { resumeWorkflow } from "../../aiWorkflow/workflow/workflow.graph.js";
import chatMessageModel from "../models/chatMessage.model.js";
import chatSessionModel from "../models/chatSession.model.js";
import {HumanMessage,AIMessage} from "@langchain/core/messages";

export async function createChatSession(userId, language = "en") {
  return chatSessionModel.create({
    userId,
    language,
    intent: "undecided",
    currentStep: "greeting",
    status: "active",
  });
}

function toPlainRequirements(requirements) {
    if (!requirements) return {};

    let plainRequirements;

    if (requirements instanceof Map) {
        plainRequirements = Object.fromEntries(requirements.entries());
    } else if (typeof requirements.toObject === "function") {
        plainRequirements = requirements.toObject();
    } else if (typeof requirements.toJSON === "function") {
        plainRequirements = requirements.toJSON();
    } else {
        plainRequirements = requirements;
    }

    return Object.fromEntries(
        Object.entries(plainRequirements).map(([key, requirement]) => {
            const item =
                requirement?.toObject?.() ?? requirement ?? {};

            return [
                key,
                {
                    ...item,
                    updatedAt:
                        item.updatedAt instanceof Date
                            ? item.updatedAt.toISOString()
                            : item.updatedAt ?? null,
                },
            ];
        })
    );
}

export async function sendMessage({
    userId,
    sessionId,
    content,
    step = null,
    values = null,
    sectionAction = null,
}) {
    // 1. Find and validate the chat session
    const session = await chatSessionModel.findOne({
        _id: sessionId,
        userId,
    });

    if (!session) {
        const error = new Error("Chat session not found");
        error.statusCode = 404;
        throw error;
    }

    if (session.status === "completed") {
        session.status = "active";
        await session.save();
    }

    if (!["active", "collecting", "review"].includes(session.status)) {
        const error = new Error("This chat session is not active");
        error.statusCode = 400;
        throw error;
    }

    // 2. Convert submitted form values into a readable message
    const formContent =
        values && typeof values === "object"
            ? Object.entries(values)
                  .map(([key, value]) => {
                      const label = key
                          .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                          .replace(/^./, (char) => char.toUpperCase());

                      const formattedValue = Array.isArray(value)
                          ? value
                                .map((item) =>
                                    typeof item === "object" && item !== null
                                        ? JSON.stringify(item)
                                        : String(item)
                                )
                                .join(", ")
                          : typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value ?? "");

                      return `${label}: ${formattedValue}`;
                  })
                  .join("\n")
            : null;

    const messageContent =
        typeof content === "string" && content.trim()
            ? content.trim()
            : formContent || "Submitted resume details";

    // 3. Save the user's latest message
    await chatMessageModel.create({
        sessionId: session._id,
        userId,
        role: "user",
        messageType: "text",
        content: messageContent,
    });

    // 4. Load the complete conversation history
    const history = await chatMessageModel
        .find({
            sessionId: session._id,
            userId,
        })
        .sort({ createdAt: 1 })
        .lean();

    // 5. Convert MongoDB messages into LangChain messages
    const workflowMessages = history.map((message) =>
        message.role === "assistant"
            ? new AIMessage(message.content)
            : new HumanMessage(message.content)
    );

    console.log("Session ID:", session._id.toString());
    console.log("Current step:", session.currentStep);
    console.log("Requested format:", session.requestedFormat);
    console.log("Single page only:", session.singlePageOnly);
    console.log("History message count:", workflowMessages.length);

    // 6. Invoke the resume workflow
    const result = await resumeWorkflow.invoke({
        userId: userId.toString(),
        sessionId: session._id.toString(),
        resumeId: session.resumeId?.toString() ?? null,

        intent: session.intent,
        currentStep: session.currentStep,
        pendingQuestion: session.pendingQuestion ?? null,

        requirements: toPlainRequirements(session.requirements),

        experienceType:
            session.experienceType ??
            session.requirements?.experienceType?.value ??
            null,

        // Resume generation preferences
        requestedFormat: session.requestedFormat ?? "pdf",
        singlePageOnly: session.singlePageOnly ?? false,

        // Form submission data
        formStep: step,
        formValues: values,
        sectionAction,

        // Conversation history
        messages: workflowMessages,
    });

    console.log("========== WORKFLOW RESULT ==========");
    console.log("Current Step:", result.currentStep);
    console.log("Intent:", result.intent);
    console.log("Resume ID:", result.resumeId);
    console.log("Resume Version ID:", result.resumeVersionId);
    console.log("Download URL:", result.downloadUrl);
    console.log("Messages:", result.messages?.map((m) => m.content));
    console.log("=====================================");

    // 7. Prepare session updates from the workflow result
    const sessionUpdates = {
        currentStep: result.currentStep,
        pendingQuestion: result.pendingQuestion ?? null,

        requestedFormat:
            result.requestedFormat ??
            session.requestedFormat ??
            "pdf",

        singlePageOnly:
            result.singlePageOnly ??
            session.singlePageOnly ??
            false,

        approvalStatus:
            result.approvalStatus ??
            session.approvalStatus ??
            "not_required",

        // ADD THIS
        ...(result.resumeId
            ? { resumeId: result.resumeId }
            : {}),
    };

    // Update intent only when the workflow returns a valid value
    if (
        ["undecided", "create_resume", "update_resume", "improve_resume"].includes(
            result.intent
        )
    ) {
        sessionUpdates.intent = result.intent;
    }

    if (result.experienceType) {
        sessionUpdates.experienceType = result.experienceType;
    }

    if (result.requirements) {
        sessionUpdates.requirements = result.requirements;
    }

    // 8. Generate a conversation title from the target role
    const targetRole =
        result.requirements?.targetRole?.value ??
        session.requirements?.targetRole?.value;

    if (!session.title || session.title === "New Conversation") {
        if (typeof targetRole === "string" && targetRole.trim()) {
            sessionUpdates.title =
                `Resume - ${targetRole.trim()}`.slice(0, 100);
        }
    }

    // 9. Persist updated session fields
    await chatSessionModel.updateOne(
        {
            _id: session._id,
            userId,
        },
        {
            $set: sessionUpdates,
        }
    );

    // 10. Get the latest AI response from the workflow
    const assistantMessage = result.messages
        ?.filter((message) => message.getType() === "ai")
        .at(-1);

    const reply = assistantMessage?.content;

    if (typeof reply !== "string" || !reply.trim()) {
        throw new Error(
            "AI did not return a valid text response. Check the workflow nodes."
        );
    }

    const assistantChatMessage = await chatMessageModel.create({
        sessionId: session._id,
        userId,
        role: "assistant",
        messageType: "text",
        content: reply,

        downloadUrl: result.downloadUrl ?? null,
        format: result.format ?? null,
        resumeId: result.resumeId ?? null,
        resumeVersionId: result.resumeVersionId ?? null,
    });

    // 12. Return the updated data to the frontend
    return {
        sessionId: session._id.toString(),

        title:
            sessionUpdates.title ??
            session.title ??
            "New Conversation",

        reply,

        currentStep: result.currentStep,
        pendingQuestion: result.pendingQuestion ?? null,

        intent: result.intent ?? sessionUpdates.intent ?? session.intent,

        sectionAction: result.sectionAction ?? null,

        requirements: toPlainRequirements(
            result.requirements ?? session.requirements
        ),

        requestedFormat: sessionUpdates.requestedFormat,
        singlePageOnly: sessionUpdates.singlePageOnly,
        approvalStatus: sessionUpdates.approvalStatus,

        // Generated resume details
        resume: result.downloadUrl
            ? {
                resumeId: result.resumeId,
                resumeVersionId: result.resumeVersionId,
                downloadUrl: result.downloadUrl,
                format: result.format,
                fileName: result.fileName,
                pageCount: result.pageCount,
            }
            : null,

        resumeId: result.resumeId ?? session.resumeId?.toString() ?? null,
        resumeVersionId: result.resumeVersionId ?? null,
        downloadUrl: result.downloadUrl ?? null,
        format: result.format ?? null,
        fileName: result.fileName ?? null,
        pageCount: result.pageCount ?? null,
    };
}
