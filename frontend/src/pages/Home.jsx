import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  WandSparkles,
  Zap,
  Target,
  FileCheck2,
  MessageSquareText,
  CircleCheck,
} from "lucide-react";
import Hero from "../components/Hero";
import Features from "../components/Features";

const steps = [
    {
        number: "01",
        icon: MessageSquareText,
        title: "Tell us about yourself",
        description:
        "Answer a few personalized questions about your education, skills, experience, and projects.",
    },
    {
        number: "02",
        icon: Sparkles,
        title: "Let AI shape your story",
        description:
        "Get a professionally written draft based on your actual achievements and career goals.",
    },
    {
        number: "03",
        icon: FileCheck2,
        title: "Review and download",
        description:
        "Customize your content, choose a template, and export your resume when you're ready.",
    },
];

const templates = [
    {
        name: "Modern Professional",
        type: "Clean & versatile",
        accent: "from-violet-500/20 to-indigo-500/10",
        line: "bg-violet-400",
    },
    {
        name: "Classic Executive",
        type: "Elegant & minimal",
        accent: "from-slate-400/20 to-slate-500/5",
        line: "bg-slate-300",
    },
    {
        name: "Creative Portfolio",
        type: "Bold & expressive",
        accent: "from-fuchsia-500/20 to-pink-500/10",
        line: "bg-fuchsia-400",
    },
];

const containerClass = "mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-12";

const Home = () => {

    const scrollToBuilder = () => {
        document
            .getElementById("resume-builder")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

  return (
    <main className="overflow-hidden bg-[#090914] text-white">
        <Hero containerClass={containerClass} />
        <Features containerClass={containerClass} />
      

      {/* HOW IT WORKS */}
        <section className="border-y border-white/[0.05] bg-[#0d0d19] py-20 sm:py-24">
            <div className={containerClass}>
                <div className="mb-12 text-center sm:mb-16">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                        Simple process
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        From your story to your resume.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                        A guided process that keeps you involved at every step.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {steps.map(({ number, icon: Icon, title, description }, index) => (
                    <article
                        key={number}
                        className="relative rounded-2xl border border-white/[0.07] bg-[#11111f] p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                                <Icon size={23} />
                            </div>
                            <span className="text-3xl font-bold text-white/[0.08]">
                                {number}
                            </span>
                        </div>
                        <h3 className="mt-7 text-xl font-semibold text-white">
                            {title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            {description}
                        </p>
                        {index !== steps.length - 1 && (
                            <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-[#171426] p-1.5 text-violet-300 md:block">
                                <ArrowRight size={15} />
                            </div>
                        )}
                    </article>
                    ))}
                </div>
            </div>
        </section>

        {/* TEMPLATE SHOWCASE */}
        <section className="py-20 sm:py-24">
            <div className={containerClass}>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                            Find your style
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            A resume that feels like you.
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                            Explore professional design directions for your next career
                            move.
                        </p>
                    </div>

                    <Link
                        to="/templates"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                        Explore templates
                        <ArrowUpRight size={17} />
                    </Link>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Link
                            key={template.name}
                            to="/templates"
                            className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111e] transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                        >
                            <div
                            className={`relative flex h-[260px] items-center justify-center overflow-hidden bg-gradient-to-br ${template.accent} p-6`}
                            >
                            <div className="absolute inset-0 bg-[#11111f]/40" />

                                <div className="relative w-[190px] origin-bottom scale-100 rounded-sm bg-[#f8fafc] p-4 shadow-2xl transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-1deg] sm:w-[205px]">
                                    <div className="flex gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className={`h-2 w-20 rounded ${template.line}`} />
                                            <div className="mt-2 h-1 w-24 rounded bg-slate-300" />
                                            <div className="mt-1 h-1 w-16 rounded bg-slate-200" />
                                        </div>
                                        <div className="h-9 w-9 rounded-sm bg-slate-200" />
                                    </div>

                                    <div className="mt-5 grid grid-cols-[0.7fr_1.3fr] gap-3">
                                        <div>
                                            <div className={`h-1.5 w-12 rounded ${template.line}`} />
                                            {Array.from({ length: 5 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="mt-2 h-1 w-full rounded bg-slate-200"
                                            />
                                            ))}
                                        </div>
                                        <div>
                                            <div className={`h-1.5 w-14 rounded ${template.line}`} />
                                            {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="mt-3">
                                                <div className="h-1 w-16 rounded bg-slate-400" />
                                                <div className="mt-2 h-1 w-full rounded bg-slate-200" />
                                                <div className="mt-1 h-1 w-4/5 rounded bg-slate-200" />
                                                <div className="mt-1 h-1 w-3/5 rounded bg-slate-200" />
                                            </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 h-px bg-slate-200" />
                                    <div className="mt-3 h-1 w-20 rounded bg-slate-300" />
                                    <div className="mt-2 h-1 w-full rounded bg-slate-200" />
                                </div>

                                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] text-slate-200 backdrop-blur">
                                    <Sparkles size={11} className="text-violet-300" />
                                    Resume preview
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 p-5">
                                <div>
                                    <h3 className="font-semibold text-white transition group-hover:text-violet-300">
                                        {template.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {template.type}
                                    </p>
                                </div>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition group-hover:border-violet-400/30 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                                    <ArrowUpRight size={17} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* FINAL CTA */}
        <section className="pb-20 sm:pb-24">
            <div className={`${containerClass}`}>
                <div className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-[#11101f] px-6 py-12 text-center sm:px-12 sm:py-16 lg:py-20">
                    <div className="pointer-events-none absolute -left-20 -top-32 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[110px]" />

                    <div className="relative mx-auto max-w-3xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                            <Sparkles size={27} />
                        </div>

                        <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Ready for your next big move?
                        </h2>
                        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                            Start with your story. Build a resume that reflects your skills,
                            your experience, and where you want to go next.
                        </p>

                        <button
                            type="button"
                            onClick={scrollToBuilder}
                            className="group mt-8 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-violet-950/30 transition duration-300 hover:-translate-y-1 hover:shadow-violet-600/25"
                        >
                            Build My Resume
                            <ArrowRight
                                size={17}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </button>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <CircleCheck size={14} className="text-emerald-400" />
                                Guided process
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CircleCheck size={14} className="text-emerald-400" />
                                Editable content
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CircleCheck size={14} className="text-emerald-400" />
                                You approve the final resume
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
  );
};

export default Home;
