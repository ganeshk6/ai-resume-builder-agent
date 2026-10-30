
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Home,
  LayoutGrid,
  BookOpen,
  Settings,
  UserRound,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { openAuthModal } from "../features/auth/authModalSlice";
import { logoutApi } from "../features/api/logout";
import { logout } from "../features/auth/authSlice";

const navigation = [
  { name: "Home", path: "/", icon: Home, end: true },
  { name: "Templates", path: "/templates", icon: LayoutGrid },
  { name: "My Resume", path: "/resumes", icon: BookOpen },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const {user, isAuthenticated} = useSelector((state)=>state.auth);
    const [imageError, setImageError] = useState(false);

    const dispatch = useDispatch();
    
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const closeMenus = () => {
        setMobileOpen(false);
        setProfileOpen(false);
    };
    
    const handleLogOut = async() => {
        try {
            const response = await logoutApi();
            console.log(response);
            if(response.success){
                dispatch(logout())
            }
        } catch (error) {
            console.log("Error from logout " + error)
        }
    }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-violet-500/20 bg-[#0b0b16]/95 shadow-[0_10px_35px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          : "border-b border-white/[0.06] bg-[#0b0b16]/90 backdrop-blur-xl"
      }`}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

      <div className="mx-auto flex h-[65px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-12">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-3.5"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-violet-400/30 bg-gradient-to-br from-violet-500 to-indigo-700 shadow-[0_0_24px_rgba(124,58,237,0.3)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_32px_rgba(139,92,246,0.55)]">
            <FileText size={20} strokeWidth={1.8} className="text-white" />

            <Sparkles
              size={14}
              className="absolute -right-1 -top-1 fill-violet-300 text-violet-200"
            />
          </div>

          <div className="hidden sm:block">
            <h1 className="whitespace-nowrap text-[16px] font-bold tracking-tight text-white lg:text-[20px]">
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI
              </span>{" "}
              Resume Builder
            </h1>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Your career, elevated
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-2 xl:flex"
        >
          {navigation.map(({ name, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[14px] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-[0_0_24px_rgba(124,58,237,0.28)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={`transition-transform duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-slate-300 group-hover:scale-110 group-hover:text-violet-300"
                    }`}
                  />

                  <span>{name}</span>

                  {/* {isActive && (
                    <span className="absolute -bottom-[15px] left-4 right-4 h-[3px] rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.95)]" />
                  )} */}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side profile */}
        {!isAuthenticated ? (
            <div className="flex items-center gap-3">
            <button
                onClick={()=>dispatch(openAuthModal("login"))}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 transition hover:border-violet-400/50 hover:text-white"
            >
                Login
            </button>

            <button
                onClick={()=>dispatch(openAuthModal("register"))}
                className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
                Register
            </button>
        </div>
        ):(
            <div className="relative hidden shrink-0 xl:block">
                <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-expanded={profileOpen}
                    aria-label="Toggle profile menu"
                    className="flex items-center gap-3 rounded-full p-1.5 transition hover:bg-white/[0.05]"
                >
                    <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#292444] to-[#151525] shadow-[0_0_16px_rgba(124,58,237,0.12)] ${
                                user?.profilePicture && !imageError
                                ? "border-0"
                                : "border border-violet-400/30"
                            }`}>
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user?.name || "User profile"}
                                className="h-full w-full rounded-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <UserRound size={20} className="text-white" />
                        )}

                        <span className="absolute bottom-0 right-0 z-10 h-3 w-3 rounded-full border-2 border-[#0b0b16] bg-emerald-400" />
                    </span>

                    <ChevronDown
                    size={17}
                    className={`text-slate-400 transition-transform duration-300 ${
                        profileOpen ? "rotate-180" : ""
                    }`}
                    />
                </button>

                {profileOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-2xl border border-white/10 bg-[#141423] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] duration-200">
                    <div className="border-b border-white/[0.08] px-3 py-3">
                        <p className="text-sm font-semibold text-white">
                        My Account
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                        Manage your career profile
                        </p>
                    </div>

                    <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-violet-500/10 hover:text-violet-300"
                    >
                        <UserRound size={17} />
                        My Profile
                    </Link>

                    <Link
                        to="/settings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-violet-500/10 hover:text-violet-300"
                    >
                        <Settings size={17} />
                        Settings
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            handleLogOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut size={17} />
                        Sign out
                    </button>
                    </div>
                )}
            </div>
        )}

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen((prev) => !prev);
            setProfileOpen(false);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-violet-400/40 hover:bg-violet-500/10 xl:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out xl:hidden ${
          mobileOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="space-y-1 border-t border-white/[0.07] px-4 py-4 sm:px-6">
            {navigation.map(({ name, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/15"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {name}
              </NavLink>
            ))}

            <Link
              to="/profile"
              onClick={closeMenus}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <UserRound size={19} />
              My Profile
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom glow on scroll */}
      <div
        className={`pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
};

export default Header;
