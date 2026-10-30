import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        return {
            user,
            isAuthenticated: Boolean(user),
            loading: false,
            error: null,
        };
    } catch {
        return {
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
        };
    }
};

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers:{
        setLoading:(state, action) => {
            state.loading = action.payload
        },
        setCredentials:(state, action) => {
            const { user } = action.payload;

            state.user = user;
            state.isAuthenticated = Boolean(user);
            state.loading = false;
            state.error = null;

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }
        },
        setAuthError:(state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;

            localStorage.removeItem("user");
        },
    }
})

export const {setLoading, setCredentials, setAuthError, clearAuthError, logout} = authSlice.actions;

export default authSlice.reducer