import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Search } from "lucide-react";
import { getAdminAgentDetail, getAgentEnrolledFarmers, type AdminAgentEnrolledFarmerRow } from "@/mockData/adminAgents";

function matchesSearch(row: AdminAgentEnrolledFarmerRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    row.name.toLowerCase().includes(s) ||
    row.farmerId.toLowerCase().includes(s)
  );
}

export default function AdminAgentEnrolledFarmersPage() {
  const { agentId = "" } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(agentId);
  const agent = getAdminAgentDetail(id);
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
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

  const allRows = useMemo(() => (agent ? getAgentEnrolledFarmers(agent.agentId) : []), [agent]);

  const filtered = useMemo(
    () => allRows.filter((row) => matchesSearch(row, searchApplied)),
    [allRows, searchApplied],
  );

  const visibleCount = 7 + loadMoreSteps * 4;
  const visibleRows = filtered.slice(0, visibleCount);
  const canLoadMore = visibleRows.length < filtered.length;

  if (!agent) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Agent not found.</p>
          <button
            type="button"
            onClick={() => navigate("/agents")}
            className="mt-4 font-sans text-[15px] font-semibold text-[#03624D] hover:underline"
          >
            Back to Agent Management
          </button>
        </div>
      </div>
    );
  }

  const back = `/agents/${encodeURIComponent(agent.agentId)}`;

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        <button
          type="button"
          onClick={() => navigate(back)}
          className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
          aria-label="Back to Agent Details"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        Enrolled Farmers
      </h2>

      <div className="flex min-h-[52px] w-full items-stretch overflow-hidden rounded-full border border-[#e4e4e4] bg-white shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-4 pr-2">
          <Search size={20} className="shrink-0 text-brand-text-muted" strokeWidth={1.8} />
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
          className="m-1 shrink-0 self-center rounded-full bg-[#03624D] px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
        >
          Search
        </button>
      </div>

      <div ref={tableRef} className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white">
        <div className="grid grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] gap-2 border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
          <span>Name</span>
          <span>Farmer ID</span>
          <span>Reg date</span>
          <span>State</span>
          <span>LGA</span>
          <span className="sr-only">Actions</span>
        </div>
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            No enrolled farmers match your search.
          </p>
        ) : (
          visibleRows.map((row, i) => (
            <div
              key={row.id}
              className={`relative grid grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
              }`}
            >
              <span className="truncate font-medium text-brand-text-primary">{row.name}</span>
              <span className="truncate text-brand-text-secondary">{row.farmerId}</span>
              <span className="truncate text-brand-text-secondary">{row.regDate}</span>
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
                  <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-[#e4e4e4] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-4 py-2.5 text-left font-sans text-sm text-brand-text-primary hover:bg-[#f6f6f6]"
                      onClick={() => {
                        setMenuId(null);
                        navigate(`/farmers/${encodeURIComponent(row.farmerId)}`);
                      }}
                    >
                      View farmer details
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && canLoadMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setLoadMoreSteps((s) => s + 1)}
            className="rounded-full border border-[#e4e4e4] bg-white px-8 py-2.5 font-sans text-sm font-semibold text-[#03624D] shadow-sm transition hover:bg-[#f6faf8]"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
