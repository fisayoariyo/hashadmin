import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Filter, MoreVertical, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listPendingAgents, type PendingAgentRow } from "@/lib/adminApi";

const filterPillClass =
  "h-9 min-w-[112px] cursor-pointer appearance-none rounded-full border border-[#e4e4e4] bg-[#F3F3F3] py-2 pl-4 pr-9 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-[#ececec] focus:border-[#d4d4d4] focus:bg-white sm:min-w-[124px]";

function matchesSearch(row: PendingAgentRow, q: string) {
  if (!q.trim()) return true;
  const search = q.trim().toLowerCase();
  return row.name.toLowerCase().includes(search);
}

type PendingAgentsPanelProps = {
  title: string;
  description?: string;
  fetchRows?: () => Promise<PendingAgentRow[]>;
};

type SortOption = "default" | "registration" | "name" | "state";

export default function PendingAgentsPanel({ title, description, fetchRows }: PendingAgentsPanelProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PendingAgentRow["status"]>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<PendingAgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadMoreSteps, setLoadMoreSteps] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!tableRef.current?.contains(event.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const loadRows = fetchRows ?? listPendingAgents;
    loadRows()
      .then((payload) => {
        if (active) setRows(payload);
      })
      .catch((fetchError) => {
        if (active) {
          setRows([]);
          setError(fetchError instanceof Error ? fetchError.message : "Could not load pending agents.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchRows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (!matchesSearch(row, searchApplied)) return false;
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        return true;
      }),
    [rows, searchApplied, statusFilter],
  );

  const sortedRows = useMemo(() => {
    if (sortOption === "default") return filteredRows;
    return [...filteredRows].sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "state") return a.state.localeCompare(b.state);
      const timeA = Date.parse(a.registrationTimestamp) || 0;
      const timeB = Date.parse(b.registrationTimestamp) || 0;
      return timeA - timeB;
    });
  }, [filteredRows, sortOption]);

  const visibleCount = 8 + loadMoreSteps * 4;
  const visibleRows = sortedRows.slice(0, visibleCount);
  const canLoadMore = visibleRows.length < sortedRows.length;

  useEffect(() => {
    setLoadMoreSteps(0);
  }, [searchApplied, statusFilter, sortOption]);

  return (
    <div className="w-full space-y-5 pb-4">
      <div className="space-y-1">
        <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">{title}</h2>
        {description ? (
          <p className="font-sans text-sm text-brand-text-secondary">{description}</p>
        ) : null}
      </div>

      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}

      <div className="flex w-full items-center gap-2 sm:max-w-[520px]">
        <div className="flex h-[44px] min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e4e4e4] bg-white pl-4 pr-3">
          <Search size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (!value.trim()) setSearchApplied("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") setSearchApplied(query);
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className={filterPillClass}
            aria-label="Status"
          >
            <option value="all">Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
        <div className="relative">
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            className={filterPillClass}
            aria-label="Sort by"
          >
            <option value="default">Sort by</option>
            <option value="registration">Registration Date</option>
            <option value="name">Name</option>
            <option value="state">State</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
      </div>

      <div ref={tableRef} className="overflow-x-auto overflow-y-visible">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_minmax(6rem,0.85fr)_3rem] gap-3 px-5 py-3.5 text-left font-sans text-sm font-semibold text-brand-text-primary">
            <span>Name</span>
            <span>Phone number</span>
            <span>Status</span>
            <span>State</span>
            <span>LGA</span>
            <span className="sr-only">Actions</span>
          </div>
          {visibleRows.length === 0 ? (
            <p className="px-5 py-12 text-center font-sans text-sm text-brand-text-secondary">
              {loading ? "Loading pending agents..." : "No agents match your filters."}
            </p>
          ) : (
            visibleRows.map((row, index) => (
              <div
                key={row.id}
                className={`relative grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_minmax(6rem,0.85fr)_3rem] items-center gap-3 px-5 py-4 text-sm ${
                  index % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
                } ${menuId === row.id ? "z-20" : "z-0"}`}
              >
                <span className="truncate font-sans font-medium text-brand-text-primary">{row.name}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.phone}</span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 font-sans text-xs font-semibold ${
                    row.status === "verified"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {row.status === "verified" ? "Verified" : "Pending"}
                </span>
                <span className="truncate font-sans text-brand-text-secondary">{row.state}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.lga}</span>
                <div className="relative flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMenuId((value) => (value === row.id ? null : row.id))}
                    className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                    aria-label={`Actions for ${row.name}`}
                  >
                    <MoreVertical size={18} strokeWidth={1.8} />
                  </button>
                  {menuId === row.id ? (
                    <div
                      className="absolute right-0 top-full z-40 mt-1 w-[200px] overflow-hidden rounded-xl border border-[#e8e8e8] bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                      role="menu"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-4 py-3.5 text-left font-sans text-sm text-[#0f172a] transition hover:bg-[#f8fafc]"
                        onClick={() => {
                          setMenuId(null);
                          navigate(`/agent-verification/${encodeURIComponent(row.id)}`);
                        }}
                      >
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

      {sortedRows.length > 0 && canLoadMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setLoadMoreSteps((steps) => steps + 1)}
            className="rounded-full border border-[#e4e4e4] bg-white px-8 py-2.5 font-sans text-sm font-semibold text-[#03624D] shadow-sm transition hover:bg-[#f6faf8]"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
