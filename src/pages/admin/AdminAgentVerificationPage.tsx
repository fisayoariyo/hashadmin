import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, MoreVertical, Search } from "lucide-react";
import { listPendingAgents, type PendingAgentRow } from "@/lib/adminApi";

const selectClass =
  "h-9 min-w-[120px] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white sm:min-w-[132px]";

function matchesSearch(row: PendingAgentRow, q: string) {
  if (!q.trim()) return true;
  const search = q.trim().toLowerCase();
  return (
    row.name.toLowerCase().includes(search) ||
    row.phone.toLowerCase().includes(search) ||
    row.email.toLowerCase().includes(search)
  );
}

export default function AdminAgentVerificationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<PendingAgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    listPendingAgents()
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
  }, []);

  const stateOptions = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((row) => row.state).filter((state) => state && state !== "-")))],
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (!matchesSearch(row, searchApplied)) return false;
        if (stateFilter !== "all" && row.state !== stateFilter) return false;
        return true;
      }),
    [rows, searchApplied, stateFilter],
  );

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        Agent Verification
      </h2>

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
            placeholder="Search pending agent by name, email or phone"
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

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
        <div className="relative">
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            className={selectClass}
            aria-label="State"
          >
            {stateOptions.map((stateOption) => (
              <option key={stateOption} value={stateOption}>
                {stateOption === "all" ? "State" : stateOption}
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

      <div ref={tableRef} className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_minmax(6rem,0.85fr)_3rem] gap-3 px-5 py-3.5 text-left font-sans text-sm font-semibold text-brand-text-primary">
            <span>Name</span>
            <span>Phone number</span>
            <span>Status</span>
            <span>State</span>
            <span>LGA</span>
            <span className="sr-only">Actions</span>
          </div>
          {filteredRows.length === 0 ? (
            <p className="px-5 py-12 text-center font-sans text-sm text-brand-text-secondary">
              {loading ? "Loading pending agents..." : "No agents match your filters."}
            </p>
          ) : (
            filteredRows.map((row, index) => (
              <div
                key={row.id}
                className={`relative grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_minmax(6rem,0.85fr)_3rem] items-center gap-3 px-5 py-4 text-sm ${
                  index % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
                }`}
              >
                <span className="truncate font-sans font-medium text-brand-text-primary">{row.name}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.phone}</span>
                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-sans text-xs font-semibold text-orange-700">
                  Pending
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
    </div>
  );
}
