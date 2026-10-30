
import {
    StateGraph,
    START,
    END,
} from "@langchain/langgraph";

import { AIMessage } from "@langchain/core/messages";
import { WORKFLOW_STEPS } from "../constants/workflow.constants.js";
import { understandMessage } from "../understand-message.js";
import { updateRequirementsNode } from "../update-requirements.js";
import { ResumeWorkflowState } from "./workflow.state.js";
import { selectNextStepNode } from "../select-next-step.js";
import { validateAndSaveNode } from "../validate-and-save.js";
import { generateResumeNode } from "../generate-resume.js";

async function greetingNode() {
    return {
        currentStep: WORKFLOW_STEPS.INTENT_SELECTION,
        pendingQuestion:
            "Would you like to create a new resume or update an existing one?",
        messages: [
            new AIMessage(
                "Hello! How can I assist you today? Would you like to create a new resume or update an existing one?"
            ),
        ],
    };
}

function routeInitialMessage(state) {
    const hasUserMessage = state.messages.some(
        (message) => message.getType() === "human"
    );

    return hasUserMessage
        ? "understand_message"
        : "greeting";
}

function routeAfterUpdatingRequirements(state) {
    if (
        state.approvalStatus === "approved" &&
        state.currentStep === WORKFLOW_STEPS.GENERATE_RESUME
    ) {
        return "validate_and_save";
    }

    return "select_next_step";
}

function routeAfterValidation(state) {
    if (
        state.approvalStatus === "approved" &&
        state.currentStep === WORKFLOW_STEPS.GENERATE_RESUME
    ) {
        return "generate_resume";
    }

    return END;
}

const workflow = new StateGraph(ResumeWorkflowState)
    .addNode("greeting", greetingNode)
    .addNode("understand_message", understandMessage)
    .addNode("update_requirements", updateRequirementsNode)
    .addNode("validate_and_save", validateAndSaveNode)
    .addNode("select_next_step", selectNextStepNode)
    .addNode("generate_resume", generateResumeNode)

    .addConditionalEdges(START, routeInitialMessage, {
        greeting: "greeting",
        understand_message: "understand_message",
    })

    .addEdge("greeting", END)
    .addEdge("understand_message","update_requirements")

    .addConditionalEdges(
        "update_requirements",
        routeAfterUpdatingRequirements,
        {
            validate_and_save: "validate_and_save",
            select_next_step: "select_next_step",
        }
    )

    .addEdge("select_next_step","validate_and_save")

    .addConditionalEdges(
        "validate_and_save",
        routeAfterValidation,
        {
            generate_resume: "generate_resume",
            [END]: END,
        }
    )

    .addEdge("generate_resume", END);

export const resumeWorkflow = workflow.compile();
