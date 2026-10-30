import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { chatSession as createChatSessionApi } from "../api/chatSession";
import { sendMessage as sendMessageApi } from "../api/sendMessage";
import { getConversations as getConversationsApi } from "../api/getConversations";
import { getMessages as getMessagesApi } from "../api/getMessages";

export const fetchConversations = createAsyncThunk(
    "chat/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getConversationsApi();

            if (!response?.success) {
                throw new Error("Failed to fetch conversations.");
            }

            return response.conversations ?? [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch conversations."
            );
        }
    }
);

export const createChatSession = createAsyncThunk(
    "chat/createSession",
    async (_, { rejectWithValue }) => {
        try {
            const response = await createChatSessionApi();
            const session = response?.session;

            if (!session?.id) {
                throw new Error("Session ID was not returned by the API.");
            }

            return session;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to create chat session."
            );
        }
    }
);

export const fetchChatMessages = createAsyncThunk(
    "chat/fetchMessages",
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await getMessagesApi(sessionId);

            if (!response?.success) {
                throw new Error("Failed to fetch conversation messages.");
            }

            return {
                sessionId,
                messages: response.conversation?.messages ?? [],
                conversation: response.conversation,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch messages."
            );
        }
    }
);



export const sendChatMessage = createAsyncThunk(
    "chat/sendMessage",
    async (
        {
            sessionId,
            content,
            step = null,
            values = null,
            sectionAction = null,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await sendMessageApi(sessionId, {
                content,
                step,
                values,
                sectionAction,
            });

            return {
                sessionId,
                userMessage: content,
                step,
                values,
                sectionAction,
                response,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to send message."
            );
        }
    }
);


const initialState = {
    session: [],
    sessionId: null,
    messages: [],
    currentStep: null,
    pendingQuestion: null,

    requirements: {},
    sectionAction: null,
    resume: null,

    isLoadingConversations: false,
    isCreatingSession: false,
    isLoadingHistory: false,
    isSendingMessage: false,

    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,

    reducers: {
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
            state.messages = [];
            state.requirements = {};
            state.sectionAction = null;
            state.currentStep = null;
            state.pendingQuestion = null;
            state.error = null;
            state.resume = null;
        },

        setMessages: (state, action) => {
            state.messages = action.payload ?? [];
        },

        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },

        clearChat: (state) => {
            state.sessionId = null;
            state.messages = [];
            state.currentStep = null;
            state.pendingQuestion = null;
            state.resume = null;

            state.requirements = {};
            state.sectionAction = null;

            state.error = null;
            state.isLoadingHistory = false;
            state.isSendingMessage = false;
        },

        clearChatError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ==========================================
            // 1. Fetch conversations
            // ==========================================
            .addCase(fetchConversations.pending, (state) => {
                state.isLoadingConversations = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoadingConversations = false;
                state.session = action.payload ?? [];
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoadingConversations = false;
                state.error = action.payload || "Failed to fetch conversations.";
            })

            // ==========================================
            // 2. Create chat session
            // ==========================================
            .addCase(createChatSession.pending, (state) => {
                state.isCreatingSession = true;
                state.error = null;
            })
            .addCase(createChatSession.fulfilled, (state, action) => {
                state.isCreatingSession = false;
                state.resume = null;

                const newSession = action.payload;
                const id = newSession.id || newSession._id;

                state.sessionId = id;
                state.messages = [];
                state.currentStep = newSession.currentStep ?? "greeting";
                state.pendingQuestion = newSession.pendingQuestion ?? null;

                state.session = [
                    newSession,
                    ...state.session.filter(
                        (item) => (item.id || item._id) !== id
                    ),
                ];
            })
            .addCase(createChatSession.rejected, (state, action) => {
                state.isCreatingSession = false;
                state.error = action.payload || "Failed to create chat session.";
            })

            // ==========================================
            // 3. Fetch chat history
            // ==========================================
            .addCase(fetchChatMessages.pending, (state, action) => {
                state.isLoadingHistory = true;
                state.sessionId = action.meta.arg;
                state.messages = [];
                state.currentStep = null;
                state.pendingQuestion = null;
                state.error = null;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.isLoadingHistory = false;

                if (state.sessionId !== action.payload.sessionId) {
                    return;
                }

                const conversation = action.payload.conversation;

                state.messages = action.payload.messages ?? [];

                state.currentStep = conversation?.currentStep ?? null;
                state.pendingQuestion = conversation?.pendingQuestion ?? null;
                state.requirements = conversation?.requirements ?? {};
                state.sectionAction = conversation?.sectionAction ?? null;

                // Save resume download data in Redux
                state.resume = conversation?.resume ?? null;
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.isLoadingHistory = false;

                if (state.sessionId === action.meta.arg) {
                    state.error = action.payload || "Failed to load chat history.";
                }
            })

            // ==========================================
            // 4. Send message - pending
            // ==========================================
            .addCase(sendChatMessage.pending, (state, action) => {
                state.isSendingMessage = true;
                state.error = null;

                if (state.sessionId === action.meta.arg.sessionId) {
                    state.messages.push({
                        role: "user",
                        content: action.meta.arg.content,
                    });
                }
            })

            // ==========================================
            // 5. Send message - fulfilled
            // ==========================================
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.isSendingMessage = false;

                if (state.sessionId !== action.payload.sessionId) {
                    return;
                }

                const response = action.payload.response;

                // API helper returns the Axios response body.
                // Controller returns { success: true, data: result }.
                const data = response?.data ?? response;

                const result = data?.data ?? data;

                if (typeof result?.title === "string") {
                    const conversation = state.session.find(
                        (item) =>
                            String(item.id || item._id) ===
                            String(action.payload.sessionId)
                    );

                    if (conversation) {
                        conversation.title = result.title;
                    }
                }

                if (result?.sectionAction !== undefined) {
                    state.sectionAction = result.sectionAction;
                }

                if (result?.requirements) {
                    state.requirements = result.requirements;
                }

                
                const reply =
                    result?.reply ??
                    result?.message?.content ??
                    result?.assistantMessage?.content;

                if (typeof reply === "string" && reply.trim()) {
                    state.messages.push({
                        role: "assistant",
                        content: reply,
                        downloadUrl: result?.downloadUrl ?? null,
                        format: result?.format ?? result?.requestedFormat ?? "pdf",
                        resumeId: result?.resumeId ?? null,
                        resumeVersionId: result?.resumeVersionId ?? null,
                    });
                }

                state.currentStep =
                    result?.currentStep ??
                    state.currentStep;

                state.pendingQuestion =
                    result?.pendingQuestion ??
                    state.pendingQuestion;
            })

            // ==========================================
            // 6. Send message - rejected
            // ==========================================
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.isSendingMessage = false;
                state.error = action.payload || "Failed to send message.";

                if (state.sessionId === action.meta.arg.sessionId) {
                    // Remove the optimistic user message.
                    state.messages.pop();
                }
            });
    },
});

export const {
    setSessionId,
    setMessages,
    addMessage,
    clearChat,
    clearChatError,
} = chatSlice.actions;

export default chatSlice.reducer;