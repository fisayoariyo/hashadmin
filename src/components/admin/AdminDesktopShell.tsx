/**
 * Desktop admin shell — structural parity with
 * `hashmar-farmer-app/src/components/agent/AgentDesktopShell.jsx`
 * (outer frame, 295px sidebar, 45px nav rows, #03624D active, header strip, #F6F6F6 content well).
 * Desktop-only: root uses `hidden md:block` like the agent shell (no mobile layout).
 */
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ClipboardCheck,
  Home,
  LogOut,
  MoreHorizontal,
  UserCog,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminAuthState, getAdminSession } from "@/lib/adminSession";
import tractorIcon from "@/assets/comps/tractor.svg";

/** Mirrors `AgentDesktopShell` nav `key` → route mapping in `hashmar-farmer-app`. */
export const ADMIN_NAV_LINKS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    kind: "home" as const,
  },
  {
    key: "farmers",
    label: "Farmer Management",
    path: "/farmers",
    kind: "tractor" as const,
  },
  {
    key: "agents",
    label: "Agent Management",
    path: "/agents",
    kind: "usercog" as const,
  },
  {
    key: "agent-verification",
    label: "Agent Verification",
    path: "/agent-verification",
    kind: "clipboard" as const,
  },
  {
    key: "reported-issues",
    label: "Reported Issues",
    path: "/reported-issues",
    kind: "alert" as const,
  },
] as const;

export type AdminShellNavKey = (typeof ADMIN_NAV_LINKS)[number]["key"] | "create-admin";

type AdminDesktopShellProps = {
  active: AdminShellNavKey;
  children: ReactNode;
  /** Optional right side of header (per-page CTAs). Agent shell uses a primary button here. */
  headerActions?: ReactNode;
};

export default function AdminDesktopShell({
  active,
  children,
  headerActions = null,
}: AdminDesktopShellProps) {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (!profileMenuRef.current?.contains(e.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileMenuOpen]);

  useEffect(() => {
    let active = true;
    void getAdminSession().then((session) => {
      if (active && session?.displayName) setAdminName(session.displayName);
    });
    const auth = getAdminAuthState();
    if (active) {
      setIsSuperAdmin(auth?.role === "SUPER_ADMIN");
    }
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await clearAdminSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="hidden h-dvh overflow-hidden bg-brand-bg-page md:block">
      <div className="h-full w-full rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex h-full gap-[10px]">
          {/* ── Sidebar (CSS: 295px) — same as `AgentDesktopShell` ── */}
          <aside className="flex h-full w-[295px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-white px-[29px] py-[31px]">
            <img
              src="/brand/HFEI_Primary_Logo_.png"
              alt="HFEI by Hashmar Cropex Ltd"
              className="mb-[60px] h-[34px] w-auto shrink-0 self-start object-contain object-left"
            />
            <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
              {ADMIN_NAV_LINKS.map(({ key, label, path, kind }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navigate(path)}
                    className={`flex h-[45px] w-full items-center gap-[10px] rounded-[10px] px-[14px] text-left text-[15px] font-normal leading-[18px] transition-colors ${
                      isActive
                        ? "bg-[#03624D] text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)]"
                        : "text-[#030F0F]/80 hover:bg-[#03624D]/10 hover:text-[#03624D]"
                    }`}
                  >
                    {kind === "home" ? (
                      <Home
                        size={20}
                        strokeWidth={isActive ? 2.1 : 1.9}
                        className={isActive ? "text-white" : "text-[#030F0F]"}
                      />
                    ) : kind === "tractor" ? (
                      <img
                        src={tractorIcon}
                        alt=""
                        aria-hidden="true"
                        className={`h-[22px] w-[22px] shrink-0 ${isActive ? "brightness-0 invert" : ""}`}
                      />
                    ) : kind === "usercog" ? (
                      <UserCog
                        size={20}
                        strokeWidth={isActive ? 2.1 : 1.9}
                        className={isActive ? "text-white" : "text-[#030F0F]"}
                      />
                    ) : kind === "clipboard" ? (
                      <ClipboardCheck
                        size={20}
                        strokeWidth={isActive ? 2.1 : 1.9}
                        className={isActive ? "text-white" : "text-[#030F0F]"}
                      />
                    ) : (
                      <AlertCircle
                        size={20}
                        strokeWidth={isActive ? 2.1 : 1.9}
                        className={isActive ? "text-white" : "text-[#030F0F]"}
                      />
                    )}
                    {label}
                  </button>
                );
              })}
            </nav>

            {isSuperAdmin ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate("/admins/create")}
                  className={`flex h-[45px] w-full items-center gap-[10px] rounded-[10px] px-[14px] text-left text-[15px] font-normal leading-[18px] transition-colors ${
                    active === "create-admin"
                      ? "bg-[#03624D] text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)]"
                      : "text-[#030F0F]/80 hover:bg-[#03624D]/10 hover:text-[#03624D]"
                  }`}
                >
                  <UserPlus
                    size={20}
                    strokeWidth={active === "create-admin" ? 2.1 : 1.9}
                    className={active === "create-admin" ? "text-white" : "text-[#030F0F]"}
                  />
                  Create Admin
                </button>
              </div>
            ) : null}

            <div
              ref={profileMenuRef}
              className="relative mt-6 flex shrink-0 items-center gap-3 rounded-[12px] bg-white px-3 py-3"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#03624D] font-display text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {adminName
                  .split(/\s+/)
                  .map((part) => part[0] || "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[15px] font-medium leading-tight text-brand-text-primary">
                  {adminName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="shrink-0 rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-black/5 hover:text-brand-text-primary"
                aria-label="Open account menu"
                aria-expanded={profileMenuOpen}
              >
                <MoreHorizontal size={20} strokeWidth={1.8} />
              </button>
              {profileMenuOpen ? (
                <div
                  className="absolute bottom-full right-0 z-[120] mb-2 w-[min(100%,11rem)] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left font-sans text-sm font-medium text-brand-text-primary transition hover:bg-[#f6f6f6]"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut size={18} strokeWidth={1.75} className="shrink-0 text-brand-text-primary" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-[14px] overflow-hidden">
            <div className="flex h-[95px] shrink-0 items-center justify-between rounded-[20px] bg-white px-[26px] py-[15px]">
              <div className="min-w-0">
                <h1 className="truncate font-display text-[20px] font-bold leading-6 text-brand-text-primary">
                  Welcome, {adminName}
                </h1>
                <p className="mt-2 text-[15px] font-light leading-[18px] text-brand-text-secondary">
                  Monitor and manage farmers and agents activities
                </p>
              </div>
              {headerActions ? (
                <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
              ) : null}
            </div>

            <div className="min-h-0 w-full flex-1 overflow-hidden rounded-[20px] bg-[#FBFBFB] px-9 py-7">
              <div className="scrollbar-hide h-full w-full overflow-y-auto pr-1">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
