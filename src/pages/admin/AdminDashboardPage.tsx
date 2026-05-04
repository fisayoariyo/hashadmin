import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  LoaderCircle,
  MoreVertical,
  RefreshCw,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import userArrowLeftRightIcon from "@/assets/icons/admin-dashboard/user-arrow-left-right.svg";
import tractorIcon from "@/assets/icons/admin-dashboard/tractor.svg";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { listFarmers, listPendingAgents, syncGeoData, type AdminFarmerRow, type PendingAgentRow } from "@/lib/adminApi";

function ChangePill({ text }: { text: string }) {
  return (
    <span className="inline-flex max-w-[min(100%,11rem)] items-center rounded-[50px] bg-[#007158] px-2.5 py-1.5 text-left text-[11px] font-light leading-tight text-[#F6F6F6] lg:max-w-none lg:px-3 lg:text-xs">
      {text}
    </span>
  );
}

function SeeAllLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 font-sans text-sm font-semibold text-[#FFBB3C] hover:text-[#F2AA1F] hover:underline"
    >
      See all
      <ArrowUpRight size={16} strokeWidth={2} />
    </button>
  );
}

function isToday(dateText: string) {
  if (!dateText || dateText === "-") return false;
  const today = new Date();
  const current = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
  return dateText === current;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const menusRef = useRef<HTMLDivElement>(null);
  const [farmerMenuId, setFarmerMenuId] = useState<string | null>(null);
  const [farmers, setFarmers] = useState<AdminFarmerRow[]>([]);
  const [pendingAgents, setPendingAgents] = useState<PendingAgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncingGeo, setSyncingGeo] = useState(false);
  const [geoMessage, setGeoMessage] = useState("");

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menusRef.current?.contains(event.target as Node)) {
        setFarmerMenuId(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([listFarmers(), listPendingAgents()])
      .then((results) => {
        if (!active) return;
        const [farmersResult, agentsResult] = results;
        if (farmersResult.status === "fulfilled") {
          setFarmers(farmersResult.value);
        } else {
          setFarmers([]);
        }
        if (agentsResult.status === "fulfilled") {
          setPendingAgents(agentsResult.value);
        } else {
          setPendingAgents([]);
        }

        const errors = [farmersResult, agentsResult]
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
          .map((result) => (result.reason instanceof Error ? result.reason.message : "Request failed."));
        setError(errors[0] || "");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const recentFarmers = useMemo(
    () =>
      [...farmers]
        .sort((left, right) => right.regDate.localeCompare(left.regDate))
        .slice(0, 10),
    [farmers],
  );

  const stats = useMemo(
    () => [
      {
        key: "farmers",
        label: "Total Farmers Registered",
        value: String(farmers.length),
        changeLabel: farmers.length ? "Live from backend" : "No farmer data yet",
      },
      {
        key: "agents",
        label: "Total Agents",
        value: "—",
        changeLabel: "Agent list endpoint not in Swagger yet",
      },
      {
        key: "activeAgents",
        label: "Active Agents",
        value: "—",
        changeLabel: "Needs admin agent list endpoint",
      },
      {
        key: "farmersToday",
        label: "Farmers Registered Today",
        value: String(farmers.filter((row) => isToday(row.regDate)).length),
        changeLabel: "Computed from live farmer list",
      },
      {
        key: "pendingVerification",
        label: "Pending Agent verification",
        value: String(pendingAgents.length),
        changeLabel: pendingAgents.length ? "Awaiting review" : "No pending agents",
      },
    ],
    [farmers, pendingAgents],
  );

  const handleGeoSync = async () => {
    setSyncingGeo(true);
    setGeoMessage("");
    try {
      const response = await syncGeoData();
      const statsText =
        (response as any)?.states_processed || (response as any)?.lgas_processed
          ? `Geo sync completed: ${(response as any)?.states_processed ?? 0} states, ${(response as any)?.lgas_processed ?? 0} LGAs.`
          : "Geo sync completed.";
      setGeoMessage(statsText);
    } catch (syncError) {
      setGeoMessage(syncError instanceof Error ? syncError.message : "Geo sync failed.");
    } finally {
      setSyncingGeo(false);
    }
  };

  const statIcon = (key: (typeof stats)[number]["key"]) => {
    const userIcon = (
      <img
        src={userArrowLeftRightIcon}
        alt=""
        aria-hidden
        className="h-[27px] w-[27px] object-contain lg:h-[30px] lg:w-[30px]"
      />
    );
    const tractorStatIcon = (
      <img
        src={tractorIcon}
        alt=""
        aria-hidden
        className="h-[21px] w-[21px] object-contain lg:h-[24px] lg:w-[24px]"
      />
    );

    switch (key) {
      case "farmers":
        return tractorStatIcon;
      case "agents":
      case "activeAgents":
      case "pendingVerification":
        return userIcon;
      case "farmersToday":
        return tractorStatIcon;
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
            Dashboard Overview
          </h2>
          {error ? (
            <p className="mt-2 font-sans text-sm text-red-600">{error}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void handleGeoSync()}
          disabled={syncingGeo}
          className="inline-flex items-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5 disabled:opacity-50"
        >
          {syncingGeo ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {syncingGeo ? "Syncing geo..." : "Run geo sync"}
        </button>
      </div>

      {geoMessage ? (
        <div className="rounded-2xl border border-[#e4e4e4] bg-white px-4 py-3 font-sans text-sm text-brand-text-primary shadow-sm">
          {geoMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.key} className="min-w-0">
            <AdminStatCard
              label={stat.label}
              value={loading ? "…" : stat.value}
              icon={statIcon(stat.key)}
              badge={stat.changeLabel ? <ChangePill text={stat.changeLabel} /> : undefined}
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
              <span>State</span>
              <span>Gender</span>
              <span className="text-center" aria-hidden>
                ·
              </span>
            </div>
            {recentFarmers.length === 0 ? (
              <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
                {loading ? "Loading farmers..." : "No farmers available."}
              </p>
            ) : (
              recentFarmers.map((row, index) => (
                <div
                  key={row.farmerId}
                  className={`relative grid grid-cols-[1fr_1.1fr_0.85fr_0.65fr_2.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                    index % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
                  }`}
                >
                  <span className="truncate font-medium text-brand-text-primary">{row.name}</span>
                  <span className="truncate text-brand-text-secondary">{row.farmerId}</span>
                  <span className="truncate text-brand-text-secondary">{row.state}</span>
                  <span className="truncate text-brand-text-secondary">{row.gender}</span>
                  <div className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={() => setFarmerMenuId((value) => (value === row.farmerId ? null : row.farmerId))}
                      className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                      aria-label={`Actions for ${row.name}`}
                    >
                      <MoreVertical size={18} strokeWidth={1.8} />
                    </button>
                    {farmerMenuId === row.farmerId ? (
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
                          onClick={() => copyText(row.farmerId, () => setFarmerMenuId(null))}
                        >
                          Copy farmer ID
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
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
            {pendingAgents.length === 0 ? (
              <p className="rounded-[14px] bg-[#F6F6F6] px-3 py-6 text-center font-sans text-sm text-brand-text-secondary">
                {loading ? "Loading pending agents..." : "No pending agents."}
              </p>
            ) : (
              pendingAgents.slice(0, 4).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-start gap-3 rounded-[14px] bg-[#F6F6F6] px-3 py-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8e8e8] text-brand-text-muted">
                    <User size={20} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-brand-text-primary">
                      {agent.name}
                    </p>
                    <p className="truncate font-sans text-xs text-brand-text-secondary">{agent.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/agent-verification/${encodeURIComponent(agent.id)}`);
                      }}
                      className="mt-1.5 inline-flex items-center gap-0.5 font-sans text-xs font-semibold text-[#03624D] hover:underline"
                    >
                      View Details
                      <ChevronRight size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              onClick={() => {
                navigate("/agent-verification");
              }}
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
