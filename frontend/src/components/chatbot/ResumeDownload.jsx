
import { Download, FileText } from "lucide-react";

const ResumeDownload = ({ downloadUrl, format = "pdf" }) => {
    if (!downloadUrl) return null;

    return (
        <div className="mt-4 flex max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <FileText size={24} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                    My Resume.{format}
                </p>
                <p className="text-xs text-slate-400">
                    PDF document
                </p>
            </div>

            <a
                href={downloadUrl}
                download
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500"
                title="Download resume"
                aria-label="Download resume"
            >
                <Download size={19} />
            </a>
        </div>
    );
};

export default ResumeDownload;
