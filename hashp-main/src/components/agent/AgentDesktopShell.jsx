import { useEffect, useMemo, useState } from "react";
import { Headset, Home, Plus, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAgentDashboard, getAgentSession } from "../../services/cropexApi";

// ── Custom sidebar icon assets ────────────────────────────
import tractorIcon from "../../assets/comps/tractor.svg";
import settingIcon from "../../assets/comps/settings-03.svg";

const NAV_LINKS = [
  { key: "dashboard", label: "Dashboard",    icon: null,        path: "/agent/home"           },
  { key: "farmers",   label: "Farmers",       icon: tractorIcon, path: "/agent/saved-farmers"  },
  { key: "settings",  label: "Settings",      icon: settingIcon, path: "/agent/settings"       },
  { key: "support",   label: "Help & Support", icon: null,        path: "/agent/contact-support" },
];

export default function AgentDesktopShell({ active = "dashboard", isOnline = true, children }) {
  const navigate = useNavigate();
  const session = getAgentSession();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let activeRequest = true;
    getAgentDashboard()
      .then((payload) => {
        if (activeRequest) setDashboard(payload);
      })
      .catch(() => {
        if (activeRequest) setDashboard(null);
      });

    return () => {
      activeRequest = false;
    };
  }, []);

  const agentName = useMemo(
    () =>
      dashboard?.agent?.full_name ||
      session?.fullName ||
      session?.full_name ||
      "Agent",
    [dashboard, session]
  );

  return (
    <div className="hidden h-dvh overflow-hidden bg-brand-bg-page  md:block">
      <div className="h-full w-full rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex h-full gap-[10px]">
          {/* ── Sidebar (CSS: 295x801) ── */}
          <aside className="h-full w-[295px] shrink-0 overflow-hidden rounded-[20px] bg-white px-[29px] py-[31px]">
          <img
            src="/brand/HFEI_Primary_Logo_.png"
            alt="HFEI by Hashmar Cropex Ltd"
            className="mb-[60px] h-[34px] w-auto object-contain"
          />
          <nav className="space-y-2">
            {NAV_LINKS.map(({ key, label, icon, path }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`flex h-[45px] w-full items-center gap-[10px] rounded-[10px] px-[14px] text-[15px] leading-[18px] font-normal transition-colors ${
                    isActive
                      ? "bg-[#03624D] text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)]"
                      : "text-[#030F0F]/80 hover:bg-[#03624D]/10 hover:text-[#03624D]"
                  }`}
                >
                  {key === "dashboard" ? (
                    <Home
                      size={20}
                      strokeWidth={isActive ? 2.1 : 1.9}
                      className={isActive ? "text-white" : "text-[#030F0F]"}
                    />
                  ) : icon ? (
                    <img
                      src={icon}
                      alt=""
                      aria-hidden="true"
                      className={`h-[22px] w-[22px] shrink-0 ${isActive ? "brightness-0 invert" : ""}`}
                    />
                  ) : (
                    <Headset size={22} className="shrink-0" />
                  )}
                  {label}
                </button>
              );
            })}
          </nav>
          </aside>

          {/* ── Main area (CSS: 935 content width) ── */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-[14px] overflow-hidden">
            {/* Header */}
            <div className="flex h-[95px] shrink-0 items-center justify-between rounded-[20px] bg-white px-[26px] py-[15px]">
              <div className="flex items-center gap-6">
                <div className="min-w-0">
                  <h1 className="truncate font-display text-[20px] font-bold leading-6 text-brand-text-primary">
                    Welcome, {agentName}
                  </h1>
                  <p className="mt-2 text-[15px] font-light leading-[18px] text-brand-text-secondary">
                    Ready to manage farmer registration and track activities
                  </p>
                </div>
                <div
                  className={`inline-flex py-1.5 items-center gap-[3px] rounded-[50.49px] px-[10px] text-[12.12px] font-bold leading-[14px] ${
                    isOnline ? "bg-[#03624D] text-white" : "bg-[#E8ECEB] text-[#445250]"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                  <Wifi size={11} strokeWidth={2.4} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/agent/register-farmer")}
                className="inline-flex h-[47px]  shrink-0 items-center justify-center gap-2 rounded-[15px] bg-[#03624D] px-[20px] text-[15px] font-medium text-white"
              >
                <Plus size={17} strokeWidth={2.5} />
                Register New Farmer
              </button>
            </div>

            {/* Page content */}
            <div className="flex-1 min-h-0 w-full overflow-hidden rounded-[20px] bg-[#F6F6F6] px-9 py-7">
              <div className="h-full overflow-y-auto pr-1 scrollbar-hide w-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
