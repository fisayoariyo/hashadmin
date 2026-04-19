import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, List, MoreVertical, Search } from "lucide-react";
import { adminAgentsList, type AdminAgentListRow } from "@/mockData/adminAgents";
import { useNigeriaStateLga } from "@/hooks/useNigeriaStateLga";

const selectClass =
  "h-11 min-w-[140px] cursor-pointer rounded-xl border border-[#e4e4e4] bg-white px-3 font-sans text-sm text-brand-text-primary outline-none focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D] sm:min-w-[160px]";

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
      <section className="space-y-5 rounded-[20px] border border-[#e4e4e4] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">Agent Management</h2>

      <div className="flex min-h-[52px] w-full items-stretch overflow-hidden rounded-full border border-[#e4e4e4] bg-white shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-4 pr-2">
          <Search size={20} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          className="m-1 shrink-0 self-center rounded-full bg-[#03624D] px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
        >
          Search
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="inline-flex items-center gap-2 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
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
      </div>

      <div ref={tableRef} className="overflow-hidden rounded-[16px] border border-[#e8e8e8] bg-white">
        <div
          className={`${tableGrid} border-b border-[#ececec] bg-[#fafafa] px-4 py-3.5 text-left font-sans text-sm font-bold text-brand-text-primary`}
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
              className={`${tableGrid} items-center border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
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
      </section>
    </div>
  );
}
