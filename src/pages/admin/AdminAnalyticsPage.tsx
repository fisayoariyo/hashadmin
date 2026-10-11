import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart2,
  ChevronLeft,
  Download,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  getReportFarmerLocations,
  getReportFarmerOverview,
  getReportTopAgents,
  getReportTrend,
  type AgentPerformance,
  type FarmerOverviewReport,
  type LocationReport,
  type TrendReport,
} from "@/lib/adminApi";
import AdminStatCard from "@/components/admin/AdminStatCard";
import userArrowLeftRightIcon from "@/assets/icons/admin-dashboard/user-arrow-left-right.svg";
import tractorIcon from "@/assets/icons/admin-dashboard/tractor.svg";

// ─── Palette ──────────────────────────────────────────────────────────────────
const BRAND_GREEN = "#03624D";
const BAR_COLORS = ["#03624D", "#0a8a6a", "#23c99a", "#5be3c0", "#a8f0de", "#d4f9f0"];

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

/** Round up to nearest clean step for uniform Y-axis ticks */
function niceMax(raw: number, step: number) {
  return Math.ceil(raw / step) * step || step;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
  action,
  id,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] px-6 py-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#03624D]">{icon}</span>}
          <h3 className="font-display text-[17px] font-bold text-brand-text-primary">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ─── Sub-section anchor header ────────────────────────────────────────────────
function SectionLabel({ label, id }: { label: string; id: string }) {
  return (
    <div id={id} className="flex items-center gap-3 pt-2">
      <span className="font-display text-[13px] font-semibold uppercase tracking-widest text-brand-text-muted">
        {label}
      </span>
      <div className="flex-1 border-t border-[#e8e8e8]" />
    </div>
  );
}

// ─── Scroll-aware underline sub-nav ──────────────────────────────────────────
const SUB_SECTIONS = [
  { id: "sec-overview", label: "Overview" },
  { id: "sec-trend", label: "Trend" },
  { id: "sec-geo", label: "Geographic" },
  { id: "sec-demo", label: "Demographics" },
];

