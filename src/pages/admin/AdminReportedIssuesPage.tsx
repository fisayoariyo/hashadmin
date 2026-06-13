import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, MoreVertical } from "lucide-react";
import {
  listSupportTickets,
  updateSupportTicketStatus,
  type AdminSupportTicketRow,
  type AdminSupportTicketStatus,
} from "@/lib/adminApi";

const filterPillClass =
  "h-9 min-w-[112px] cursor-pointer appearance-none rounded-full border border-[#e4e4e4] bg-[#F3F3F3] py-2 pl-4 pr-9 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-[#ececec] focus:border-[#d4d4d4] focus:bg-white sm:min-w-[124px]";

const tableGridClass =
  "grid min-w-[960px] grid-cols-[minmax(5rem,0.75fr)_minmax(8rem,1.1fr)_minmax(9rem,1.2fr)_minmax(7rem,1fr)_minmax(5rem,0.7fr)_minmax(5rem,0.75fr)_3rem] items-center gap-3";

type StatusFilter = "all" | AdminSupportTicketStatus;
type SortOption = "default" | "date-desc" | "date-asc" | "issue-id" | "agent-name";

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
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminSupportTicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
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

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        if (issueTypeFilter !== "all" && row.issueType !== issueTypeFilter) return false;
        return true;
      }),
    [rows, statusFilter, issueTypeFilter],
  );

  const sortedRows = useMemo(() => {
    if (sortOption === "default") return filteredRows;
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
  }, [statusFilter, issueTypeFilter, sortOption]);

  const handleMarkResolved = async (row: AdminSupportTicketRow) => {
    if (row.status === "Resolved") return;
    setResolvingId(row.id);
    setActionError("");
    try {
      const updated = await updateSupportTicketStatus(row.id, "Resolved");
      setRows((current) => current.map((item) => (item.id === row.id ? updated : item)));
      setMenuId(null);
    } catch (resolveError) {
      setActionError(
        resolveError instanceof Error ? resolveError.message : "Could not mark issue as resolved.",
      );
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="w-full space-y-5 pb-4">
      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}
      {actionError ? <p className="font-sans text-sm text-red-600">{actionError}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-text-secondary">
          <Filter size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          Filter
        </span>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className={filterPillClass}
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
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted"
            aria-hidden
          />
        </div>
        <div className="relative">
          <select
            value={issueTypeFilter}
            onChange={(event) => setIssueTypeFilter(event.target.value)}
            className={filterPillClass}
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
            <option value="date-desc">Date</option>
            <option value="date-asc">Date (oldest)</option>
            <option value="issue-id">Issue ID</option>
            <option value="agent-name">Agent Name</option>
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
        <div className="min-w-[960px]">
          <div
            className={`${tableGridClass} px-5 py-3.5 text-left font-sans text-sm font-semibold text-brand-text-primary`}
          >
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
                      <button
                        type="button"
                        role="menuitem"
                        disabled={row.status === "Resolved" || resolvingId === row.id}
                        className="block w-full px-4 py-3.5 text-left font-sans text-sm text-[#0f172a] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => handleMarkResolved(row)}
                      >
                        {resolvingId === row.id ? "Marking resolved..." : "Mark as resolved"}
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
