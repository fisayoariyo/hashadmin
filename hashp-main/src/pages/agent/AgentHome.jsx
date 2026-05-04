import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronRight, Home, Plus, Settings, UserPlus, Search, RefreshCw, Wifi, WifiOff } from "lucide-react";
import AgentDesktopShell from "../../components/agent/AgentDesktopShell";
import {
  getFarmerSyncCountsFromStorage,
  syncAllPendingFarmersStorage,
} from "../../hooks/useAgentFarmersSync";
import { getAgentDashboard, getAgentSession, mapApiFarmerToUi } from "../../services/cropexApi";

// ── Asset imports ─────────────────────────────────────────
import cardPatternDesktop from "../../assets/comps/card-pattern-desktop.svg";
import statFarmersIcon    from "../../assets/comps/tractor.svg";
import statIdIcon         from "../../assets/comps/id.svg";
import registerActionIcon from "../../assets/comps/user-add-01.svg";
import lookupActionIcon   from "../../assets/comps/user-search-01.svg";
import wifiOffStatusIcon  from "../../assets/comps/wifi-off-02.svg";

// ── Custom tractor icon (mobile bottom nav) ───────────────
function TractorIcon({ size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7" cy="17" r="2.5" /><circle cx="17" cy="18" r="1.5" />
      <path d="M5 17H3V9l4-4h8l2 4h2v4h-2" /><path d="M9 5v8" /><path d="M3 13h12" />
    </svg>
  );
}

function getChangePct(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatChangePct(value) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}