/** Walk up the DOM to find the nearest scrollable ancestor */
function getScrollContainer(startId: string): HTMLElement | null {
  const el = document.getElementById(startId);
  if (!el) return null;
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

function SubNav() {
  const [active, setActive] = useState(SUB_SECTIONS[0].id);
  const navHeightRef = useRef(48);

  // Scroll spy — pick the last section whose label has scrolled past the top third
  useEffect(() => {
    const container = getScrollContainer(SUB_SECTIONS[0].id);
    if (!container) return;

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const cutoff = containerTop + container.clientHeight * 0.33;
      let winner = SUB_SECTIONS[0].id;
      for (const { id } of SUB_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= cutoff) winner = id;
      }
      setActive(winner);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = getScrollContainer(SUB_SECTIONS[0].id);
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const target = container.scrollTop + elRect.top - containerRect.top - navHeightRef.current - 12;
    container.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div
      ref={(node) => { if (node) navHeightRef.current = node.offsetHeight; }}
      className="sticky top-0 z-20 -mx-9 bg-[#FBFBFB] px-9 pb-0 pt-1"
    >
      <div className="flex gap-0 overflow-x-auto border-b border-[#e8e8e8]">
        {SUB_SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`relative shrink-0 px-5 pb-3 pt-2 font-sans text-sm font-semibold transition-colors ${
                isActive
                  ? "text-[#03624D]"
                  : "text-brand-text-muted hover:text-brand-text-primary"
              }`}
            >
              {s.label}
              <span
                className={`absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-[#03624D] transition-all duration-300 ${
                  isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                }`}
                style={{ transformOrigin: "left" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#f0f0f0] ${className}`} />;
}

// ─── Interval toggle ─────────────────────────────────────────────────────────
type TrendInterval = "day" | "week" | "month";
function IntervalToggle({
  value,
  onChange,
}: {
  value: TrendInterval;
  onChange: (v: TrendInterval) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[#e4e4e4] bg-[#f6f6f6]">
      {(["day", "week", "month"] as TrendInterval[]).map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
            value === o
              ? "bg-[#03624D] text-white"
              : "text-brand-text-secondary hover:bg-[#e8e8e8]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ trend }: { trend: TrendReport }) {
  const { points, interval } = trend;

  // Sparse-data guard — suggest only intervals OTHER than the current one
  if (points.length < 2) {
    const suggestions = (["day", "week", "month"] as const)
      .filter((i) => i !== interval);
    return (
      <p className="rounded-[12px] bg-[#f6f6f6] py-10 text-center font-sans text-sm text-brand-text-secondary">
        Not enough data points for the <strong>{interval}</strong> interval.{" "}
        Try switching to{" "}
        {suggestions.map((s, i) => (
          <span key={s}>
            {i > 0 && " or "}
            <strong>{s}</strong>
          </span>
        ))}.
      </p>
    );
  }

  const W = 700;
  const H = 210;
  const PAD = { top: 18, right: 28, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const rawMaxCount = Math.max(...points.map((p) => p.count), 1);
  const rawMaxCum = Math.max(...points.map((p) => p.cumulative), 1);

  // Uniform Y ticks — pick a clean step
  const step = rawMaxCount <= 10 ? 2 : rawMaxCount <= 50 ? 5 : rawMaxCount <= 200 ? 20 : 50;
  const maxCount = niceMax(rawMaxCount, step);
  const maxCum = niceMax(rawMaxCum, step * Math.ceil(rawMaxCum / rawMaxCount));

  const xOf = (i: number) =>
    PAD.left + (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2);
  const yOfCount = (v: number) => PAD.top + (1 - v / maxCount) * innerH;
  const yOfCum = (v: number) => PAD.top + (1 - v / maxCum) * innerH;

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const countPts = points.map((p, i) => ({ x: xOf(i), y: yOfCount(p.count) }));
  const cumPts = points.map((p, i) => ({ x: xOf(i), y: yOfCum(p.cumulative) }));

  // Uniform Y grid lines
  const tickCount = maxCount / step;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = i * step;
    return { y: yOfCount(val), label: fmt(val) };
  });

  // X labels: max ~7 evenly spaced, with left/right padding offset
  const maxXLabels = 7;
  const xStep = Math.max(1, Math.floor(points.length / maxXLabels));
  const xTicks = points
    .map((p, i) => ({ i, label: p.period.slice(5) }))
    .filter(({ i }) => i % xStep === 0 || i === points.length - 1);

  // Decide whether cumulative is meaningfully different from count
  const cumDistinct = points.some((p) => p.cumulative !== p.count);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320, height: "auto", maxHeight: 230 }}
        aria-label="Enrollment trend chart"
      >
        {/* Y grid + labels */}
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#e8e8e8" strokeWidth={1} />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fontSize={9} fill="#aaa">
              {t.label}
            </text>
          </g>
        ))}

        {/* X labels — offset first/last to avoid clipping */}
        {xTicks.map(({ i, label }) => {
          const x = xOf(i);
          const anchor = i === 0 ? "start" : i === points.length - 1 ? "end" : "middle";
          return (
            <text
              key={i}
              x={x}
              y={H - PAD.bottom + 16}
              textAnchor={anchor}
              fontSize={9}
              fill="#aaa"
            >
              {label}
            </text>
          );
        })}

        {/* Cumulative — only if values differ from count */}
        {cumDistinct && (
          <>
            <path
              d={`${toPath(cumPts)} L${cumPts[cumPts.length - 1].x},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`}
              fill={BRAND_GREEN}
              opacity={0.05}
            />
            <path
              d={toPath(cumPts)}
              fill="none"
              stroke={BRAND_GREEN}
              strokeWidth={1.8}
              strokeOpacity={0.45}
              strokeDasharray="6 3"
            />
          </>
        )}

        {/* Count area */}
        <path
          d={`${toPath(countPts)} L${countPts[countPts.length - 1].x},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`}
          fill={BRAND_GREEN}
          opacity={0.1}
        />
        {/* Count line */}
        <path d={toPath(countPts)} fill="none" stroke={BRAND_GREEN} strokeWidth={2.5} />
        {/* Dots */}
        {countPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={BRAND_GREEN} />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="h-[3px] w-5 rounded-full" style={{ backgroundColor: BRAND_GREEN }} />
          <span className="font-sans text-xs text-brand-text-secondary">Enrolled per period</span>
        </div>
        {cumDistinct && (
          <div className="flex items-center gap-1.5">
            <svg width={20} height={3}>
              <line
                x1={0} y1={1.5} x2={20} y2={1.5}
                stroke={BRAND_GREEN}
                strokeWidth={2}
                strokeDasharray="5 3"
                strokeOpacity={0.5}
              />
            </svg>
            <span className="font-sans text-xs text-brand-text-secondary">Cumulative total</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────
function HorizontalBars({
  data,
  colorIndex = 0,
}: {
  data: { label: string; value: number }[];
  colorIndex?: number;
}) {
  if (!data.length)
    return <p className="py-6 text-center font-sans text-sm text-brand-text-secondary">No data.</p>;

  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-right font-sans text-xs text-brand-text-secondary">
            {d.label}
          </span>
          <div className="relative flex h-[14px] flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                /* min 8px so zero-ish values stay visible */
                width: `max(8px, ${(d.value / max) * 100}%)`,
                backgroundColor: BAR_COLORS[(colorIndex + i) % BAR_COLORS.length],
              }}
            />
          </div>
          <span className="w-10 shrink-0 font-sans text-xs font-semibold text-brand-text-primary">
            {fmt(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut ring ───────────────────────────────────────────────────────────────
function DonutRing({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total)
    return <p className="py-4 text-center font-sans text-sm text-brand-text-secondary">No data.</p>;

  const R = 52;
  const CX = 64;
  const CY = 64;
  const STROKE = 22;
  const CIRC = 2 * Math.PI * R;

  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const dash = frac * CIRC;
    const seg = { ...d, frac, dash, offset, color: BAR_COLORS[i % BAR_COLORS.length] };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={128} height={128} viewBox="0 0 128 128" className="shrink-0">
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
            strokeDashoffset={-s.offset + CIRC / 4}
            strokeLinecap="butt"
          />
        ))}
        <text x={CX} y={CY - 5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#030F0F">
          {fmt(total)}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={9} fill="#888">
          total
        </text>
      </svg>
      <ul className="flex-1 space-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate font-sans text-xs text-brand-text-secondary">
              {s.label}
            </span>
            <span className="font-sans text-xs font-semibold text-brand-text-primary">
              {pct(s.value, total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Location bars ────────────────────────────────────────────────────────────
function LocationBars({
  location,
  onDrillDown,
  onBack,
}: {
  location: LocationReport;
  onDrillDown: (state: string) => void;
  onBack: () => void;
}) {
  const rows = [...location.rows].sort((a, b) => b.total - a.total).slice(0, 15);
  const max = Math.max(...rows.map((r) => r.total), 1);

  if (!rows.length)
    return (
      <p className="py-8 text-center font-sans text-sm text-brand-text-secondary">
        No location data available.
      </p>
    );

  const barW = (n: number) => `max(8px, ${(n / max) * 100}%)`;

  return (
    <div>
      {location.level === "lga" && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#03624D] hover:underline"
        >
          <ChevronLeft size={15} strokeWidth={2.2} />
          Back to states
        </button>
      )}
      <div className="space-y-1.5">
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            disabled={location.level === "lga"}
            onClick={() => location.level === "state" && onDrillDown(r.label)}
            className={`group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
              location.level === "state" ? "cursor-pointer hover:bg-[#f4faf8]" : "cursor-default"
            }`}
          >
            <span className="w-24 shrink-0 truncate text-right font-sans text-xs text-brand-text-secondary group-hover:text-[#03624D]">
              {r.label}
            </span>
            {/* Stacked bar — min 8px per segment so tiny values stay visible */}
            <div className="relative flex h-5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="absolute inset-y-0 left-0 bg-[#03624D] transition-all duration-700"
                style={{ width: barW(r.male) }}
              />
              <div
                className="absolute inset-y-0 bg-[#23c99a] transition-all duration-700"
                style={{ left: barW(r.male), width: barW(r.female) }}
              />
              <div
                className="absolute inset-y-0 bg-[#a8f0de] transition-all duration-700"
                style={{ left: `max(8px, ${((r.male + r.female) / max) * 100}%)`, width: barW(r.other) }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-sans text-xs font-semibold text-brand-text-primary">
              {fmt(r.total)}
            </span>
            {location.level === "state" && (
              <ChevronLeft
                size={13}
                strokeWidth={2}
                className="shrink-0 rotate-180 text-[#03624D] opacity-0 transition-opacity group-hover:opacity-100"
              />
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4">
        {[
          { color: "#03624D", label: "Male" },
          { color: "#23c99a", label: "Female" },
          { color: "#a8f0de", label: "Other" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 font-sans text-xs text-brand-text-secondary">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
        {location.level === "state" && (
          <span className="ml-auto font-sans text-xs text-brand-text-secondary">
            Click a row to drill into LGAs
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Top Agents table ─────────────────────────────────────────────────────────
function TopAgentsTable({
  agents,
  onView,
}: {
  agents: AgentPerformance[];
  onView: (id: string) => void;
}) {
  if (!agents.length)
    return (
      <p className="py-8 text-center font-sans text-sm text-brand-text-secondary">
        No agent data available.
      </p>
    );

  const max = agents[0]?.farmers_enrolled || 1;

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e8e8e8]">
      <div className="grid grid-cols-[2rem_1fr_0.9fr_0.9fr_7rem_5.5rem] gap-2 border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted">
        <span className="text-center">#</span>
        <span>Name</span>
        <span>State</span>
        <span>LGA</span>
        <span>Enrolled</span>
        <span />
      </div>
      {agents.map((a, i) => (
        <div
          key={a.agent_id}
          className={`grid grid-cols-[2rem_1fr_0.9fr_0.9fr_7rem_5.5rem] items-center gap-2 border-b border-[#f0f0f0] px-4 py-3 last:border-b-0 ${
            i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
          }`}
        >
          <span className="text-center font-sans text-xs font-bold text-[#03624D]">{i + 1}</span>
          <span className="truncate font-sans text-sm font-medium text-brand-text-primary">
            {a.full_name}
          </span>
          <span className="truncate font-sans text-xs text-brand-text-secondary">{a.state}</span>
          <span className="truncate font-sans text-xs text-brand-text-secondary">{a.lga}</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full bg-[#f0f0f0]" style={{ height: 6 }}>
              <div
                className="h-full rounded-full bg-[#03624D]"
                style={{ width: `max(8px, ${(a.farmers_enrolled / max) * 100}%)` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right font-sans text-xs font-semibold text-brand-text-primary">
              {a.farmers_enrolled}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onView(a.agent_id)}
            className="rounded-lg border border-[#03624D]/30 px-2.5 py-1 font-sans text-xs font-semibold text-[#03624D] transition-colors hover:bg-[#03624D] hover:text-white"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<FarmerOverviewReport | null>(null);
  const [trend, setTrend] = useState<TrendReport | null>(null);
  const [location, setLocation] = useState<LocationReport | null>(null);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [trendInterval, setTrendInterval] = useState<TrendInterval>("month");
  const [drillState, setDrillState] = useState("");

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [errorOverview, setErrorOverview] = useState("");
  const [errorTrend, setErrorTrend] = useState("");
  const [errorLocation, setErrorLocation] = useState("");
  const [errorAgents, setErrorAgents] = useState("");

  // Overview
  useEffect(() => {
    let active = true;
    setLoadingOverview(true);
    setErrorOverview("");
    getReportFarmerOverview()
      .then((d) => { if (active) setOverview(d); })
      .catch((e) => { if (active) setErrorOverview(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (active) setLoadingOverview(false); });
    return () => { active = false; };
  }, [refreshKey]);

  // Top agents
  useEffect(() => {
    let active = true;
    setLoadingAgents(true);
    setErrorAgents("");
    getReportTopAgents({ limit: 10 })
      .then((d) => { if (active) setAgents(d); })
      .catch((e) => { if (active) setErrorAgents(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (active) setLoadingAgents(false); });
    return () => { active = false; };
  }, [refreshKey]);

  // Trend — refetch on interval or refresh change
  useEffect(() => {
    let active = true;
    setLoadingTrend(true);
    setErrorTrend("");
    getReportTrend({ interval: trendInterval })
      .then((d) => { if (active) setTrend(d); })
      .catch((e) => { if (active) setErrorTrend(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (active) setLoadingTrend(false); });
    return () => { active = false; };
  }, [trendInterval, refreshKey]);

  // Location — refetch on drill state or refresh change
  const fetchLocation = useCallback((state: string) => {
    let active = true;
    setLoadingLocation(true);
    setErrorLocation("");
    getReportFarmerLocations(state ? { state } : {})
      .then((d) => { if (active) setLocation(d); })
      .catch((e) => { if (active) setErrorLocation(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (active) setLoadingLocation(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => { fetchLocation(drillState); }, [drillState, fetchLocation, refreshKey]);

  const s = overview?.summary;

  // 4 primary stat cards only
  const statCards = useMemo(
    () => [
      {
        key: "total",
        label: "Total Farmers",
        value: s ? fmt(s.total_farmers) : "…",
        badge: s ? `${s.states_covered} states covered` : "Loading…",
        icon: <img src={tractorIcon} alt="" aria-hidden className="h-7 w-7 object-contain" />,
      },
      {
        key: "verified",
        label: "Verified Farmers",
        value: s ? fmt(s.verified_farmers) : "…",
        badge: s ? `${pct(s.verified_farmers, s.total_farmers)} of total` : "Loading…",
        icon: <img src={tractorIcon} alt="" aria-hidden className="h-7 w-7 object-contain" />,
      },
      {
        key: "this_month",
        label: "Enrolled This Month",
        value: s ? fmt(s.enrolled_this_month) : "…",
        badge: s ? `vs ${fmt(s.enrolled_last_month)} last month` : "Loading…",
        icon: <img src={userArrowLeftRightIcon} alt="" aria-hidden className="h-7 w-7 object-contain" />,
      },
      {
        key: "agents",
        label: "Active Agents",
        value: s ? fmt(s.enrolling_agents) : "…",
        badge: s ? `${s.lgas_covered} LGAs covered` : "Loading…",
        icon: <img src={userArrowLeftRightIcon} alt="" aria-hidden className="h-7 w-7 object-contain" />,
      },
    ],
    [s],
  );

  // Secondary metrics strip (compact, no cards)
  const secondaryMetrics = s
    ? [
        { label: "Pending Farmers", value: fmt(s.pending_farmers) },
        { label: "Avg Farmer Age", value: `${s.average_age.toFixed(1)} yrs` },
        { label: "Avg Farming Exp.", value: `${s.average_farming_experience_years.toFixed(1)} yrs` },
        { label: "LGAs Covered", value: String(s.lgas_covered) },
      ]
    : [];

  // ── Export to Excel ──
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const today = new Date().toISOString().slice(0, 10);

    // Sheet 1 — Summary
    if (s) {
      const summaryData = [
        ["Metric", "Value"],
        ["Total Farmers", s.total_farmers],
        ["Verified Farmers", s.verified_farmers],
        ["Pending Farmers", s.pending_farmers],
        ["Enrolled This Month", s.enrolled_this_month],
        ["Enrolled Last Month", s.enrolled_last_month],
        ["Enrolling Agents", s.enrolling_agents],
        ["States Covered", s.states_covered],
        ["LGAs Covered", s.lgas_covered],
        ["Average Age", s.average_age],
        ["Avg Farming Experience (yrs)", s.average_farming_experience_years],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
    }

    // Sheet 2 — Enrollment Trend
    if (trend && trend.points.length) {
      const trendData = [
        ["Period", "Enrolled", "Cumulative"],
        ...trend.points.map((p) => [p.period, p.count, p.cumulative]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trendData), "Enrollment Trend");
    }

    // Sheet 3 — Locations
    if (location && location.rows.length) {
      const locData = [
        [location.level === "lga" ? "LGA" : "State", "Male", "Female", "Other", "Total"],
        ...location.rows.map((r) => [r.label, r.male, r.female, r.other, r.total]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(locData), "Farmers by Location");
    }

    // Sheet 4 — Top Agents
    if (agents.length) {
      const agentData = [
        ["Rank", "Name", "State", "LGA", "Farmers Enrolled"],
        ...agents.map((a, i) => [i + 1, a.full_name, a.state, a.lga, a.farmers_enrolled]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(agentData), "Top Agents");
    }

    // Sheet 5 — Demographics (all breakdown arrays)
    if (overview) {
      const sections: [string, { label: string; value: number }[]][] = [
        ["Gender", overview.gender],
        ["Age Groups", overview.age_groups],
        ["Education Level", overview.education_level],
        ["Marital Status", overview.marital_status],
        ["Farming Experience", overview.farming_experience],
        ["Farmer Status", overview.status],
        ["Top Crops", overview.top_primary_crops],
        ["By State", overview.by_state],
      ];
      const demoRows: (string | number)[][] = [["Category", "Label", "Count"]];
      for (const [category, items] of sections) {
        for (const item of items) {
          demoRows.push([category, item.label, item.value]);
        }
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(demoRows), "Demographics");
    }

    XLSX.writeFile(wb, `analytics-report-${today}.xlsx`);
  };

  return (
    <div className="w-full space-y-5 pb-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[20px] font-bold leading-6 text-brand-text-primary">
            Analytics
          </h2>
          <p className="mt-1 font-sans text-sm text-brand-text-secondary">
            Real-time reports on farmers, agents and enrollment.
          </p>
          {(errorOverview || errorTrend || errorLocation || errorAgents) && (
            <p className="mt-1 font-sans text-sm text-red-500">
              {errorOverview || errorTrend || errorLocation || errorAgents}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={loadingOverview && loadingTrend}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#03624D]/30 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#03624D] transition-colors hover:bg-[#03624D] hover:text-white disabled:opacity-40"
          >
            <Download size={14} strokeWidth={2} />
            Export
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4e4e4] bg-white px-4 py-2 font-sans text-sm font-semibold text-brand-text-secondary transition-colors hover:bg-[#f6f6f6]"
          >
            <RefreshCw size={14} strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Sub-nav ── */}
      <SubNav />

      {/* ── OVERVIEW ── */}
      <SectionLabel label="Overview" id="sec-overview" />

      {/* 4 primary KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.key}
            label={card.label}
            value={loadingOverview ? "…" : card.value}
            icon={card.icon}
            badge={
              <span className="inline-flex items-center rounded-[50px] bg-[#007158] px-2.5 py-1.5 text-[11px] font-light text-[#F6F6F6]">
                {loadingOverview ? "…" : card.badge}
              </span>
            }
          />
        ))}
      </div>

      {/* Secondary metric strip */}
      {secondaryMetrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {secondaryMetrics.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2"
            >
              <span className="font-sans text-xs text-brand-text-muted">{m.label}</span>
              <span className="font-sans text-sm font-semibold text-brand-text-primary">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── TREND ── */}
      <SectionLabel label="Trend" id="sec-trend" />

      <Section
        title="Enrollment Trend"
        icon={<TrendingUp size={18} strokeWidth={2} />}
        action={<IntervalToggle value={trendInterval} onChange={setTrendInterval} />}
      >
        {loadingTrend ? (
          <div className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : trend ? (
          <LineChart trend={trend} />
        ) : (
          <p className="py-10 text-center font-sans text-sm text-brand-text-secondary">
            {errorTrend || "No trend data."}
          </p>
        )}
      </Section>

      {/* ── GEOGRAPHIC ── */}
      <SectionLabel label="Geographic Distribution" id="sec-geo" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title={drillState ? `${drillState} — by LGA` : "Farmers by State"}
          icon={<MapPin size={18} strokeWidth={2} />}
        >
          {loadingLocation ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          ) : location ? (
            <LocationBars
              location={location}
              onDrillDown={(state) => setDrillState(state)}
              onBack={() => setDrillState("")}
            />
          ) : (
            <p className="py-8 text-center font-sans text-sm text-brand-text-secondary">
              {errorLocation || "No location data."}
            </p>
          )}
        </Section>

        <Section
          title="Top Enrolling Agents"
          icon={<Users size={18} strokeWidth={2} />}
        >
          {loadingAgents ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <TopAgentsTable
              agents={agents}
              onView={(id) => navigate(`/agents/${encodeURIComponent(id)}`)}
            />
          )}
          {errorAgents && (
            <p className="mt-3 font-sans text-sm text-red-500">{errorAgents}</p>
          )}
        </Section>
      </div>

      {/* ── DEMOGRAPHICS ── */}
      <SectionLabel label="Demographics" id="sec-demo" />

      {overview ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Section title="Gender Split" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <DonutRing data={overview.gender} />
          </Section>
          <Section title="Top Crops" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <HorizontalBars data={overview.top_primary_crops.slice(0, 6)} colorIndex={2} />
          </Section>
          <Section title="Age Groups" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <HorizontalBars data={overview.age_groups} colorIndex={1} />
          </Section>
          <Section title="Education Level" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <HorizontalBars data={overview.education_level} colorIndex={3} />
          </Section>
          <Section title="Marital Status" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <DonutRing data={overview.marital_status} />
          </Section>
          <Section title="Farmer Status" icon={<BarChart2 size={18} strokeWidth={2} />}>
            <HorizontalBars
              data={(() => {
                const KNOWN = ["VERIFIED", "PENDING", "FLAGGED", "SUSPENDED"];
                const fromApi = Object.fromEntries(
                  overview.status.map((b) => [b.label.toUpperCase(), b.value]),
                );
                return KNOWN.map((label) => ({
                  label: label.charAt(0) + label.slice(1).toLowerCase(), // "Verified"
                  value: fromApi[label] ?? 0,
                }));
              })()}
              colorIndex={0}
            />
          </Section>
        </div>
      ) : loadingOverview ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[20px] border border-[#e4e4e4] bg-white p-6">
              <Skeleton className="mb-4 h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
