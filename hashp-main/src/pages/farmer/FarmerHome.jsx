import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Copy, CreditCard, User, HelpCircle, Headphones, HandCoins, Users, Link2, Home } from "lucide-react";
import FarmerDesktopLayout from "../../components/farmer/FarmerDesktopLayout";
import FarmerFarmInfoBar from "../../components/farmer/FarmerFarmInfoBar";
import { getFarmerDashboard } from "../../services/cropexApi";

const PRIMARY = [
  { label: "View My ID", Icon: CreditCard, path: "/farmer/id" },
  { label: "My Profile", Icon: User, path: "/farmer/profile" },
  { label: "FAQs", Icon: HelpCircle, path: "/farmer/settings" },
  { label: "Contact", Icon: Headphones, path: "/farmer/settings" },
];

const BENEFITS = [
  { label: "Access loans", Icon: HandCoins, path: "/farmer/loans" },
  { label: "Get farm support", Icon: Users, path: "/farmer/support" },
  { label: "Connect to buyers", Icon: Link2, path: "/farmer/buyers" },
];

function MobileBottomNav() {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50">
      <div className="bg-white border-t border-brand-border flex items-center justify-around px-4 py-2">
        {[
          { label: "Home", Icon: Home, path: "/farmer/home", active: true },
          { label: "My profile", Icon: User, path: "/farmer/profile", active: false },
        ].map(({ label, Icon, path, active }) => (
          <button key={path} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center">
            <div className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${active ? "bg-brand-green" : ""}`}>
              <Icon size={22} strokeWidth={1.8} className={active ? "text-white" : "text-brand-green"} />
              <span className={`text-xs font-sans font-medium ${active ? "text-white" : "text-brand-text-secondary"}`}>{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionGrid({ navigate }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {PRIMARY.map(({ label, Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="card flex flex-col gap-3 text-left hover:shadow-card-lg active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center text-brand-green">
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <span className="font-sans font-medium text-sm text-brand-text-primary">{label}</span>
          </button>
        ))}
      </div>

      <h2 className="font-display font-bold text-lg text-brand-text-primary mb-3">Your Benefits</h2>
      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map(({ label, Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="card flex flex-col gap-3 text-left hover:shadow-card-lg active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center text-brand-green">
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-sans font-medium text-sm text-brand-text-primary">{label}</p>
              <span className="text-[10px] font-sans text-brand-text-muted bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function MobileFarmInfoCard({ farmSummary, onSeeMore }) {
  return (
    <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d7a63] to-[#005F4A] px-4 pb-4 pt-5 text-white shadow-[0_6px_14px_rgba(0,95,74,0.22)] ring-1 ring-inset ring-white/12">
      <h2 className="font-display text-[22px] font-bold leading-7">My Farm Information</h2>

      <div className="mt-4 grid grid-cols-3 gap-0">
        {[
          { label: "Farm size", value: farmSummary.farmSize },
          { label: "Crop Type", value: farmSummary.cropType },
          { label: "Soil Type", value: farmSummary.soilType },
        ].map(({ label, value }, idx) => (
          <div
            key={label}
            className={`min-w-0 px-2 ${idx > 0 ? "border-l border-white/25 pl-3" : "pl-0"}`}
          >
            <p className="font-sans text-xs text-white/85">{label}</p>
            <p className="mt-1 font-display text-[18px] font-semibold leading-tight line-clamp-2 break-words">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/20 pt-3">
        <p className="font-sans text-xs text-white/85">Farm location</p>
        <p className="mt-1 font-display text-[20px] font-semibold leading-tight line-clamp-2 break-words">
          {farmSummary.farmLocation}
        </p>
      </div>

      <button
        type="button"
        onClick={onSeeMore}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 text-sm font-semibold"
      >
        See more info <ArrowRight size={15} />
      </button>
    </section>
  );
}

export default function FarmerHome() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getFarmerDashboard()
      .then((payload) => {
        if (!active) return;
        setDashboard(payload);
        setError("");
      })
      .catch((fetchError) => {
        if (!active) return;
        setDashboard(null);
        setError(fetchError instanceof Error ? fetchError.message : "Could not load your dashboard right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const farmer = dashboard?.farmer;
  const farmerName = farmer?.full_name || "Farmer";
  const farmerFirstName = farmerName.split(" ")[0] || "Farmer";
  const farmerId = farmer?.farmer_id || "Unavailable";
  const farmSummary = useMemo(
    () => ({
      farmSize: farmer?.farm_size || "-",
      cropType:
        (Array.isArray(farmer?.primary_crops) && farmer.primary_crops[0]) ||
        farmer?.crop_type ||
        "-",
      soilType: farmer?.soil_type || "-",
      farmLocation: farmer?.farm_location || farmer?.residential_address || "-",
    }),
    [farmer]
  );

  const copyID = () => {
    if (farmerId === "Unavailable") return;
    navigator.clipboard?.writeText(farmerId).catch(() => {});
  };
  const badgeLabel = farmer ? "Verified" : loading ? "Loading" : "Unavailable";

  return (
    <>
      <div className="md:hidden page-container">
        <div className="flex-1 px-4 pt-5 pb-28 overflow-y-auto scrollbar-hide">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-2xl text-brand-text-primary">
                Welcome {farmerFirstName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-sans text-sm text-brand-text-secondary">
                  your ID: <span className="font-semibold text-brand-green">{farmerId}</span>
                </span>
                <button onClick={copyID} className="text-brand-text-muted hover:text-brand-green transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <span className="flex items-center gap-1.5 bg-brand-green text-white text-xs font-semibold font-sans px-3 py-1.5 rounded-full shrink-0">
              <BadgeCheck size={13} /> {badgeLabel}
            </span>
          </div>
          <MobileFarmInfoCard farmSummary={farmSummary} onSeeMore={() => navigate("/farmer/profile")} />
          <ActionGrid navigate={navigate} />
        </div>
        <MobileBottomNav />
      </div>

      <FarmerDesktopLayout activeNav="Home" islandContent edgeToEdge>
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mb-8">
          <FarmerFarmInfoBar
            title="My Farm Information"
            items={[
              { label: "Farm size", value: farmSummary.farmSize, onClick: () => navigate("/farmer/profile") },
              { label: "Crop Type", value: farmSummary.cropType, onClick: () => navigate("/farmer/profile") },
              { label: "Soil Type", value: farmSummary.soilType, onClick: () => navigate("/farmer/profile") },
              { label: "Farm Location", value: farmSummary.farmLocation, onClick: () => navigate("/farmer/profile") },
            ]}
          />
        </div>

        <h2 className="font-display font-bold text-lg text-brand-text-primary mb-4">Your Information</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {PRIMARY.map(({ label, Icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white rounded-2xl p-5 flex flex-col gap-4 text-left hover:shadow-card-lg active:scale-[0.98] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <span className="font-sans font-medium text-sm text-brand-text-primary">{label}</span>
            </button>
          ))}
        </div>

        <h2 className="font-display font-bold text-lg text-brand-text-primary mb-4">Your Benefits</h2>
        <div className="grid grid-cols-3 gap-4">
          {BENEFITS.map(({ label, Icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white rounded-2xl p-5 flex flex-col gap-4 text-left hover:shadow-card-lg active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-green">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-brand-text-primary">{label}</p>
                <span className="text-[10px] font-sans text-brand-text-muted bg-white px-2 py-0.5 rounded-full">Coming soon</span>
              </div>
            </button>
          ))}
        </div>
      </FarmerDesktopLayout>
    </>
  );
}
