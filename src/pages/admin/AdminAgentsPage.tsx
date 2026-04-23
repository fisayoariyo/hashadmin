import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, List, MoreVertical, Search } from "lucide-react";
import { adminAgentsList, type AdminAgentListRow } from "@/mockData/adminAgents";
import { useNigeriaStateLga } from "@/hooks/useNigeriaStateLga";

const selectClass =
  "h-9 min-w-[120px] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white sm:min-w-[132px]";

function matchesNameSearch(row: AdminAgentListRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return row.name.toLowerCase().includes(s);
}

function statusPill(status: AdminAgentListRow["status"]) {
  if (status === "Active") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 font-sans text-xs font-semibold text-emerald-700">
        Active
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-sans text-xs font-semibold text-orange-700">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 font-sans text-xs font-semibold text-neutral-600">
      Inactive
    </span>
  );
}

type StatusFilter = "All" | AdminAgentListRow["status"];

export default function AdminAgentsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [stateFilter, setStateFilter] = useState("All states");
  const [lgaFilter, setLgaFilter] = useState("All LGAs");
  const [menuId, setMenuId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { states, getLgasForState } = useNigeriaStateLga();

  const stateOptions = useMemo(() => ["All states", ...states], [states]);

  const lgaOptions = useMemo(() => {
    if (stateFilter === "All states") return ["All LGAs"];
    const list = getLgasForState(stateFilter);
    return ["All LGAs", ...list];
  }, [getLgasForState, stateFilter]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const rows = useMemo(() => {
    return adminAgentsList.filter((row) => {
      if (!matchesNameSearch(row, searchApplied)) return false;
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (stateFilter !== "All states" && row.state !== stateFilter) return false;
      if (lgaFilter !== "All LGAs" && row.lga !== lgaFilter) return false;
      return true;
    });
  }, [searchApplied, statusFilter, stateFilter, lgaFilter]);

  const tableGrid =
    "grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,0.85fr)_2.5rem] gap-2";

  return (
    <div className="w-full pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">Agent Management</h2>

      <div className="mt-5 flex w-full items-center gap-2 sm:max-w-[520px]">
        <div className="flex h-[44px] min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e4e4e4] bg-white pl-4 pr-3">
          <Search size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              if (!v.trim()) setSearchApplied("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearchApplied(query);
            }}
            placeholder="Search agent by name"
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-brand-text-primary outline-none placeholder:text-brand-text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => setSearchApplied(query)}
          className="h-[30px] shrink-0 rounded-full bg-[#03624D] px-8 font-sans text-xs font-semibold text-white transition hover:brightness-105 active:scale-[0.99]"
        >
          Search
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={selectClass}
            aria-label="Status"
          >
            <option value="All">Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
        <div className="relative">
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setLgaFilter("All LGAs");
            }}
            className={selectClass}
            aria-label="State"
          >
            {stateOptions.map((s) => (
              <option key={s} value={s}>
                {s === "All states" ? "State" : s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
        <div className="relative">
          <select
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
            disabled={stateFilter === "All states"}
            className={`${selectClass} disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:text-brand-text-muted`}
            aria-label="Local Government Area"
          >
            {lgaOptions.map((l) => (
              <option key={l} value={l}>
                {l === "All LGAs" ? "LGA" : l}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
      </div>

      <div ref={tableRef} className="mt-2 overflow-x-auto">
        <div
          className={`${tableGrid} min-w-[760px] px-4 py-3.5 text-left font-sans text-sm font-bold text-brand-text-primary`}
        >
          <span>Name</span>
          <span>Phone number</span>
          <span>Status</span>
          <span>State</span>
          <span>LGA</span>
          <span className="sr-only">Actions</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            No agents match your filters.
          </p>
        ) : (
          rows.map((row, i) => (
            <div
              key={row.id}
              className={`${tableGrid} min-w-[760px] items-center px-4 py-3.5 text-sm ${
                i % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => navigate(`/agents/${encodeURIComponent(row.agentId)}`)}
                className="truncate text-left font-medium text-brand-text-primary hover:underline"
              >
                {row.name}
              </button>
              <span className="truncate font-sans text-brand-text-secondary">{row.phone}</span>
              <div className="shrink-0">{statusPill(row.status)}</div>
              <span className="truncate text-brand-text-secondary">{row.state}</span>
              <span className="truncate text-brand-text-secondary">{row.lga}</span>
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setMenuId((v) => (v === row.id ? null : row.id))}
                  className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                  aria-label={`Actions for ${row.name}`}
                >
                  <MoreVertical size={18} strokeWidth={1.8} />
                </button>
                {menuId === row.id ? (
                  <div className="absolute right-0 top-full z-30 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-[#e4e4e4] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left font-sans text-sm font-medium text-brand-text-primary hover:bg-[#f6f6f6]"
                      onClick={() => {
                        setMenuId(null);
                        navigate(`/agents/${encodeURIComponent(row.agentId)}`);
                      }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-brand-text-primary">
                        <List size={18} strokeWidth={1.8} />
                      </span>
                      View details
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
