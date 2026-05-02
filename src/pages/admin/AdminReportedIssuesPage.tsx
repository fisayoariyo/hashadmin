import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MoreVertical, Search } from "lucide-react";
import { listSupportTickets, type AdminSupportTicketRow, type AdminSupportTicketStatus } from "@/lib/adminApi";

function matchesSearch(row: AdminSupportTicketRow, q: string) {
  if (!q.trim()) return true;
  const search = q.trim().toLowerCase();
  return (
    row.id.toLowerCase().includes(search) ||
    row.issueType.toLowerCase().includes(search) ||
    row.farmerId.toLowerCase().includes(search) ||
    row.userId.toLowerCase().includes(search) ||
    row.description.toLowerCase().includes(search)
  );
}

const statusOptions = ["All", "Open", "In review", "Resolved"] as const;

export default function AdminReportedIssuesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("All");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminSupportTicketRow[]>([]);
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
    listSupportTickets()
      .then((tickets) => {
        if (active) setRows(tickets);
      })
      .catch((fetchError) => {
        if (active) {
          setRows([]);
          setError(fetchError instanceof Error ? fetchError.message : "Could not load support tickets.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (!matchesSearch(row, searchApplied)) return false;
        if (status !== "All" && row.status !== (status as AdminSupportTicketStatus)) return false;
        return true;
      }),
    [rows, searchApplied, status],
  );

  return (
    <div className="w-full space-y-6 pb-4">
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
            placeholder="Search by issue type, farmer ID, user ID or ticket ID..."
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

      <label className="flex max-w-xs flex-col gap-1.5 font-sans text-xs font-medium text-brand-text-muted">
        Status
        <div className="relative">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white"
          >
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
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
      </label>

      <h2 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
        Reported Issues
      </h2>

      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}

      <div ref={tableRef} className="overflow-x-auto">
        <div className="grid min-w-[920px] grid-cols-[0.9fr_1.15fr_0.9fr_0.9fr_0.8fr_0.8fr_2.5rem] gap-2 px-4 py-3 text-left font-sans text-sm font-semibold text-brand-text-primary">
          <span>ID</span>
          <span>Issue Type</span>
          <span>Farmer ID</span>
          <span>User ID</span>
          <span>Created</span>
          <span>Status</span>
          <span className="text-center" aria-hidden>
            ·
          </span>
        </div>
        {filteredRows.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            {loading ? "Loading support tickets..." : "No issues match your filters."}
          </p>
        ) : (
          filteredRows.map((row, index) => (
            <div
              key={row.id}
              className={`relative grid min-w-[920px] grid-cols-[0.9fr_1.15fr_0.9fr_0.9fr_0.8fr_0.8fr_2.5rem] items-center gap-2 px-4 py-3.5 text-sm ${
                index % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
              }`}
            >
              <span className="truncate font-mono text-xs text-brand-text-secondary">{row.id}</span>
              <span className="truncate font-medium text-brand-text-primary">{row.issueType}</span>
              <span className="truncate text-brand-text-secondary">{row.farmerId}</span>
              <span className="truncate text-brand-text-secondary">{row.userId}</span>
              <span className="truncate text-brand-text-secondary">{row.createdAt}</span>
              <span
                className={`truncate font-medium ${
                  row.status === "Open"
                    ? "text-red-700"
                    : row.status === "In review"
                      ? "text-amber-700"
                      : "text-emerald-700"
                }`}
              >
                {row.status}
              </span>
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setMenuId((value) => (value === row.id ? null : row.id))}
                  className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                  aria-label={`Actions for ${row.id}`}
                >
                  <MoreVertical size={18} strokeWidth={1.8} />
                </button>
                {menuId === row.id ? (
                  <div className="absolute right-0 top-full z-30 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-[#e4e4e4] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left font-sans text-sm font-medium text-brand-text-primary hover:bg-[#f6f6f6]"
                      onClick={() => {
                        setMenuId(null);
                        navigate(`/reported-issues/${encodeURIComponent(row.id)}`);
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
  );
}
