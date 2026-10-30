import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    MessageSquare,
    PanelLeftClose,
    Plus,
    Sparkles,
} from "lucide-react";

import { setCollapseSidebar } from "../../features/chatboatslice/sidebarMenuCollapase";
import { fetchConversations } from "../../features/chatboatslice/chatSlice";
import { useNavigate } from "react-router-dom";
import { clearChat } from "../../features/chatboatslice/chatSlice";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isOpen } = useSelector((state) => state.sidebarCollapse);
    const { session, sessionId, isLoadingConversations } = useSelector((state) => state.chat);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);
    
    const handleNewResume = () => {
        dispatch(clearChat());
        navigate("/create-resume/");
    };

    const handleSelectConversation = (conv) => {
        const id = conv.id || conv._id;

        if (!id) return;

        navigate(`/create-resume/${id}`);
    };

    return (
        <aside
            className={`
                ${isOpen ? "flex" : "hidden"}
                fixed inset-y-0 left-0 z-40
                h-dvh w-[280px] max-w-[85vw]
                flex-col overflow-hidden
                border-r border-white/10
                bg-[#0d0d19] text-white
                md:relative md:z-auto md:w-[280px] md:max-w-none
            `}
        >
            {/* Header: fixed */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                        <Sparkles size={19} />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold tracking-wide">
                            Resume AI
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            Your career assistant
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => dispatch(setCollapseSidebar())}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close sidebar"
                >
                    <PanelLeftClose size={19} />
                </button>
            </div>

            {/* New resume button: fixed */}
            <div className="shrink-0 px-3 pt-4">
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 active:scale-[0.98]"
                    onClick={handleNewResume}
                >
                    <Plus size={18} />
                    New resume
                </button>
            </div>

            {/* Conversations heading: fixed */}
            <div className="shrink-0 px-4 pb-2 pt-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Your conversations
                </p>
            </div>

            {/* ONLY THIS SECTION SCROLLS */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex flex-col gap-1">
                    {session.map((conv) => (
                        <button
                            key={conv.id || conv._id}
                            type="button"
                            title={conv.title || "New conversation"}
                            className={`group flex w-full min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-sm text-slate-400 transition hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-white
                                ${sessionId == conv.id ? "border-white/[0.06] bg-white/[0.06] text-white" :  ""}`}
                            onClick={()=> handleSelectConversation(conv)}
                        >
                            <MessageSquare
                                size={17}
                                className="shrink-0 text-slate-500 transition group-hover:text-violet-400"
                            />

                            <span className="min-w-0 flex-1 truncate">
                                {conv.title || "New conversation"}
                            </span>
                        </button>
                    ))}

                    {session.length === 0 && (
                        <p className="px-3 py-5 text-center text-xs leading-5 text-slate-500">
                            No conversations yet. Start a new resume to begin.
                        </p>
                    )}
                </div>
            </div>

            {/* Footer: fixed */}
            <div className="shrink-0 border-t border-white/[0.08] bg-[#0d0d19] px-4 py-4">
                <p className="text-xs font-medium text-slate-300">
                    AI Resume Builder
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    Build your next opportunity.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;