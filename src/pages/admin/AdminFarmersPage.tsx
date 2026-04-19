import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, MoreVertical, Search } from "lucide-react";
import {
  adminFarmerCropOptions,
  adminFarmersList,
  type AdminFarmerListRow,
} from "@/mockData/adminFarmers";
import { useNigeriaStateLga } from "@/hooks/useNigeriaStateLga";

const selectClass =
  "h-11 min-w-[140px] cursor-pointer rounded-xl border border-[#e4e4e4] bg-white px-3 font-sans text-sm text-brand-text-primary outline-none focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D] sm:min-w-[160px]";

function matchesSearch(row: AdminFarmerListRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return row.name.toLowerCase().includes(s) || row.farmerId.toLowerCase().includes(s);
}

type CropFilter = (typeof adminFarmerCropOptions)[number];

export default function AdminFarmersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [crop, setCrop] = useState<CropFilter>("All crops");
  const [state, setState] = useState("All states");
  const [menuId, setMenuId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { states } = useNigeriaStateLga();

  const stateOptions = useMemo(() => ["All states", ...states], [states]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const rows = useMemo(() => {
    return adminFarmersList.filter((row) => {
      if (!matchesSearch(row, searchApplied)) return false;
      if (crop !== "All crops" && row.crop !== crop) return false;
      if (state !== "All states" && row.state !== state) return false;
      return true;
    });
  }, [searchApplied, crop, state]);

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        Farmer Management
      </h2>

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
            placeholder="Search farmer by name, farmer ID...."
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
          value={crop}
          onChange={(e) => setCrop(e.target.value as CropFilter)}
          className={selectClass}
          aria-label="Crop"
        >
          <option value="All crops">Crop</option>
          {adminFarmerCropOptions.filter((c) => c !== "All crops").map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={selectClass}
          aria-label="State"
        >
          {stateOptions.map((s) => (
            <option key={s} value={s}>
              {s === "All states" ? "State" : s}
            </option>
          ))}
        </select>
      </div>

      <div ref={tableRef} className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white">
        <div className="grid grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] gap-2 border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
          <span>Name</span>
          <span>Farmer ID</span>
          <span>Reg date</span>
          <span>State</span>
          <span>LGA</span>
          <span className="text-center" aria-hidden>
            ·
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            No farmers match your filters.
          </p>
        ) : (
          rows.map((row, i) => (
            <div
              key={row.id}
              className={`relative grid grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3.5 text-sm last:border-b-0 ${
                i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => navigate(`/farmers/${encodeURIComponent(row.farmerId)}`)}
                className="truncate text-left font-medium text-brand-text-primary hover:underline"
              >
                {row.name}
              </button>
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
                  <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-[#e4e4e4] bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-4 py-2.5 text-left font-sans text-sm text-brand-text-primary hover:bg-[#f6f6f6]"
                      onClick={() => {
                        setMenuId(null);
                        navigate(`/farmers/${encodeURIComponent(row.farmerId)}`);
                      }}
                    >
                      View farmer
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
