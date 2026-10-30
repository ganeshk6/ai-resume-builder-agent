import { api } from "../../utils/api";

export const getConversations = async () => {
    try {
        const { data } = await api.get(`/api/resume-chat/sessions`);
        return data;
    } catch (error) {
        throw error;
    }
};