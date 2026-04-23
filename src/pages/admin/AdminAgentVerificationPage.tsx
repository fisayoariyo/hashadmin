import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, ChevronDown, CircleX, Filter, List, MoreVertical, Search } from "lucide-react";
import {
  adminAgentVerificationList,
  type AdminAgentVerificationListRow,
  type AgentVerificationStatus,
} from "@/mockData/adminAgentVerification";

const selectClass =
  "h-9 min-w-[120px] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white sm:min-w-[132px]";

function matchesSearch(row: AdminAgentVerificationListRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return row.name.toLowerCase().includes(s);
}

function statusPill(status: AgentVerificationStatus) {
  if (status === "verified") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 font-sans text-xs font-semibold text-emerald-700">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-sans text-xs font-semibold text-orange-700">
      Pending
    </span>
  );
}

type StatusFilter = "all" | AgentVerificationStatus;
type SortKey = "newest" | "oldest" | "name";

export default function AdminAgentVerificationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [loadMoreSteps, setLoadMoreSteps] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filteredSorted = useMemo(() => {
    let list = adminAgentVerificationList.filter((row) => {
      if (!matchesSearch(row, searchApplied)) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "oldest") return a.submittedAtSort - b.submittedAtSort;
      return b.submittedAtSort - a.submittedAtSort;
    });
    return list;
  }, [searchApplied, statusFilter, sortBy]);

  const visibleCount = 8 + loadMoreSteps * 4;
  const visibleRows = filteredSorted.slice(0, visibleCount);
  const canLoadMore = visibleRows.length < filteredSorted.length;

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        Agent Verification
      </h2>

      <div className="flex w-full items-center gap-2 sm:max-w-[520px]">
        <div className="flex h-[44px] min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e4e4e4] bg-white pl-4 pr-3">
          <Search size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              if (!v.trim()) {
                setLoadMoreSteps(0);
                setSearchApplied("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setLoadMoreSteps(0);
                setSearchApplied(query);
              }
            }}
            placeholder="Search agent by name"
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-brand-text-primary outline-none placeholder:text-brand-text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setLoadMoreSteps(0);
            setSearchApplied(query);
          }}
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
            value={statusFilter}
            onChange={(e) => {
              setLoadMoreSteps(0);
              setStatusFilter(e.target.value as StatusFilter);
            }}
            className={selectClass}
            aria-label="Status"
          >
            <option value="all">Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
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
            value={sortBy}
            onChange={(e) => {
              setLoadMoreSteps(0);
              setSortBy(e.target.value as SortKey);
            }}
            className={selectClass}
            aria-label="Sort by"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
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
            <div className="grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5.5rem,0.75fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_3rem] gap-3 px-5 py-3.5 text-left font-sans text-sm font-semibold text-brand-text-primary">
              <span>Name</span>
              <span>Phone number</span>
              <span>Status</span>
              <span>State</span>
              <span>LGA</span>
              <span className="sr-only">Actions</span>
            </div>
            {filteredSorted.length === 0 ? (
              <p className="px-5 py-12 text-center font-sans text-sm text-brand-text-secondary">
                No agents match your filters.
              </p>
            ) : (
              visibleRows.map((row, i) => (
                <div
                  key={row.id}
                  className={`relative grid grid-cols-[minmax(8rem,1.2fr)_minmax(8rem,1fr)_minmax(5.5rem,0.75fr)_minmax(5rem,0.65fr)_minmax(6rem,0.85fr)_3rem] items-center gap-3 px-5 py-4 text-sm ${
                    i % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
                  }`}
                >
                  <span className="truncate font-sans font-medium text-brand-text-primary">{row.name}</span>
                  <span className="truncate font-sans text-brand-text-secondary">{row.phone}</span>
                  <div className="shrink-0">{statusPill(row.status)}</div>
                  <span className="truncate font-sans text-brand-text-secondary">{row.state}</span>
                  <span className="truncate font-sans text-brand-text-secondary">{row.lga}</span>
                  <div className="relative flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMenuId((v) => (v === row.id ? null : row.id))}
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
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-sans text-sm font-normal text-[#0f172a] transition hover:bg-[#f8fafc]"
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/agent-verification/${encodeURIComponent(row.id)}`);
                          }}
                        >
                          <List size={18} strokeWidth={1.65} className="shrink-0 text-[#0f172a]" />
                          View details
                        </button>
                        <div className="h-px bg-[#e8e8e8]" />
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-sans text-sm font-normal text-[#0f172a] transition hover:bg-[#f8fafc]"
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/agent-verification/${encodeURIComponent(row.id)}`);
                          }}
                        >
                          <BadgeCheck size={18} strokeWidth={1.65} className="shrink-0 text-[#0f172a]" />
                          Approve
                        </button>
                        <div className="h-px bg-[#e8e8e8]" />
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-sans text-sm font-normal text-[#0f172a] transition hover:bg-[#f8fafc]"
                          onClick={() => {
                            setMenuId(null);
                            navigate(`/agent-verification/${encodeURIComponent(row.id)}`);
                          }}
                        >
                          <CircleX size={18} strokeWidth={1.65} className="shrink-0 text-[#0f172a]" />
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
      </div>

      {filteredSorted.length > 0 && canLoadMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setLoadMoreSteps((s) => s + 1)}
            className="rounded-full border border-[#e4e4e4] bg-white px-8 py-2.5 font-sans text-sm font-semibold text-brand-text-primary shadow-sm transition hover:bg-[#fafafa]"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
