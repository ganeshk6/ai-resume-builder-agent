import { FileText, X } from 'lucide-react'
import { useDispatch, useSelector } from "react-redux";
import { setCollapseArtifact } from '../../features/chatboatslice/sidebarMenuCollapase';

const Artifact = () => {
    const dispatch = useDispatch()

    return (
        <aside className="hidden w-[360px] shrink-0 flex-col border-l border-white/10 bg-[#0d0d19] xl:flex">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText size={17} className="text-violet-300" />
                    Resume preview
                </div>

                <button
                    onClick={() => dispatch(setCollapseArtifact())}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                    aria-label="Close preview"
                >
                <X size={17} />
                </button>
            </div>

            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-[260px] aspect-[210/297] rounded-sm border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
                    <div className="h-3 w-2/3 rounded bg-slate-300" />
                    <div className="mt-3 h-1.5 w-1/2 rounded bg-slate-200" />

                    <div className="mt-8 h-2 w-1/3 rounded bg-violet-300" />
                    <div className="mt-3 space-y-2">
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                    </div>

                    <div className="mt-7 h-2 w-1/3 rounded bg-violet-300" />
                    <div className="mt-3 space-y-2">
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-5/6 rounded bg-slate-200" />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                    </div>

                    <p className="mt-8 text-center text-[10px] text-slate-400">
                        Your resume preview will appear here.
                    </p>
                </div>
            </div>
        </aside>
    )
}

export default Artifact