// ── Desktop stat card — accepts img URL or React element for icon ──
function DesktopStatCard({ icon, iconEl, iconClassName = "", label, value, badge, action }) {
  return (
    <div
      className="relative h-[222px] w-full overflow-hidden rounded-[20px] bg-[#03624D] px-8 pb-7 pt-7 text-white"
    >
      <img
        src={cardPatternDesktop}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
      />
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          {iconEl
            ? iconEl
            : <img src={icon} alt="" aria-hidden="true" className={`h-9 w-9 opacity-95 ${iconClassName}`} />
          }
          {badge}
          {action}
        </div>
        <p className="font-sans text-[20px] font-light leading-[24px] text-white/90">{label}</p>
        <p className="mt-2 font-display text-[64px] leading-[58px] font-medium tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Agent bottom nav (mobile) ─────────────────────────────
export function AgentBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = [
    { label: "Dashboard", icon: <Home size={22} strokeWidth={1.8} />, path: "/agent/home" },
    { label: "Farmers",   icon: <TractorIcon />,                      path: "/agent/saved-farmers" },
    { label: "Settings",  icon: <Settings size={22} strokeWidth={1.8} />, path: "/agent/settings" },
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50">
      <div className="bg-white border-t border-brand-border flex items-center justify-around px-2 py-2">
        {tabs.map(({ label, icon, path }) => {
          const active = pathname === path || (path === "/agent/saved-farmers" && pathname.startsWith("/agent/saved"));
          return (
            <button key={path} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center">
              <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${active ? "bg-brand-green" : ""}`}>
                <span className={active ? "text-white" : "text-brand-green"}>{icon}</span>
                <span className={`text-xs font-sans font-medium ${active ? "text-white" : "text-brand-text-secondary"}`}>{label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function AgentHome() {
  const navigate = useNavigate();
  const [syncing,    setSyncing]    = useState(false);
  const [syncDone,   setSyncDone]   = useState(false);
  const [syncError,  setSyncError]  = useState("");
  const [syncCounts, setSyncCounts] = useState({ completed: 0, pending: 0 });
  const [isOnline,   setIsOnline]   = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [dashboard,  setDashboard]  = useState(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const counts = await getFarmerSyncCountsFromStorage();
      if (active) {
        setSyncCounts(counts);
      }
    };
    void refresh();
    const onExternal = () => {
      void refresh();
    };
    window.addEventListener("hcx-farmers-sync", onExternal);
    return () => {
      active = false;
      window.removeEventListener("hcx-farmers-sync", onExternal);
    };
  }, []);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    getAgentDashboard()
      .then((payload) => {
        if (active) {
          setDashboard(payload);
        }
      })
      .catch(() => {
        if (active) {
          setDashboard(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const syncProgressPct = useMemo(() => {
    const t = syncCounts.completed + syncCounts.pending;
    if (t === 0) return 100;
    return Math.round((syncCounts.completed / t) * 100);
  }, [syncCounts]);

  const liveAgent = dashboard?.agent || null;
  const liveStats = dashboard?.stats || null;
  const recentFarmers = useMemo(() => {
    if (Array.isArray(dashboard?.recent_farmers) && dashboard.recent_farmers.length > 0) {
      return dashboard.recent_farmers.map(mapApiFarmerToUi).filter(Boolean).slice(0, 4);
    }
    return [];
  }, [dashboard]);

  const displayAgentName = useMemo(() => {
    const session = getAgentSession();
    const fullName = liveAgent?.full_name || session?.fullName || session?.full_name || "Agent";
    return fullName.split(" ")[0] || "Agent";
  }, [liveAgent]);

  const registeredFarmersValue = liveStats?.total_registered_farmers ?? 0;
  const idsIssuedValue = liveStats?.total_ids_issued ?? 0;

  const registeredFarmersChange = useMemo(() => getChangePct(registeredFarmersValue, 0), [registeredFarmersValue]);
  const idsIssuedChange = useMemo(() => getChangePct(idsIssuedValue, 0), [idsIssuedValue]);

  const handleSync = async () => {
    if (syncCounts.pending === 0) return;
    setSyncError("");
    setSyncing(true);
    try {
      await syncAllPendingFarmersStorage();
      setSyncCounts(await getFarmerSyncCountsFromStorage());
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  // ── Mobile layout (unchanged) ───────────────────────────
  const mobileContent = (
    <div className="page-container md:hidden">
      {/* Dark green header */}
      <div className="relative isolate overflow-hidden bg-[#005F4A] px-4 pt-6 pb-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-center scale-[1.08] opacity-[0.44] contrast-[1.06]"
          style={{
            backgroundImage: `url(${cardPatternDesktop})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#fef9c3]/16 mix-blend-soft-light" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#016A53]/22 mix-blend-multiply" />
        <div className="relative z-10 flex items-center justify-between mb-1">
          <h1 className="font-display font-bold text-xl text-white">Welcome, Agent {displayAgentName}</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20">
            <Wifi size={12} className="text-white" />
            <span className="text-xs font-sans font-semibold text-white">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
        <p className="relative z-10 font-sans text-white/70 text-sm mb-5">
          Ready to manage farmer registration and track activities
        </p>
        <div className="relative z-10 space-y-3">
          {/* Registered Farmers — wide card */}
          <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#016A53] p-4">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.45]"
              style={{
                backgroundImage: `url(${cardPatternDesktop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#016A53]/25 mix-blend-multiply" />
            <div className="relative z-10 flex items-center justify-between mb-1">
              <img
                src={statFarmersIcon}
                alt=""
                aria-hidden="true"
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="text-xs font-sans font-semibold text-brand-amber bg-brand-amber/20 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <p className="relative z-10 font-sans text-white/70 text-sm">Registered Farmers</p>
            <p className="relative z-10 font-display font-bold text-4xl text-white mt-1">{registeredFarmersValue}</p>
          </div>
          {/* Two half-width cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#016A53] p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{
                  backgroundImage: `url(${cardPatternDesktop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#016A53]/25 mix-blend-multiply" />
              <div className="relative z-10 flex items-center justify-between mb-1">
                <img
                  src={statIdIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 brightness-0 invert"
                />
                <span className="text-xs font-sans font-semibold text-brand-amber bg-brand-amber/20 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <p className="relative z-10 font-sans text-white/70 text-xs">Digital IDs Issued</p>
              <p className="relative z-10 font-display font-bold text-2xl text-white mt-1">{idsIssuedValue}</p>
            </div>
            <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#016A53] p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{
                  backgroundImage: `url(${cardPatternDesktop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#016A53]/25 mix-blend-multiply" />
              <div className="relative z-10 flex items-center justify-between mb-1">
                <RefreshCw size={18} className="text-white/70" />
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing || syncCounts.pending === 0}
                  className="flex items-center gap-1 text-brand-amber text-xs font-semibold disabled:opacity-40"
                >
                  <RefreshCw size={11} className={syncing ? "animate-spin" : ""} /> Sync now
                </button>
              </div>
              <p className="relative z-10 font-sans text-white/70 text-xs">Pending sync</p>
              <p className="relative z-10 font-display font-bold text-2xl text-white mt-1">
                {String(syncCounts.pending).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* White body */}
      <div className="flex-1 px-4 pt-5 pb-28 overflow-y-auto scrollbar-hide space-y-4">
        {/* Action cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative isolate overflow-hidden bg-white rounded-2xl p-4 flex flex-col border border-[#EDEDED]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage: `url(${cardPatternDesktop})`,
                backgroundSize: "170% auto",
                backgroundPosition: "50% 22%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center self-center">
              <UserPlus size={22} className="text-brand-green" strokeWidth={1.8} />
            </div>
            <div className="relative z-10 mt-3 min-h-[56px]">
              <p className="font-display font-bold text-sm text-brand-text-primary">Register new farmer</p>
              <p className="font-sans text-xs text-brand-text-muted mt-0.5">Capture biometric and personal data</p>
            </div>
            <button
              onClick={() => navigate("/agent/register-farmer")}
              className="relative z-10 btn-amber mt-auto h-9 px-3 text-[10px] font-medium leading-none whitespace-nowrap inline-flex items-center justify-center gap-1"
            >
              <Plus size={11} strokeWidth={2.2} />
              <span>Start Registration</span>
            </button>
          </div>
          <div className="relative isolate overflow-hidden bg-white rounded-2xl p-4 flex flex-col border border-[#EDEDED]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage: `url(${cardPatternDesktop})`,
                backgroundSize: "170% auto",
                backgroundPosition: "50% 22%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center self-center">
              <Search size={22} className="text-brand-green" strokeWidth={1.8} />
            </div>
            <div className="relative z-10 mt-3 min-h-[56px]">
              <p className="font-display font-bold text-sm text-brand-text-primary">Farmer lookup</p>
              <p className="font-sans text-xs text-brand-text-muted mt-0.5">Search by ID or name</p>
            </div>
            <button
              onClick={() => navigate("/agent/saved-farmers")}
              className="relative z-10 btn-amber mt-auto h-9 px-3 text-[10px] font-medium leading-none whitespace-nowrap inline-flex items-center justify-center gap-1"
            >
              <Search size={11} strokeWidth={2.2} />
              <span>Search</span>
            </button>
          </div>
        </div>


        {/* Sync status */}
        {syncDone && (
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-brand-green text-xs font-semibold">✓ Sync complete — all records uploaded</span>
          </div>
        )}
        {syncError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-red-700 text-xs font-semibold">{syncError}</span>
          </div>
        )}
        <div className="relative isolate overflow-hidden bg-white rounded-2xl p-4 border border-[#EDEDED]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `url(${cardPatternDesktop})`,
              backgroundSize: "180% auto",
              backgroundPosition: "50% 24%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-brand-text-secondary" />
              <p className="font-sans font-semibold text-sm text-brand-text-primary">Offline Status</p>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || syncCounts.pending === 0}
              className="flex items-center gap-1 text-brand-amber text-xs font-semibold disabled:opacity-40"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> Sync now
            </button>
          </div>
          <div className="relative z-10 flex items-center justify-between mb-2">
            <p className="font-sans text-sm text-brand-text-secondary">Synchronization Progress</p>
            <p className="font-sans text-sm font-semibold">{syncProgressPct}%</p>
          </div>
          <div className="relative z-10 w-full h-2 bg-gray-100 rounded-full mb-3">
            <div className="h-2 bg-brand-green rounded-full transition-all" style={{ width: `${syncProgressPct}%` }} />
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center">
                <span className="text-white text-[8px]">✓</span>
              </div>
              <span className="font-sans text-xs text-brand-text-secondary">{syncCounts.completed} Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-amber" />
              <span className="font-sans text-xs text-brand-text-secondary">{syncCounts.pending} Pending</span>
            </div>
          </div>
        </div>
      </div>
      <AgentBottomNav />
    </div>
  );

  // ── Desktop layout ──────────────────────────────────────
  const desktopContent = (
    <AgentDesktopShell active="dashboard" isOnline={isOnline}>
      <div className="w-full ">
        {/* ── Registration stats ── */}
        <h2 className="mb-5 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
          Registration stats
        </h2>
        <div className="mb-6 grid w-full grid-cols-3 gap-5">
          <DesktopStatCard
            icon={statFarmersIcon}
            iconClassName="brightness-0 invert"
            label="Registered Farmers"
            value={registeredFarmersValue}
            badge={
              <span className="inline-flex h-10 items-center rounded-[50px] bg-[#007158] px-4 text-[20px] font-light leading-none text-[#F6F6F6]">
                {formatChangePct(registeredFarmersChange)}
              </span>
            }
          />
          <DesktopStatCard
            icon={statIdIcon}
            label="Digital IDs Issued"
            value={idsIssuedValue.toLocaleString()}
            badge={
              <span className="inline-flex h-10 items-center rounded-[50px] bg-[#007158] px-4 text-[20px] font-light leading-none text-[#F6F6F6]">
                {formatChangePct(idsIssuedChange)}
              </span>
            }
          />
          <DesktopStatCard
            iconEl={<RefreshCw size={34} strokeWidth={1.8} className="text-white/95" />}
            label="Pending sync"
            value={String(syncCounts.pending).padStart(2, "0")}
            action={
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing || syncCounts.pending === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-[20px] bg-[#FFBB3C] px-4 text-[14px] font-medium leading-[16px] text-[#030F0F] disabled:opacity-40"
              >
                <RefreshCw size={12} className={syncing ? "animate-spin" : ""} strokeWidth={1.8} />
                Sync now
              </button>
            }
          />
        </div>

        {/* ── Bottom section: left 569 + right 273 ── */}
        <div className="grid grid-cols-3 gap-5">
          {/* ── Left column ── */}
          <div className="col-span-2 space-y-6">

            {/* Register new farmer */}
            <section>
              <h3 className="mb-4 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
                Register new farmer
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex h-[166px] flex-col items-center justify-center rounded-[20px] border border-[#e4e4e4] bg-[#FFFFFF] px-5 py-[15px] text-center">
                  <img src={registerActionIcon} alt="" aria-hidden="true" className="mb-3 h-8 w-8" />
                  <p className="font-display font-medium text-[15px] leading-[18px] text-[#030F0F]">
                    Register new farmer
                  </p>
                  <p className="mt-1 text-[12px] leading-[14px] text-[#030F0F]">
                    Capture biometric and personal data
                  </p>
                  <button
                    onClick={() => navigate("/agent/register-farmer")}
                    className="mt-4 inline-flex h-[37px] w-[190px] items-center justify-center gap-1 rounded-[10px] bg-[#FFBB3C] text-[12px] font-normal leading-[14px] text-[#030F0F]"
                  >
                    <Plus size={13} strokeWidth={2.1} />
                    Start Registration
                  </button>
                </div>
                <div className="flex h-[166px] flex-col items-center justify-center rounded-[20px] border border-[#e4e4e4] bg-[#FFFFFF] px-5 py-[15px] text-center">
                  <img src={lookupActionIcon} alt="" aria-hidden="true" className="mb-3 h-8 w-8" />
                  <p className="font-display font-medium text-[15px] leading-[18px] text-[#030F0F]">
                    Farmer lookup
                  </p>
                  <p className="mt-1 text-[12px] leading-[14px] text-[#030F0F]">
                    Search by ID or name
                  </p>
                  <button
                    onClick={() => navigate("/agent/saved-farmers")}
                    className="mt-4 inline-flex h-[37px] w-[190px] items-center justify-center gap-1 rounded-[10px] bg-[#FFBB3C] text-[12px] font-normal leading-[14px] text-[#030F0F]"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Search size={14} strokeWidth={1.8} /> Search
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Synchronization */}
            <section>
              <h3 className="mb-4 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
                Synchronization
              </h3>
              <div className="h-[183.24px] rounded-[32.1469px] border border-[#e4e4e4] bg-[#FFFFFF] px-[27.33px] pb-[20px] pt-[14px]">

              {syncDone && (
                <div className="mb-2 rounded-xl border border-[#03624D]/25 bg-[#03624D]/10 px-3 py-1.5 text-[11px] font-semibold text-[#03624D]">
                  Sync complete — all records uploaded
                </div>
              )}

              {syncError && (
                <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700">
                  {syncError}
                </div>
              )}
              {/* Status row */}
              <div className="mb-[14px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={wifiOffStatusIcon} alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
                  <p className="font-sans text-[19.288px] leading-[23px] font-medium text-[#030F0F]">
                    Offline Status
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing || syncCounts.pending === 0}
                  className="inline-flex h-[35px] items-center gap-2 rounded-[44px] bg-[#03624D] px-[14px] text-[13px] font-bold leading-[15px] text-white disabled:opacity-40"
                >
                    <RefreshCw size={14} strokeWidth={1.8} className={syncing ? "animate-spin" : ""} />
                  Sync now
                </button>
              </div>

              {/* Progress */}
              <div className="mb-[8px] flex items-center justify-between">
                <p className="font-sans text-[16.073px] leading-[19px] text-[#030F0F]">
                  Synchronization Progress
                </p>
                <p className="font-sans text-[16.073px] leading-[19px] font-semibold text-[#030F0F]">
                  {syncProgressPct}%
                </p>
              </div>
              <div className="mb-5 h-[22.5px] w-full rounded-[48px] bg-[rgba(3,98,77,0.05)] p-0.5">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-[#03624D] transition-all"
                  style={{ width: `${syncProgressPct}%` }}
                >
                  <img
                    src={cardPatternDesktop}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-color pointer-events-none"
                  />
                </div>
              </div>

              {/* Completed / Pending legend */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[16.073px] leading-[19px] text-[#030F0F]">
                  <CheckCircle2 size={18} className="text-[#03624D]" strokeWidth={1.8} />
                  <span>{syncCounts.completed} Completed</span>
                </div>
                <div className="flex items-center gap-2 text-[16.073px] leading-[19px] text-[#030F0F]">
                  <div className="h-[14px] w-[14px] rounded-full bg-[#FFBB3C]" />
                  <span>{syncCounts.pending} Pending</span>
                </div>
              </div>
              </div>
            </section>
          </div>

          {/* ── Right column — Recently Registered ── */}
          <aside className="h-[462px]">
            <h3 className="font-display font-bold text-[20px] leading-6 text-[#030F0F] mb-4 whitespace-nowrap">
              Recently Registered
            </h3>
            <div className="flex h-[422px] flex-col rounded-[20px] border border-[#e4e4e4] bg-[#FFFFFF] px-[17px] pb-3 pt-[17px]">
              <div className="flex-1 space-y-[15px]">
                {recentFarmers.map((farmer) => (
                  <div key={farmer.id} className="h-[74px] w-full rounded-[10px] bg-[#F6F6F6] px-[9px] pb-[10px] pt-[8px]">
                    <div className="flex items-center gap-[10px]">
                      <img
                        src={farmer.photo}
                        alt={farmer.name}
                        className="h-[61px] w-[61px] rounded-[11px] object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[10px] leading-[12px] text-[#030F0F]">
                          ID : {farmer.id}
                        </p>
                        <p className="mt-[10px] truncate text-[10px] leading-[12px] text-[#030F0F]">
                          Name : {farmer.name}
                        </p>
                        <button
                          onClick={() => navigate("/agent/saved-farmers")}
                          className="mt-[10px] inline-flex items-center gap-0.5 text-[10px] font-bold leading-[12px] text-[#03624D]"
                        >
                          View Details
                          <ChevronRight size={10} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {recentFarmers.length === 0 && (
                  <div className="flex h-full items-center justify-center rounded-[10px] bg-[#F6F6F6] px-6 text-center text-[13px] text-[#6B7280]">
                    No recent registrations from the server yet.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate("/agent/saved-farmers")}
                className="mt-[15px] inline-flex h-[37px] w-full items-center justify-center rounded-[10px] bg-[#FFBB3C] text-[12px] font-normal leading-[14px] text-[#030F0F]"
              >
                See Registered Farmers
              </button>
            </div>
          </aside>

        </div>
      </div>
    </AgentDesktopShell>
  );

  return (
    <>
      {mobileContent}
      {desktopContent}
    </>
  );
}
