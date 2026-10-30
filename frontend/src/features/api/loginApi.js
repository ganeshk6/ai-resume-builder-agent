import { api } from "../../utils/api"

export const loginApi = async(payload) => {
    try {
        const {data} = await api.post("api/auth/login", payload);
        return data
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Something went wrong. Please try again.",
        };
    }
}