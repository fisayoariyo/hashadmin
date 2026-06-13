import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, MoreVertical } from "lucide-react";
import {
  listSupportTickets,
  type AdminSupportTicketRow,
  type AdminSupportTicketStatus,
} from "@/lib/adminApi";

const selectClass =
  "h-9 min-w-[120px] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white sm:min-w-[132px]";

const tableGridClass =
  "grid min-w-[960px] grid-cols-[minmax(5rem,0.75fr)_minmax(8rem,1.1fr)_minmax(9rem,1.2fr)_minmax(7rem,1fr)_minmax(5rem,0.7fr)_minmax(5rem,0.75fr)_3rem] items-center gap-3";

type StatusFilter = "all" | AdminSupportTicketStatus;
type SortOption = "date-desc" | "date-asc" | "issue-id" | "agent-name";

function statusLabel(status: AdminSupportTicketStatus) {
  if (status === "In review") return "Pending";
  return status;
}

function IssueStatusBadge({ status }: { status: AdminSupportTicketStatus }) {
  const label = statusLabel(status);
  const styles =
    status === "In review"
      ? "bg-[#FFF8ED] text-[#C2410C]"
      : status === "Open"
        ? "bg-[#FEF2F2] text-[#B91C1C]"
        : "bg-[#ECFDF5] text-[#047857]";
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 font-sans text-xs font-semibold leading-none ${styles}`}
    >
      {label}
    </span>
  );
}

function parseRowDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;
  const parts = value.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map((part) => Number.parseInt(part, 10));
    if (day && month && year) return Date.UTC(year, month - 1, day);
  }
  return 0;
}

export default function AdminReportedIssuesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminSupportTicketRow[]>([]);
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

  const issueTypeOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(rows.map((row) => row.issueType).filter((issueType) => issueType && issueType !== "-")),
      ),
    ],
    [rows],
  );

  const stateOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(rows.map((row) => row.state).filter((state) => state && state !== "-"))),
    ],
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        if (issueTypeFilter !== "all" && row.issueType !== issueTypeFilter) return false;
        if (stateFilter !== "all" && row.state !== stateFilter) return false;
        return true;
      }),
    [rows, statusFilter, issueTypeFilter, stateFilter],
  );

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (sortOption === "issue-id") return a.id.localeCompare(b.id);
      if (sortOption === "agent-name") return a.agentName.localeCompare(b.agentName);
      const timeA = parseRowDate(a.createdAt);
      const timeB = parseRowDate(b.createdAt);
      return sortOption === "date-asc" ? timeA - timeB : timeB - timeA;
    });
  }, [filteredRows, sortOption]);

  const visibleCount = 7 + loadMoreSteps * 4;
  const visibleRows = sortedRows.slice(0, visibleCount);
  const canLoadMore = visibleRows.length < sortedRows.length;

  useEffect(() => {
    setLoadMoreSteps(0);
  }, [statusFilter, issueTypeFilter, stateFilter, sortOption]);

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        Reported Issues
      </h2>

      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className={selectClass}
              aria-label="Status"
            >
              <option value="all">Status</option>
              <option value="Open">Open</option>
              <option value="In review">Pending</option>
              <option value="Resolved">Resolved</option>
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
              value={issueTypeFilter}
              onChange={(event) => setIssueTypeFilter(event.target.value)}
              className={selectClass}
              aria-label="Issue type"
            >
              {issueTypeOptions.map((issueType) => (
                <option key={issueType} value={issueType}>
                  {issueType === "all" ? "Issue type" : issueType}
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
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              className={selectClass}
              aria-label="State"
            >
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state === "all" ? "State" : state}
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-text-secondary">Sort by</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className={selectClass}
              aria-label="Sort by"
            >
              <option value="date-desc">Date</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="issue-id">Issue ID</option>
              <option value="agent-name">Agent Name</option>
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted"
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div ref={tableRef} className="overflow-x-auto overflow-y-visible">
        <div className="min-w-[960px]">
          <div className={`${tableGridClass} px-5 py-3.5 text-left font-sans text-sm font-semibold text-brand-text-primary`}>
            <span>Issue ID</span>
            <span>Agent Name</span>
            <span>Farmer ID</span>
            <span>Issue Type</span>
            <span>Status</span>
            <span>Date</span>
            <span className="sr-only">Actions</span>
          </div>
          {visibleRows.length === 0 ? (
            <p className="px-5 py-12 text-center font-sans text-sm text-brand-text-secondary">
              {loading ? "Loading support tickets..." : "No issues match your filters."}
            </p>
          ) : (
            visibleRows.map((row, index) => (
              <div
                key={row.id}
                className={`relative ${tableGridClass} px-5 py-4 text-sm ${
                  index % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
                } ${menuId === row.id ? "z-20" : "z-0"}`}
              >
                <span className="truncate font-sans font-medium text-brand-text-primary">{row.id}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.agentName}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.farmerId}</span>
                <span className="truncate font-sans text-brand-text-secondary">{row.issueType}</span>
                <IssueStatusBadge status={row.status} />
                <span className="truncate font-sans text-brand-text-secondary">{row.createdAt}</span>
                <div className="relative flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMenuId((value) => (value === row.id ? null : row.id))}
                    className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                    aria-label={`Actions for ${row.id}`}
                  >
                    <MoreVertical size={18} strokeWidth={1.8} />
                  </button>
                  {menuId === row.id ? (
                    <div
                      className="absolute right-0 top-full z-40 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-[#e8e8e8] bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                      role="menu"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-4 py-3.5 text-left font-sans text-sm text-[#0f172a] transition hover:bg-[#f8fafc]"
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
