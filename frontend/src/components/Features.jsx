import React from 'react'
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

const features = [
    {
        icon: WandSparkles,
        title: "AI-Powered Writing",
        description:
        "Turn your experience into compelling summaries, impactful bullet points, and professional descriptions.",
        color: "violet",
    },
    {
        icon: Target,
        title: "ATS-Friendly Resumes",
        description:
        "Create clean, readable resumes with relevant skills and standard sections for applicant tracking systems.",
        color: "fuchsia",
    },
    {
        icon: FileCheck2,
        title: "Professional Templates",
        description:
        "Choose a polished design that matches your profession, experience, and career goals.",
        color: "indigo",
    },
    {
        icon: Zap,
        title: "Save Time, Apply Faster",
        description:
        "Reuse your saved profile, update individual sections, and tailor resumes for different job opportunities.",
        color: "cyan",
    },
];

const Features = ({containerClass}) => {
    return (
        <section className="relative border-t border-white/[0.05] py-20 sm:py-24">
        <div className={containerClass}>
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
              Everything you need
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              More than just a{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                resume builder.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              The right tools to present your experience clearly and move
              forward with confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color }) => {
              const colorClasses = {
                violet:
                  "bg-violet-500/10 text-violet-300 border-violet-400/15 group-hover:bg-violet-500/15",
                fuchsia:
                  "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/15 group-hover:bg-fuchsia-500/15",
                indigo:
                  "bg-indigo-500/10 text-indigo-300 border-indigo-400/15 group-hover:bg-indigo-500/15",
                cyan:
                  "bg-cyan-500/10 text-cyan-300 border-cyan-400/15 group-hover:bg-cyan-500/15",
              };

              return (
                <article
                  key={title}
                  className="group rounded-2xl border border-white/[0.07] bg-[#10101d] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-400/25 hover:bg-[#141326] hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-105 ${colorClasses[color]}`}
                  >
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-violet-300 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    Explore features <ArrowRight size={14} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    )
}

export default Features