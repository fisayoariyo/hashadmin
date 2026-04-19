import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Inbox,
  MoreVertical,
  User,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  adminDashboardStats,
  adminPendingAgents,
  adminRecentFarmers,
} from "@/mockData/adminDashboard";

function ChangePill({ text }: { text: string }) {
  return (
    <span className="inline-flex max-w-[min(100%,9rem)] items-center rounded-[50px] bg-[#007158] px-2.5 py-1.5 text-left text-[11px] font-light leading-tight text-[#F6F6F6] lg:max-w-none lg:px-3 lg:text-xs">
      {text}
    </span>
  );
}

function SeeAllLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 font-sans text-sm font-semibold text-[#ea580c] hover:text-[#c2410c] hover:underline"
    >
      See all
      <ArrowUpRight size={16} strokeWidth={2} />
    </button>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [farmerMenuId, setFarmerMenuId] = useState<string | null>(null);
  const menusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!menusRef.current?.contains(e.target as Node)) {
        setFarmerMenuId(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const statIcon = (key: (typeof adminDashboardStats)[number]["key"]) => {
    const common = { strokeWidth: 1.75 as const, className: "text-white" };
    switch (key) {
      case "farmers":
        return <Users {...common} />;
      case "agents":
        return <UserCog {...common} />;
      case "activeAgents":
        return <UserCheck {...common} />;
      case "farmersToday":
        return <Inbox {...common} />;
      case "pendingVerification":
        return <ClipboardList {...common} />;
      default:
        return null;
    }
  };

  const copyText = async (text: string, after?: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    after?.();
  };

  return (
    <div ref={menusRef} className="w-full space-y-8 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
        Dashboard Overview
      </h2>

      {/* Same tile width for all five: 3 cols row 1, 2 cols row 2 (third cell empty) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {adminDashboardStats.map((s) => (
          <div key={s.key} className="min-w-0">
            <AdminStatCard
              label={s.label}
              value={s.value}
              icon={statIcon(s.key)}
              badge={s.changeLabel ? <ChangePill text={s.changeLabel} /> : undefined}
              onClick={() => navigate(s.path)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
              Recent Farmers Registered
            </h3>
            <SeeAllLink onClick={() => navigate("/farmers")} />
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white">
            <div className="grid grid-cols-[1fr_1.1fr_0.85fr_0.65fr_2.5rem] gap-2 border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
              <span>Name</span>
              <span>Farmer ID</span>
              <span>Status</span>
              <span>Gender</span>
              <span className="text-center" aria-hidden>
                ·
              </span>
            </div>
            {adminRecentFarmers.map((row, i) => (
              <div
                key={row.id}
                className={`relative grid grid-cols-[1fr_1.1fr_0.85fr_0.65fr_2.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                  i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
                }`}
              >
                <span className="truncate font-medium text-brand-text-primary">{row.name}</span>
                <span className="truncate text-brand-text-secondary">{row.farmerId}</span>
                <span className="truncate text-brand-text-secondary">{row.status}</span>
                <span className="truncate text-brand-text-secondary">{row.gender}</span>
                <div className="relative flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setFarmerMenuId((v) => (v === row.id ? null : row.id))
                    }
                    className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                    aria-label={`Actions for ${row.name}`}
                  >
                    <MoreVertical size={18} strokeWidth={1.8} />
                  </button>
                  {farmerMenuId === row.id ? (
                    <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-[#e4e4e4] bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left font-sans text-sm text-brand-text-primary hover:bg-[#f6f6f6]"
                        onClick={() => {
                          setFarmerMenuId(null);
                          navigate(`/farmers/${encodeURIComponent(row.farmerId)}`);
                        }}
                      >
                        View farmer
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left font-sans text-sm text-brand-text-primary hover:bg-[#f6f6f6]"
                        onClick={() =>
                          copyText(row.farmerId, () => setFarmerMenuId(null))
                        }
                      >
                        Copy farmer ID
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
              Pending Agent Verification
            </h3>
            <SeeAllLink onClick={() => navigate("/agent-verification")} />
          </div>
          <div className="space-y-3 rounded-[20px] border border-[#e4e4e4] bg-white p-4">
            {adminPendingAgents.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-[14px] bg-[#F6F6F6] px-3 py-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8e8e8] text-brand-text-muted">
                  <User size={20} strokeWidth={1.6} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-semibold text-brand-text-primary">
                    {a.name}
                  </p>
                  <p className="truncate font-sans text-xs text-brand-text-secondary">{a.email}</p>
                  <button
                    type="button"
                    onClick={() => navigate("/agent-verification")}
                    className="mt-1.5 inline-flex items-center gap-0.5 font-sans text-xs font-semibold text-[#03624D] hover:underline"
                  >
                    View Details
                    <ChevronRight size={14} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => navigate("/agent-verification")}
              className="mt-2 w-full rounded-[12px] bg-[#FFBB3C] py-3.5 font-sans text-sm font-medium text-[#030F0F] transition hover:brightness-95 active:scale-[0.99]"
            >
              See all pending verifications
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
