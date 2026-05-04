import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, CreditCard, LayoutGrid, List, MoreVertical, RefreshCw, Search, Share2 } from "lucide-react";
import { AgentBottomNav } from "./AgentHome";
import AgentDesktopShell from "../../components/agent/AgentDesktopShell";
import { useAgentFarmersSync } from "../../hooks/useAgentFarmersSync";
import AgentStatusPanel from "../../components/agent/AgentStatusPanel";
import AgentFormFeedback from "../../components/agent/AgentFormFeedback";
import { getAgentSession } from "../../services/cropexApi";

function FilterPill({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-brand-border rounded-full py-2 pl-4 pr-9 text-xs font-sans text-brand-text-primary md:h-[36px] md:border-[#E6E6E6]"
      >
        {options.map((opt) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
    </div>
  );
}

function FarmerCard({ farmer, onView, onSyncFarmer }) {
  return (
    <div className="relative w-full rounded-[10px] bg-[#FFFFFF] px-[12px] py-3">
      {farmer.status === "pending" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSyncFarmer(farmer.id);
          }}
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors active:scale-[0.98]"
        >
          <RefreshCw size={10} className="text-brand-amber" />
          <span className="text-[10px] font-sans font-semibold text-brand-amber">Sync now</span>
        </button>
      )}
      <div className="mb-1.5 h-[61px] w-[61px] overflow-hidden rounded-[11px]">
        <img src={farmer.photo} alt={farmer.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-h-0 space-y-2">
        <p className="truncate font-sans text-[10px] leading-[12px] text-brand-text-primary"><span className="text-brand-text-muted">Name : </span>{farmer.name}</p>
        <p className="truncate font-sans text-[10px] leading-[12px] text-brand-text-primary"><span className="text-brand-text-muted">ID : </span>{farmer.id}</p>
        <p className="font-sans text-[10px] leading-[12px] text-brand-text-primary"><span className="text-brand-text-muted">Reg date: </span>{farmer.regDate}</p>
        <p className="font-sans text-[10px] leading-[12px] font-semibold">
          <span className="text-brand-text-muted font-normal">Status : </span>
          <span className={farmer.status === "synced" ? "text-brand-green" : "text-brand-amber"}>
            {farmer.status === "synced" ? "Synced" : "Sync pending"}
          </span>
        </p>
      </div>
      <button
        onClick={onView}
        className="mt-2 h-[29px] w-full rounded-[8px] bg-brand-green py-0 font-sans text-[10px] font-medium leading-[12px] text-white"
      >
        View Details
      </button>
    </div>
  );
}

function FarmersGrid({ farmers, onSelect, onSyncFarmer }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-5 md:gap-[10px] md:px-0">
      {farmers.map((f) => (
        <FarmerCard key={f.id} farmer={f} onView={() => onSelect(f)} onSyncFarmer={onSyncFarmer} />
      ))}
      {farmers.length === 0 && (
        <div className="col-span-2 py-10 text-center font-sans text-sm text-brand-text-muted md:col-span-5">
          No farmers found
        </div>
      )}
    </div>
  );
}

