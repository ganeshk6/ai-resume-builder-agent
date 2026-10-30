import { api } from "../../utils/api";

export const chatSession = async () => {
    try {
        const { data } = await api.post(
            "/api/resume-chat/sessions"
        );

        return data;
    } catch (error) {
        throw error;
    }
};