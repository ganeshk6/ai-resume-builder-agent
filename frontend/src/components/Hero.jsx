import React, { useState } from 'react'
import {
  Sparkles,
  FileText,
  WandSparkles,
  Send,
  ShieldCheck,
  ChevronRight,
  FileCheck2,
  Code2,
  ChartNoAxesCombined,
  Palette,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const examples = [
  { icon: Code2, label: "Software Developer" },
  { icon: ChartNoAxesCombined, label: "Data Analyst" },
  { icon: Palette, label: "UI/UX Designer" },
  { icon: GraduationCap, label: "Fresher" },
];
const Hero = ({containerClass}) => {
    const [prompt, setPrompt] = useState("");
    const [selectedExample, setSelectedExample] = useState("");
    const navigate = useNavigate();

    const startBuilding = (text = prompt) => {
        const cleanedPrompt = text.trim();

        if (!cleanedPrompt) {
            document.getElementById("resume-prompt")?.focus();
            return;
        }

        navigate("/create-resume", {
            state: { initialPrompt: cleanedPrompt },
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        startBuilding();
    };

    const handleExampleClick = (label) => {
        setSelectedExample(label);
        setPrompt(
            `I want to build a professional ${label} resume. Ask me the necessary questions about my background, skills, education, experience and projects before creating it.`
        );
        document.getElementById("resume-prompt")?.focus();
    };

    return (
        <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[440px] w-[700px] max-w-full -translate-x-1/2 rounded-full bg-violet-600/[0.14] blur-[120px]" />
          <div className="absolute left-[-160px] top-[300px] h-72 w-72 rounded-full bg-indigo-600/[0.08] blur-[100px]" />
          <div className="absolute right-[-150px] top-[350px] h-72 w-72 rounded-full bg-fuchsia-600/[0.07] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        </div>

        <div className={`${containerClass} pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24`}>
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-2 text-xs font-medium text-violet-200 shadow-[0_0_25px_rgba(139,92,246,0.07)] sm:px-4 sm:text-sm">
              <Sparkles size={15} className="shrink-0 text-violet-400" />
              <span>Meet your personal AI resume assistant</span>
              <ChevronRight size={15} className="shrink-0 text-violet-400" />
            </div>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[76px]">
              Your next opportunity
              <br />
              starts with a{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  better resume.
                </span>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-violet-500/70 via-fuchsia-400/70 to-transparent sm:-bottom-2" />
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8 md:text-lg">
              Tell us your story. Our AI helps transform your skills, projects,
              and experience into a professional resume built around your career
              goals.
            </p>

            {/* PROMPT BUILDER */}
            <div id="resume-builder" className="mx-auto mt-10 max-w-3xl scroll-mt-28">
              <form
                onSubmit={handleSubmit}
                className="group relative rounded-[24px] border border-violet-400/20 bg-[#11111f]/95 p-3 text-left shadow-[0_20px_100px_rgba(76,29,149,0.12)] backdrop-blur-2xl transition-all duration-300 focus-within:border-violet-400/50 focus-within:shadow-[0_20px_100px_rgba(124,58,237,0.16)] sm:rounded-[28px] sm:p-4"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-violet-500/[0.05] via-transparent to-fuchsia-500/[0.04] sm:rounded-[28px]" />

                <div className="relative flex items-start gap-3 px-2 pt-2 sm:px-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <WandSparkles size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="resume-prompt"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      What kind of resume do you want to build?
                    </label>
                    <textarea
                      id="resume-prompt"
                      rows={3}
                      value={prompt}
                      onChange={(event) => {
                        setPrompt(event.target.value);
                        if (selectedExample) setSelectedExample("");
                      }}
                      placeholder="e.g. I'm a fresher software developer with React, Node.js and 3 projects..."
                      className="w-full resize-y bg-transparent py-2 text-sm leading-7 text-white outline-none placeholder:text-slate-600 sm:text-base"
                    />
                  </div>
                </div>

                <div className="relative mt-3 flex flex-col gap-3 border-t border-white/[0.07] px-1 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-2">
                  <span className="flex items-center gap-1.5 px-1 text-xs text-slate-500">
                    <Sparkles size={13} />
                    Try an example
                  </span>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPrompt("");
                        setSelectedExample("");
                        document.getElementById("resume-prompt")?.focus();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200 sm:text-sm"
                    >
                      <FileText size={15} />
                      Start from scratch
                    </button>

                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-violet-600/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:px-5"
                    >
                      Build Resume
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {examples.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleExampleClick(label)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-all duration-200 sm:text-sm ${
                      selectedExample === label
                        ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                        : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-violet-400/30 hover:bg-violet-500/[0.07] hover:text-violet-200"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-400" />
                You stay in control of your information and final resume.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {[
                { icon: Sparkles, label: "AI-assisted writing" },
                { icon: FileCheck2, label: "ATS-conscious layouts" },
                { icon: ShieldCheck, label: "You approve the final draft" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-2.5 text-sm text-slate-400"
                >
                  <Icon size={17} className="shrink-0 text-violet-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
}

export default Hero