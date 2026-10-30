import { createSlice } from "@reduxjs/toolkit";

const sidebarMenuCollapaseSlice = createSlice({
    name:"sidemenu",
    initialState:{
        isOpen: true,
        artifact: true
    },
    reducers:{
        setCollapseSidebar:(state)=>{
            state.isOpen = !state.isOpen
        },
        setCollapseArtifact:(state)=>{
            state.artifact = !state.artifact
        }
    }
})

export const { setCollapseSidebar, setCollapseArtifact } = sidebarMenuCollapaseSlice.actions;
export default sidebarMenuCollapaseSlice.reducer;