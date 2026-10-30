
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ArrowUpRight,
  Send,
  Heart,
  ArrowUp,
  Mail,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Connect your newsletter API here.
    console.log("Newsletter email:", email);
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    Product: [
      { label: "Home", to: "/" },
      { label: "Resume Templates", to: "/templates" },
      { label: "My Resumes", to: "/resumes" },
      { label: "AI Resume Builder", to: "/create-resume" },
    ],
    Resources: [
      { label: "Resume Tips", to: "/resources/resume-tips" },
      { label: "Career Guide", to: "/resources/career-guide" },
      { label: "Help Center", to: "/help" },
      { label: "FAQs", to: "/faq" },
    ],
    Company: [
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.08] bg-[#0b0b16]">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-violet-600/[0.09] blur-[110px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-indigo-600/[0.09] blur-[110px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        {/* Newsletter / CTA */}
        <div className="relative -mt-0 border-b border-white/[0.08] py-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3.5 py-2 text-xs font-semibold tracking-wide text-violet-300">
                <Sparkles size={14} />
                YOUR NEXT CHAPTER STARTS HERE
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                Build a resume that
                <br className="hidden sm:block" />{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  opens new doors.
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                Turn your experience, skills, and ambitions into a professional
                resume with the power of AI.
              </p>

              <Link
                to="/create-resume"
                className="group mt-7 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-violet-600/30"
              >
                Create Your Resume
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Newsletter card */}
            <div className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-5 backdrop-blur-xl sm:p-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Mail size={21} />
              </div>

              <h3 className="text-lg font-semibold text-white">
                Career tips, delivered.
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Get resume advice, job-search tips, and career insights in your
                inbox.
              </p>

              <form
                onSubmit={handleSubscribe}
                className="mt-5 flex flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>

                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#11111f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                />

                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.98]"
                >
                  Subscribe
                  <Send size={15} />
                </button>
              </form>

              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                No spam. Just useful career insights.
              </p>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12 lg:py-14">
          {/* Brand column */}
          <div>
            <Link
              to="/"
              className="group inline-flex items-center gap-3"
              aria-label="AI Resume Builder home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500 to-indigo-700 shadow-lg shadow-violet-900/20 transition duration-300 group-hover:scale-105">
                <FileText size={23} className="text-white" />
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  AI
                </span>{" "}
                Resume Builder
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Your skills deserve to stand out. Create polished,
              professional resumes that tell your career story with confidence.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[
                {
                  label: "GitHub",
                  icon: FaGithub,
                  href: "https://github.com/",
                },
                {
                  label: "LinkedIn",
                  icon: FaLinkedin,
                  href: "https://www.linkedin.com/",
                },
                {
                  label: "Twitter",
                  icon: FaXTwitter,
                  href: "https://x.com/",
                },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-400 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-5 text-sm font-semibold text-white">
                {title}
              </h3>

              <ul className="space-y-3.5">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:text-violet-300"
                    >
                      {label}
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/[0.08] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            Crafted for your next big opportunity
            <Heart size={13} className="fill-fuchsia-500 text-fuchsia-500" />
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
          >
            Back to top
            <ArrowUp
              size={14}
              className="transition-transform duration-200 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
