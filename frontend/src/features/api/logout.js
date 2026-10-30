import { api } from "../../utils/api"

export const logoutApi = async()=>{
    try {
        const { data } = await api.post("api/auth/logout")
        return data
    } catch (error) {
        return `error with google login ${error}`
    }
}