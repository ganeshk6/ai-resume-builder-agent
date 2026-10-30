import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import authModalReducer from "../features/auth/authModalSlice";
import sidebarMenuCollapaseReducer from "../features/chatboatslice/sidebarMenuCollapase";
import chatReducer from "../features/chatboatslice/chatSlice";

export const store = configureStore({
    reducer:{
        auth: authReducer,
        authModal: authModalReducer,
        sidebarCollapse: sidebarMenuCollapaseReducer,
        chat: chatReducer,
    }
})