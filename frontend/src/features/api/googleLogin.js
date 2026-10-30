import { api } from "../../utils/api"

export const googleLogin = async(gToken) => {
    try {
        const { data } = await api.post("api/auth/google", {idToken: gToken});
        return data
    } catch (error) {
        return `error with google login ${error}`
    }

}