function DesktopFarmersTable({ farmers, onSelect, visibleCount, onLoadMore }) {
  const visibleRows = farmers.slice(0, visibleCount);
  const hasMore = visibleCount < farmers.length;

  return (
    <div className="hidden md:block">
      <div className="mb-2 grid grid-cols-[1.15fr_1fr_0.8fr_0.7fr_0.5fr_34px] px-3 text-[14px] font-medium text-[#111827]">
        <span>Name</span>
        <span>Farmer ID</span>
        <span>Reg date</span>
        <span>Status</span>
        <span>Gender</span>
        <span />
      </div>
      <div className="space-y-2">
        {visibleRows.map((farmer) => (
          <button
            key={`${farmer.id}-row`}
            type="button"
            onClick={() => onSelect(farmer)}
            className="grid h-[42px] w-full grid-cols-[1.15fr_1fr_0.8fr_0.7fr_0.5fr_34px] items-center rounded-[6px] bg-[#F1F1F1] px-3 text-left text-[13px] text-[#111827]"
          >
            <span className="truncate">{farmer.name}</span>
            <span className="truncate">{farmer.id}</span>
            <span>{farmer.regDate}</span>
            <span className={farmer.status === "synced" ? "font-medium text-brand-green" : "font-medium text-brand-amber"}>
              {farmer.status === "synced" ? "Synced" : "Pending"}
            </span>
            <span>{farmer.gender || "Male"}</span>
            <span className="flex justify-center">
              <MoreVertical size={16} />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={!hasMore}
          className="h-[40px] min-w-[130px] rounded-[16px] bg-white px-7 text-[14px] font-medium text-brand-green disabled:opacity-55"
        >
          Load more
        </button>
      </div>
    </div>
  );
}

function ListScreen({
  farmers,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onOpenSearch,
  onSelect,
  onSyncFarmer,
  onSyncAll,
  syncing,
  completedCount,
  pendingCount,
  listError,
}) {
  const [desktopViewMode, setDesktopViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(7);

  const listData = useMemo(() => {
    let arr = [...farmers];
    if (statusFilter !== "all") arr = arr.filter((f) => f.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((f) => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q));
    }
    if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "date-desc") arr.sort((a, b) => b.regDate.localeCompare(a.regDate));
    if (sortBy === "date-asc") arr.sort((a, b) => a.regDate.localeCompare(b.regDate));
    return arr;
  }, [farmers, query, statusFilter, sortBy]);

  useEffect(() => {
    setVisibleCount(7);
  }, [query, statusFilter, sortBy, farmers.length]);

  const HeaderBlock = () => (
    <>
      {listError && (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 font-sans text-xs text-red-800">
          Could not refresh list: {listError}
        </div>
      )}
      <h1 className="mb-1 font-display text-2xl font-bold text-brand-text-primary md:text-[40px] md:leading-[48px]">
        Registered Farmers
      </h1>
      <p className="mb-4 font-sans text-sm text-brand-text-secondary md:text-[14px]">
        View all registered farmers and their sync status.
      </p>
      <div className="mb-4 flex items-center justify-between md:mb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-brand-green flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">✓</span>
            </div>
            <span className="font-sans text-xs font-semibold text-brand-text-primary">{completedCount} Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-brand-amber" />
            <span className="font-sans text-xs font-semibold text-brand-text-primary">{pendingCount} Pending</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSyncAll}
          disabled={syncing || pendingCount === 0}
          className="flex items-center gap-1.5 rounded-xl bg-brand-green px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 md:h-[35px] md:rounded-[44px] md:px-[14px] md:py-0 md:text-[13px]"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} /> Sync now
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2 md:mb-5">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-brand-border bg-white px-3 md:h-[52px] md:rounded-[15px] md:border-[#E6E6E6]">
          <Search size={16} className="text-brand-text-muted" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search farmer by name, farmer ID...." className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-brand-text-muted md:py-0" />
        </div>
        <button onClick={onOpenSearch} className="rounded-2xl bg-brand-green px-4 py-3 font-sans text-sm font-semibold text-white md:h-[47px] md:rounded-[15px] md:px-6 md:py-0">Search</button>
      </div>
      <div className="mb-4 flex gap-2 md:mb-5 md:hidden">
        <FilterPill value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "Status" }, { value: "synced", label: "Synced" }, { value: "pending", label: "Sync pending" }]} />
        <FilterPill value={sortBy} onChange={setSortBy} options={[{ value: "date-desc", label: "Sort by" }, { value: "date-desc", label: "Newest" }, { value: "date-asc", label: "Oldest" }, { value: "name", label: "Name" }]} />
      </div>
      <div className="mb-5 hidden items-center gap-2 md:flex">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[32px] w-[95px] appearance-none rounded-[10px] border border-[#E6E6E6] bg-white pl-3 pr-8 text-[14px] text-[#737373]"
          >
            <option value="all">Status</option>
            <option value="synced">Synced</option>
            <option value="pending">Sync pending</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#111827]" />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-[32px] w-[95px] appearance-none rounded-[10px] border border-[#E6E6E6] bg-white pl-3 pr-8 text-[14px] text-[#737373]"
          >
            <option value="date-desc">Sort by</option>
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#111827]" />
        </div>
        <div className="relative">
          <select
            value={desktopViewMode}
            onChange={(e) => setDesktopViewMode(e.target.value)}
            className="h-[32px] w-[150px] appearance-none rounded-[10px] border border-[#E6E6E6] bg-white pl-3 pr-8 text-[14px] text-[#737373]"
            aria-label="View mode"
          >
            <option value="grid">View Grid</option>
            <option value="list">View List</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center gap-1 text-[#374151]">
            {desktopViewMode === "list" ? <List size={14} /> : <LayoutGrid size={14} />}
            <ChevronDown size={14} className="text-[#111827]" />
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="min-h-dvh bg-brand-bg-page md:hidden">
        <div className="w-full">
          <div className="flex flex-col pb-28 overflow-y-auto scrollbar-hide">
            <div className="px-4 pt-5">
              <HeaderBlock />
            </div>
            <FarmersGrid farmers={listData} onSelect={onSelect} onSyncFarmer={onSyncFarmer} />
          </div>
        </div>
        <AgentBottomNav />
      </div>

      <AgentDesktopShell active="farmers">
        <div className="min-w-full">
          <HeaderBlock />
          {desktopViewMode === "list" ? (
            <DesktopFarmersTable
              farmers={listData}
              onSelect={onSelect}
              visibleCount={visibleCount}
              onLoadMore={() => setVisibleCount((c) => c + 5)}
            />
          ) : (
            <FarmersGrid farmers={listData} onSelect={onSelect} onSyncFarmer={onSyncFarmer} />
          )}
        </div>
      </AgentDesktopShell>
    </>
  );
}

