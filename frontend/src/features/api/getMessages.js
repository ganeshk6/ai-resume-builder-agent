import { api } from "../../utils/api";

export const getMessages = async (sessionId) => {
    try {
        const { data } = await api.get(`/api/resume-chat/sessions/${sessionId}/messages`);
        return data;
    } catch (error) {
        throw error;
    }
};