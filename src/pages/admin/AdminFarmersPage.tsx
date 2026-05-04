import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, MoreVertical, Search } from "lucide-react";
import { listFarmers, type AdminFarmerRow } from "@/lib/adminApi";

const selectClass =
  "h-9 min-w-[120px] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-2 pr-8 font-sans text-sm text-brand-text-secondary outline-none transition hover:bg-white/70 focus:border-[#e4e4e4] focus:bg-white sm:min-w-[132px]";

function matchesSearch(row: AdminFarmerRow, q: string) {
  if (!q.trim()) return true;
  const search = q.trim().toLowerCase();
  return row.name.toLowerCase().includes(search) || row.farmerId.toLowerCase().includes(search);
}

export default function AdminFarmersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [stateFilter, setStateFilter] = useState("All states");
  const [cropFilter, setCropFilter] = useState("All crops");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminFarmerRow[]>([]);
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
    listFarmers()
      .then((payload) => {
        if (active) setRows(payload);
      })
      .catch((fetchError) => {
        if (active) {
          setRows([]);
          setError(fetchError instanceof Error ? fetchError.message : "Could not load farmers.");
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
    () => ["All states", ...Array.from(new Set(rows.map((row) => row.state).filter((state) => state && state !== "-")))],
    [rows],
  );

  const cropOptions = useMemo(
    () => ["All crops", ...Array.from(new Set(rows.map((row) => row.crop).filter((crop) => crop && crop !== "-")))],
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (!matchesSearch(row, searchApplied)) return false;
        if (cropFilter !== "All crops" && row.crop !== cropFilter) return false;
        if (stateFilter !== "All states" && row.state !== stateFilter) return false;
        return true;
      }),
    [rows, searchApplied, cropFilter, stateFilter],
  );

  return (
    <div className="w-full space-y-5 pb-4">
      <h2 className="font-display text-[20px] font-bold leading-7 text-brand-text-primary">
        Farmer Management
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
            placeholder="Search farmer by name, farmer ID..."
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
            value={cropFilter}
            onChange={(event) => setCropFilter(event.target.value)}
            className={selectClass}
            aria-label="Crop"
          >
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>
                {crop === "All crops" ? "Crop" : crop}
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
            {stateOptions.map((stateOption) => (
              <option key={stateOption} value={stateOption}>
                {stateOption === "All states" ? "State" : stateOption}
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
        <div className="grid min-w-[760px] grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] gap-2 px-4 py-3 text-left font-sans text-sm font-semibold text-brand-text-primary">
          <span>Name</span>
          <span>Farmer ID</span>
          <span>Reg date</span>
          <span>State</span>
          <span>LGA</span>
          <span className="text-center" aria-hidden>
            ·
          </span>
        </div>
        {filteredRows.length === 0 ? (
          <p className="px-4 py-10 text-center font-sans text-sm text-brand-text-secondary">
            {loading ? "Loading farmers..." : "No farmers match your filters."}
          </p>
        ) : (
          filteredRows.map((row, index) => (
            <div
              key={row.farmerId}
              className={`relative grid min-w-[760px] grid-cols-[1.1fr_1.15fr_0.9fr_0.75fr_0.85fr_2.5rem] items-center gap-2 px-4 py-3.5 text-sm ${
                index % 2 === 1 ? "bg-[#F6F6F6]" : "bg-transparent"
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
                  onClick={() => setMenuId((value) => (value === row.farmerId ? null : row.farmerId))}
                  className="rounded-lg p-1.5 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                  aria-label={`Actions for ${row.name}`}
                >
                  <MoreVertical size={18} strokeWidth={1.8} />
                </button>
                {menuId === row.farmerId ? (
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