function SearchScreen({
  farmers,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  onBack,
  onSelect,
  onSyncFarmer,
  onSearch,
  searching,
  searchError,
}) {
  const results = useMemo(() => {
    let arr = [...farmers];
    if (statusFilter !== "all") arr = arr.filter((f) => f.status === statusFilter);
    return arr;
  }, [farmers, statusFilter]);

  const SearchContent = () => (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary mb-5"><ArrowLeft size={18} /><span className="font-sans text-sm">Go back</span></button>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-brand-text-primary mb-4">Search Farmers</h1>
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <div className="flex-1 flex items-center bg-white border border-brand-border rounded-2xl px-3 gap-2">
          <Search size={16} className="text-brand-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onSearch();
              }
            }}
            placeholder="Search farmer by name, farmer ID...."
            className="flex-1 py-3 bg-transparent text-sm focus:outline-none placeholder:text-brand-text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => void onSearch()}
          disabled={searching}
          className="px-4 py-3 bg-brand-green rounded-2xl text-white font-sans text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>
      {searchError && (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 font-sans text-xs text-red-800">
          Could not run search: {searchError}
        </div>
      )}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <FilterPill value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "Status" }, { value: "synced", label: "Synced" }, { value: "pending", label: "Sync pending" }]} />
        <span className="font-sans text-xs text-brand-text-secondary">Search Result ({results.length})</span>
      </div>
      <FarmersGrid farmers={results} onSelect={onSelect} onSyncFarmer={onSyncFarmer} />
    </>
  );

  return (
    <>
      <div className="min-h-dvh bg-brand-bg-page md:hidden">
        <div className="flex-1 pb-28 overflow-y-auto scrollbar-hide px-4 pt-5">
          <SearchContent />
        </div>
        <AgentBottomNav />
      </div>
      <AgentDesktopShell active="farmers">
        <div className="min-w-full">
          <SearchContent />
        </div>
      </AgentDesktopShell>
    </>
  );
}

function Section({ title, rows }) {
  return (
    <div className="mb-5">
      <p className="font-sans text-xs text-brand-text-muted uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <p key={label} className="font-sans text-sm text-brand-text-primary">{label} : <span className="font-semibold">{value || "—"}</span></p>
        ))}
      </div>
    </div>
  );
}

function tabBtnClass(active) {
  return `flex-1 min-w-[120px] py-2.5 px-4 rounded-full text-sm font-sans font-semibold transition-all border-2 ${
    active
      ? "bg-brand-green text-white border-brand-green shadow-sm"
      : "bg-white text-brand-text-primary border-brand-border hover:border-brand-green/40 hover:bg-brand-green/5"
  }`;
}

