import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, List, MoreVertical, Search } from "lucide-react";
import {
  adminIssuesList,
  adminIssueStatusOptions,
  getMergedIssueStatus,
  markReportedIssueResolved,
  type AdminIssueRow,
  type AdminIssueStatus,
} from "@/mockData/adminReportedIssues";

function matchesSearch(row: AdminIssueRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    row.subject.toLowerCase().includes(s) ||
    row.reporter.toLowerCase().includes(s) ||
    row.id.toLowerCase().includes(s)
  );
}

export default function AdminReportedIssuesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [status, setStatus] = useState<(typeof adminIssueStatusOptions)[number]>("All");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [statusTick, setStatusTick] = useReducer((x: number) => x + 1, 0);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const rows = useMemo(() => {
    return adminIssuesList
      .map((row) => ({ ...row, status: getMergedIssueStatus(row.id, row.status) }))
      .filter((row) => {
        if (!matchesSearch(row, searchApplied)) return false;
        if (status !== "All" && row.status !== (status as AdminIssueStatus)) return false;
        return true;
      });
  }, [searchApplied, status, statusTick]);

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e4e4e4] bg-white px-4 py-2.5 shadow-sm">
          <Search size={20} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
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
            placeholder="Search by subject, reporter, issue ID..."
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-brand-text-primary outline-none placeholder:text-brand-text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => setSearchApplied(query)}
          className="h-[52px] shrink-0 rounded-full bg-[#03624D] px-8 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
        >
          Search
        </button>
      </div>

      <label className="flex max-w-xs flex-col gap-1.5 font-sans text-xs font-medium text-brand-text-muted">
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-11 rounded-xl border border-[#e4e4e4] bg-white px-3 font-sans text-sm text-brand-text-primary outline-none focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D]"
        >
          {adminIssueStatusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <h2 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
        Reported Issues
      </h2>

      <div ref={tableRef} className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white">
        <div className="grid grid-cols-[0.9fr_1.4fr_0.9fr_0.85fr_0.85fr_2.5rem] gap-2 border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
          <span>ID</span>
          <span>Subject</span>
          <span>Reporter</span>
          <span>Category</span>
          <span>Status</span>
          <span className="text-center" aria-hidden>
            ·
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            No issues match your filters.
          </p>
        ) : (
          rows.map((row, i) => (
            <div
              key={row.id}
              className={`relative grid grid-cols-[0.9fr_1.4fr_0.9fr_0.85fr_0.85fr_2.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
              }`}
            >
              <span className="truncate font-mono text-xs text-brand-text-secondary">{row.id}</span>
              <span className="truncate font-medium text-brand-text-primary">{row.subject}</span>
              <span className="truncate text-brand-text-secondary">{row.reporter}</span>
              <span className="truncate text-brand-text-secondary">{row.category}</span>
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
                  onClick={() => setMenuId((v) => (v === row.id ? null : row.id))}
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
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-brand-text-primary">
                        <List size={18} strokeWidth={1.8} />
                      </span>
                      View details
                    </button>
                    <div className="mx-3 border-t border-[#e4e4e4]" />
                    <button
                      type="button"
                      disabled={row.status === "Resolved"}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left font-sans text-sm font-medium text-brand-text-primary hover:bg-[#f6f6f6] disabled:cursor-not-allowed disabled:opacity-45"
                      onClick={() => {
                        setMenuId(null);
                        markReportedIssueResolved(row.id);
                        setStatusTick();
                      }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-brand-text-primary">
                        <BadgeCheck size={18} strokeWidth={1.8} />
                      </span>
                      Mark as resolved
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
