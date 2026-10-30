
import { api } from "../../utils/api";

export const sendMessage = async (sessionId, payload) => {
    try {
        const { data } = await api.post(
            `/api/resume-chat/sessions/${sessionId}/messages`,
            {
                content: payload.content,
                step: payload.step ?? null,
                values: payload.values ?? null,
                sectionAction: payload.sectionAction ?? null,
            }
        );

        return data;
    } catch (error) {
        throw error;
    }
};