function DetailScreen({ farmer, onBack, onSyncFarmer, syncing }) {
  const [tab, setTab] = useState("details");
  const display = { ...farmer };
  const canViewId = !farmer.offline || farmer.hasOfficialId;
  const session = getAgentSession();
  const agentName = session?.fullName || session?.full_name || "Assigned agent";

  const shareId = () => {
    const msg = `Farmer ID: *${display.id}*\nName: ${display.name}\nVerify: https://cropex.hashmarcropex.com/verify/${display.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const pending = farmer.status === "pending";

  const content = (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary mb-4">
        <ArrowLeft size={18} />
        <span className="font-sans text-sm">Go back</span>
      </button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-brand-text-primary mb-0.5">Farmer details</h1>
          <p className="font-sans text-xs text-brand-text-secondary">{display.id}</p>
        </div>
        <button
          type="button"
          onClick={() => onSyncFarmer(farmer.id)}
          disabled={!pending || syncing}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green text-white text-xs font-semibold shrink-0 disabled:opacity-45 disabled:cursor-not-allowed self-start"
        >
          <RefreshCw size={12} className={syncing && pending ? "animate-spin" : ""} />
          {pending ? "Sync now" : "Synced"}
        </button>
      </div>

      <div className="rounded-full bg-gray-100 p-1 mb-4 flex flex-wrap gap-1 md:inline-flex md:max-w-md w-full">
        <button type="button" onClick={() => setTab("details")} className={tabBtnClass(tab === "details")}>
          Details
        </button>
        {canViewId && (
          <button type="button" onClick={() => setTab("id")} className={tabBtnClass(tab === "id")}>
            ID
          </button>
        )}
      </div>

      {tab === "details" ? (
        <>
          {canViewId ? (
            <button
              type="button"
              onClick={() => setTab("id")}
              className="w-full md:max-w-md mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-brand-border bg-white hover:border-brand-green hover:bg-brand-green/5 transition-colors text-left shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center shrink-0">
                <CreditCard className="text-brand-green" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-sm text-brand-text-primary">View digital ID card</p>
                <p className="font-sans text-xs text-brand-text-secondary">Tap to see the farmer&apos;s official ID</p>
              </div>
              <span className="text-brand-text-muted text-sm font-semibold shrink-0">&gt;</span>
            </button>
          ) : (
            <div className="w-full md:max-w-md mb-6 rounded-2xl border border-brand-border bg-white px-4 py-3.5 text-left shadow-sm">
              <p className="font-sans font-semibold text-sm text-brand-text-primary">Digital ID pending sync</p>
              <p className="font-sans text-xs text-brand-text-secondary mt-1">
                This farmer will receive an official ID after the record is synced to the server.
              </p>
            </div>
          )}
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <Section title="Online synchronization" rows={[["Status", farmer.status === "synced" ? "Synced" : "Sync pending"]]} />
              <Section title="Biometric Information" rows={[["Face", display.biometric?.face ? "Captured" : "Not captured"], ["Fingerprint", display.biometric?.fingerprint ? "Captured" : "Not captured"]]} />
              <Section title="Personal Information" rows={[["Full Name", display.name], ["Phone", display.phone], ["Gender", display.gender], ["State", display.state], ["LGA", display.lga], ["Address", display.address], ["NIN", display.nin]]} />
            </div>
            <div>
              <Section title="Farm Information" rows={[["Primary Crop", display.primaryCrop], ["Farm Size", display.farmSize], ["Land Ownership", display.landOwnership], ["Reg date", display.regDate]]} />
              <Section title="Cooperative & Association" rows={[["Name", display.cooperative], ["Agent", agentName]]} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-brand-green rounded-3xl p-5 md:p-8 flex flex-col items-center text-white md:max-w-xl">
            <div className="self-start mb-4">
              <img src="/brand/HFEI_Primary_Logo_White.png" alt="HFEI by Hashmar Cropex Ltd" className="h-8 w-auto object-contain" draggable="false" />
            </div>
            <img src={display.photo} alt={display.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 mb-3" />
            <div className="text-center mb-2">
              <p className="text-white/60 text-xs">Full Name</p>
              <p className="font-display font-bold text-base">{display.name}</p>
            </div>
            <div className="text-center mb-2">
              <p className="text-white/60 text-xs">Farmer ID</p>
              <p className="font-display font-bold text-sm tracking-widest">{display.id}</p>
            </div>
            <div className="text-center mb-4">
              <p className="text-white/60 text-xs">Cooperative name</p>
              <p className="font-display font-bold text-sm">{display.cooperative}</p>
            </div>
            <div className="w-full h-px bg-white/20 mb-3" />
            <div className="grid grid-cols-2 gap-4 w-full mb-3">
              <div>
                <p className="text-white/60 text-xs">Agent name</p>
                <p className="font-sans font-semibold text-sm">{agentName}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Agent signature</p>
                <p className="font-sans italic text-sm text-white/80">Hashmar</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 w-full">
              <div className="text-center">
                <p className="text-white/60 text-xs">Issue date</p>
                <p className="font-display font-bold text-sm">20/04/2026</p>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <p className="text-white/60 text-xs">Expiry date</p>
                <p className="font-display font-bold text-sm">20/04/2027</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              type="button"
              onClick={shareId}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-3xl border-2 border-brand-green text-brand-green font-display font-semibold text-sm hover:bg-brand-green/5 transition-colors"
            >
              <Share2 size={15} /> Share ID
            </button>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <div className="min-h-dvh bg-brand-bg-page md:hidden">
        <div className="flex-1 px-4 pt-5 pb-28 overflow-y-auto scrollbar-hide">{content}</div>
      </div>
      <AgentDesktopShell active="farmers">
        <div className="min-w-full">{content}</div>
      </AgentDesktopShell>
      <div className="md:hidden">
        <AgentBottomNav />
      </div>
    </>
  );
}

export default function AgentSavedFarmers() {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [lastRootView, setLastRootView] = useState("list");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { farmers, syncing, syncMessage, listError, syncFarmer, syncAllPending, searchFarmersByQuery, counts } =
    useAgentFarmersSync();

  useEffect(() => {
    if (view !== "search") return;
    setSearchResults(farmers);
  }, [farmers, view]);

  const runSearch = async () => {
    setSearching(true);
    setSearchError("");
    try {
      const results = await searchFarmersByQuery(query);
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
      setSearchError(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const openDetail = (farmer) => {
    setSelectedId(farmer.clientId || farmer.id);
    setLastRootView(view === "detail" ? "list" : view);
    setView("detail");
  };

  const selectedFarmer = selectedId
    ? farmers.find((farmer) =>
        [farmer.clientId, farmer.id, farmer.officialFarmerId].filter(Boolean).includes(selectedId)
      )
    : null;

  const toast = syncMessage && (
    <div
      role="status"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl bg-white border border-brand-border shadow-lg max-w-[min(90vw,20rem)]"
    >
      <AgentFormFeedback variant="success">{syncMessage}</AgentFormFeedback>
    </div>
  );

  const syncOverlay = syncing && (
    <div className="fixed inset-0 z-[95] bg-black/25 flex items-center justify-center p-4" aria-live="polite">
      <div className="bg-white rounded-2xl border border-brand-border shadow-xl max-w-xs w-full">
        <AgentStatusPanel variant="sync-loading" />
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <>
        {syncOverlay}
        {toast}
        <ListScreen
          farmers={farmers}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenSearch={() => setView("search")}
          onSelect={openDetail}
          onSyncFarmer={syncFarmer}
          onSyncAll={syncAllPending}
          syncing={syncing}
          completedCount={counts.completed}
          pendingCount={counts.pending}
          listError={listError}
        />
      </>
    );
  }
  if (view === "search") {
    return (
      <>
        {syncOverlay}
        {toast}
        <SearchScreen
          farmers={searchResults}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onBack={() => setView("list")}
          onSelect={openDetail}
          onSyncFarmer={syncFarmer}
          onSearch={runSearch}
          searching={searching}
          searchError={searchError}
        />
      </>
    );
  }
  if (view === "detail" && selectedFarmer) {
    return (
      <>
        {syncOverlay}
        {toast}
        <DetailScreen
          farmer={selectedFarmer}
          onBack={() => setView(lastRootView)}
          onSyncFarmer={async (id) => {
            const syncedFarmer = await syncFarmer(id);
            if (syncedFarmer) {
              setSelectedId(syncedFarmer.clientId || syncedFarmer.id);
            }
            return syncedFarmer;
          }}
          syncing={syncing}
        />
      </>
    );
  }
  return null;
}

