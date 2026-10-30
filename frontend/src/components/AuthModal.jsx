
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  FileText,
  Sparkles,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  UserRound,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cloud,
  LoaderCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import { googleLogin } from "../features/api/googleLogin";
import { closeAuthModal, setAuthModalMode } from "../features/auth/authModalSlice";
import { setCredentials, setLoading, setAuthError, clearAuthError } from "../features/auth/authSlice";
import { loginApi } from "../features/api/loginApi";
import { registerApi } from "../features/api/registerApi";

const AuthModal = () => {
    const dispatch = useDispatch();
    const { isOpen, mode } = useSelector((state) => state.authModal);
    const { loading } = useSelector((state) => state.auth);
    const isRegister = mode === "register";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (!isOpen) return;

            const handleKeyDown = (event) => {
            if (event.key === "Escape") dispatch(closeAuthModal());
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, dispatch]);

    useEffect(() => {
        setError("");
        setPassword("");
    }, [mode, isOpen]);

    if (!isOpen) return null;

    const switchMode = (nextMode) => {
        dispatch(setAuthModalMode(nextMode));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (isRegister && !name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        dispatch(clearAuthError());
        dispatch(setLoading(true));

        try {
            const payload = {
                name,
                email,
                password
            }
            let response = "";
            if(isRegister){
                response = await registerApi(payload)
            }else{
                response = await loginApi(payload)
            }
            
            if(response.success){
                dispatch(setCredentials({user: response.data}))
                dispatch(closeAuthModal());
            }else{
                setError(response.message);    
            }
        } catch(error) {
            console.log(error)
            setError("Something went wrong. Please try again.");
        } finally {
            dispatch(setLoading(false));
        }
    };


    const handleGoogleLogin = async () => {
        if (loading) return;
        setError("");
        dispatch(clearAuthError());
        dispatch(setLoading(true));
        try {
            const data = await signInWithPopup(auth, googleProvider);
            const idToken = await data.user.getIdToken();
            const response = await googleLogin(idToken);
            
            if (!response?.success || !response?.data) {
                throw new Error(
                    response?.message || "Google login failed. Please try again."
                );
            }

            dispatch(setCredentials({user: response.data}));
            dispatch(closeAuthModal());
        } catch (error) {
            console.error(
                "Google login error:",
                error.response?.data || error.code || error.message
            );

            let message = "Unable to sign in with Google. Please try again.";

            if (error.code === "auth/popup-closed-by-user") {
                message = "Google sign-in was cancelled.";
            } else if (error.code === "auth/popup-blocked") {
                message = "Your browser blocked the Google popup. Please allow popups and try again.";
            } else if (error.code === "auth/cancelled-popup-request") {
                message = "A Google sign-in request is already in progress.";
            } else if (error.code === "auth/network-request-failed") {
                message = "Network error. Please check your internet connection.";
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message && !error.code) {
                message = error.message;
            }
        }finally {
            dispatch(setLoading(false));
        }
    };

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          dispatch(closeAuthModal());
        }
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#04040e]/80 p-3 backdrop-blur-xl animate-in fade-in duration-200 sm:p-6"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative grid w-full max-w-5xl grid-cols-1 overflow-y-auto rounded-2xl border border-violet-500/30 bg-[#10101e] text-white shadow-[0_30px_100px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-300 sm:rounded-3xl lg:max-h-[min(850px,calc(100dvh-48px))] lg:grid-cols-[0.85fr_1.15fr]"
      >
        <button
          type="button"
          aria-label="Close modal"
          onClick={() => dispatch(closeAuthModal())}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:rotate-90 hover:bg-violet-500/15 hover:text-white sm:right-4 sm:top-4"
        >
          <X size={20} />
        </button>

        {/* Desktop feature panel */}
        <aside className="relative hidden flex-col overflow-hidden border-r border-violet-400/15 bg-[radial-gradient(ellipse_at_50%_35%,rgba(109,40,217,0.28),transparent_60%),linear-gradient(145deg,#17132f,#100f25_65%,#201044)] p-8 lg:flex xl:p-10">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-violet-300/30 bg-gradient-to-br from-violet-500 to-indigo-700 shadow-lg shadow-violet-900/30">
            <FileText size={27} />
            <Sparkles
              size={15}
              className="absolute -right-1.5 -top-1.5 fill-violet-300 text-violet-200"
            />
          </div>

          <div className="relative flex min-h-[230px] flex-1 items-center justify-center">
            <div className="absolute h-24 w-64 rotate-[-20deg] rounded-[50%] border border-violet-500/70" />
            <div className="absolute h-32 w-64 rotate-[25deg] rounded-[50%] border border-indigo-400/25" />

            <div className="relative flex h-36 w-44 -rotate-6 items-start gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white to-violet-200 p-5 text-violet-900 shadow-[0_20px_55px_rgba(124,58,237,0.4)] transition duration-500 hover:rotate-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-300">
                <UserRound size={26} />
              </div>

              <div className="flex flex-1 flex-col gap-3 pt-1">
                <span className="h-1.5 w-full rounded-full bg-violet-400" />
                <span className="h-1.5 w-4/5 rounded-full bg-violet-300" />
                <span className="h-1.5 w-3/5 rounded-full bg-violet-300" />
              </div>

              <span className="absolute -bottom-3 -right-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-3 py-2 text-lg font-extrabold text-white shadow-lg">
                AI
              </span>
            </div>
          </div>

          <div className="relative">
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-violet-300">
              YOUR NEXT CHAPTER STARTS HERE
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              {isRegister ? "Build your future." : "Welcome back!"}
            </h2>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
              {isRegister
                ? "Create your account and build a resume that gets noticed."
                : "Sign in to continue building your professional resume."}
            </p>

            <div className="mt-7 grid gap-5 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <Zap size={19} className="text-violet-300" />
                Create resumes in minutes
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={19} className="text-violet-300" />
                ATS-friendly templates
              </div>
              <div className="flex items-center gap-3">
                <Cloud size={19} className="text-violet-300" />
                Access your work anywhere
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-violet-700/30 blur-[80px]" />
        </aside>

        {/* Form panel */}
        <div className="min-w-0 p-5 pt-16 sm:p-8 sm:pt-16 md:p-10 md:pt-16 xl:p-12 xl:pt-14">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700">
              <FileText size={23} />
              <Sparkles size={12} className="absolute -right-1 -top-1" />
            </div>
            <span className="text-sm font-bold">AI Resume Builder</span>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-violet-300">
              {isRegister ? "GET STARTED FOR FREE" : "WELCOME BACK"}
            </p>

            <h1
              id="auth-title"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {isRegister ? "Create your account" : "Sign in to your account"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isRegister
                ? "Your next opportunity begins with a great resume."
                : "Your career journey is waiting for you."}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 border-b border-white/10">
            {["login", "register"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => switchMode(tab)}
                className={`relative px-3 py-3 text-sm font-semibold capitalize transition ${
                  mode === tab
                    ? "text-white after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-violet-500 after:to-indigo-500"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                {tab === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
            {loading ? (
                <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Signing in with Google...
                </>
            ) : (
                <>
                    <span className="text-xl ">
                        <FcGoogle />
                    </span>
                    Continue with Google
                </>
            )}
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                    or continue with email
                <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
                {isRegister && (
                    <label className="grid gap-2 text-xs font-semibold text-slate-300">
                        Full name
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#090916]/70 px-3 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/15">
                            <UserRound size={18} className="shrink-0 text-slate-500" />
                            <input
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </label>
                )}

                <label className="grid gap-2 text-xs font-semibold text-slate-300">
                    Email address
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#090916]/70 px-3 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/15">
                        <Mail size={18} className="shrink-0 text-slate-500" />
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                        />
                    </div>
                </label>

                <label className="grid gap-2 text-xs font-semibold text-slate-300">
                    Password
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#090916]/70 px-3 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/15">
                        <LockKeyhole size={18} className="shrink-0 text-slate-500" />
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((value) => !value)}
                            className="shrink-0 text-slate-500 transition hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </label>

                {!isRegister && (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                                className="h-4 w-4 accent-violet-500"
                            />
                            Remember me
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                setError("Connect your password reset endpoint to continue.")
                            }
                            className="text-violet-300 transition hover:text-violet-200"
                        >
                            Forgot password?
                        </button>
                    </div>
                )}

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-xs leading-5 text-red-300"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                        <>
                            {isRegister ? "Create account" : "Sign in"}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

          <p className="mt-6 flex flex-wrap justify-center gap-1 text-center text-xs text-slate-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
              className="font-bold text-violet-300 hover:text-violet-200"
            >
              {isRegister ? "Login" : "Register for free"}
            </button>
          </p>

          <p className="mt-5 text-center text-[10px] leading-5 text-slate-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-slate-300 hover:text-violet-300">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-slate-300 hover:text-violet-300">
              Privacy Policy
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AuthModal;
