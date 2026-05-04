import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, BadgeCheck, Copy } from "lucide-react";
import { getFarmerDashboard, getFarmerSession } from "../../services/cropexApi";

const NAV = [
  { label: "Home",    path: "/farmer/home",    Icon: Home },
  { label: "Profile", path: "/farmer/profile", Icon: User },
];



export default function FarmerDesktopLayout({
  children,
  activeNav,
  islandContent = false,
  edgeToEdge = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = activeNav || (pathname.includes("profile") ? "Profile" : "Home");
  const session = getFarmerSession();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let activeRequest = true;
    getFarmerDashboard()
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

  const farmerName = dashboard?.farmer?.full_name || session?.fullName || session?.full_name || "Farmer";
  const farmerFirstName = useMemo(() => farmerName.split(" ")[0] || "Farmer", [farmerName]);
  const farmerId = dashboard?.farmer?.farmer_id || "Unavailable";
  const badgeLabel = dashboard?.farmer ? "Verified" : "Unavailable";

  const copyID = () => {
    if (farmerId === "Unavailable") return;
    navigator.clipboard?.writeText(farmerId).catch(() => {});
  };

  const desktopHeader = (
    <header
      className={`shrink-0 ${
        islandContent
          ? "flex items-start justify-start bg-white px-6 pt-6 pb-2"
          : "flex items-center justify-between rounded-[20px] bg-white px-8 py-4"
      }`}
    >
      {!islandContent && (
        <img
          src="/brand/HFEI_Primary_Logo_.png"
          alt="HFEI by Hashmar Cropex Ltd"
          className="h-10 w-auto object-contain"
          draggable="false"
        />
      )}

      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-brand-text-primary">
            Welcome, {farmerFirstName}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-1 font-sans text-xs font-semibold text-white">
            <BadgeCheck size={11} />
            {badgeLabel}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="font-sans text-sm text-brand-text-secondary">
            your ID: <span className="font-semibold text-brand-green">{farmerId}</span>
          </span>
          <button
            onClick={copyID}
            className="text-brand-text-muted transition-colors hover:text-brand-green"
            title="Copy ID"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {!islandContent && <div className="w-40" />}
    </header>
  );

  const desktopSidebar = (
    <aside
      className={`w-64 shrink-0 bg-white ${
        islandContent ? "px-6 py-7" : "rounded-[20px] px-4 py-6"
      }`}
    >
      {islandContent && (
        <img
          src="/brand/HFEI_Primary_Logo_.png"
          alt="HFEI by Hashmar Cropex Ltd"
          className="mb-10 h-10 w-auto object-contain"
          draggable="false"
        />
      )}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, path, Icon }) => {
          const isActive = active === label;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left font-sans text-sm font-medium transition-all flex items-center gap-3 ${
                isActive
                  ? "bg-brand-green text-white"
                  : "text-brand-text-secondary hover:bg-brand-green-muted hover:text-brand-green"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  if (islandContent) {
    return (
      <div
        className={`hidden h-dvh overflow-hidden bg-white md:block ${
          edgeToEdge ? "p-0" : "p-4"
        }`}
      >
        <div
          className={`h-full w-full ${
            edgeToEdge
              ? "rounded-none bg-white p-0"
              : "rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
          }`}
        >
          <div className="flex h-full gap-[10px]">
            {desktopSidebar}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-[14px] overflow-hidden">
              {desktopHeader}
              <div className="w-full flex-1 min-h-0 overflow-hidden rounded-[20px] bg-[#F6F6F6] px-9 py-7">
                <div className="h-full w-full overflow-y-auto pr-1 scrollbar-hide">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden min-h-screen flex-col bg-brand-bg-page md:flex">
      {desktopHeader}
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-brand-border flex flex-col py-6 px-4 shrink-0">
          <nav className="flex flex-col gap-1">
            {NAV.map(({ label, path, Icon }) => {
              const isActive = active === label;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all cursor-pointer w-full text-left ${
                    isActive
                      ? "bg-brand-green text-white"
                      : "text-brand-text-secondary hover:bg-brand-green-muted hover:text-brand-green"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-card p-8 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
