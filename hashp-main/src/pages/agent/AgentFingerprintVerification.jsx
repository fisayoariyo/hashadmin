import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

/** Minimum successful finger reads required to continue (AWD partial-success flow). */
const MIN_SUCCESS_SCANS = 7;

// ── Scan order (Right Thumb first, as shown in RF05) ───────
const SCAN_ORDER = [
  { id: "R_thumb",  label: "Right Thumb"  },
  { id: "R_index",  label: "Right Index"  },
  { id: "R_middle", label: "Right Middle" },
  { id: "R_ring",   label: "Right Ring"   },
  { id: "R_pinkie", label: "Right Pinkie" },
  { id: "L_index",  label: "Left Index"   },
  { id: "L_middle", label: "Left Middle"  },
  { id: "L_ring",   label: "Left Ring"    },
  { id: "L_pinkie", label: "Left Pinkie"  },
  { id: "L_thumb",  label: "Left Thumb"   },
];

// SVG position of each fingertip (viewBox "0 -22 360 242")
const FPOS = {
  L_thumb:  { cx: 11,  cy: 134, lx: 1,   ly: 120, la: "start",  dispLabel: "Left thumb"    },
  L_pinkie: { cx: 56,  cy: 38,  lx: 56,  ly: 14,  la: "middle", dispLabel: "Left pinkie"   },
  L_ring:   { cx: 76,  cy: 24,  lx: 76,  ly: 0,   la: "middle", dispLabel: "Left ring"     },
  L_middle: { cx: 96,  cy: 16,  lx: 96,  ly: -8,  la: "middle", dispLabel: "Middle finger" },
  L_index:  { cx: 116, cy: 24,  lx: 116, ly: 0,   la: "middle", dispLabel: "Left index"    },
  R_index:  { cx: 244, cy: 24,  lx: 244, ly: 0,   la: "middle", dispLabel: "Right index"   },
  R_middle: { cx: 264, cy: 16,  lx: 264, ly: -8,  la: "middle", dispLabel: "Middle finger" },
  R_ring:   { cx: 284, cy: 24,  lx: 284, ly: 0,   la: "middle", dispLabel: "Right ring"    },
  R_pinkie: { cx: 304, cy: 38,  lx: 304, ly: 14,  la: "middle", dispLabel: "Right pinkie"  },
  R_thumb:  { cx: 349, cy: 134, lx: 359, ly: 120, la: "end",    dispLabel: "Right thumb"   },
};

const COLORS = {
  idle:     "#9ca3af",
  scanning: "#d4900a",
  success:  "#155235",
  failed:   "#ef4444",
};

// ── Fingerprint swirl icon ─────────────────────────────────
function FPSwirl({ cx, cy, r = 10, state = "idle", isActive = false }) {
  const color = COLORS[isActive ? "scanning" : state];
  const s = r / 10;
  return (
    <g>
      {isActive && <circle cx={cx} cy={cy} r={r + 2} fill="#d4900a22" />}
      <circle cx={cx} cy={cy} r={r}
        fill={isActive ? "#d4900a18" : state === "success" ? "#15523318" : state === "failed" ? "#ef444418" : "#9ca3af10"}
        stroke={color} strokeWidth="1.4" />
      <path d={`M${cx-3.5*s},${cy+2*s} Q${cx-3.5*s},${cy-4.5*s} ${cx},${cy-4.5*s} Q${cx+3.5*s},${cy-4.5*s} ${cx+3.5*s},${cy+2*s}`}
        stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={`M${cx-6*s},${cy+2*s} Q${cx-6*s},${cy-7*s} ${cx},${cy-7*s} Q${cx+6*s},${cy-7*s} ${cx+6*s},${cy+2*s}`}
        stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={0.8 * s} fill={color} />
      {isActive && (
        <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="#d4900a" strokeWidth="1.5">
          <animate attributeName="r" values={`${r};${r + 6}`} dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

// ── Fingerprint icon for legend + counter ──────────────────
function FPLegendIcon({ color, size = 20 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 1, s = r / 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill={`${color}18`} stroke={color} strokeWidth="1.5" />
      <path d={`M${cx-3*s},${cy+2*s} Q${cx-3*s},${cy-4*s} ${cx},${cy-4*s} Q${cx+3*s},${cy-4*s} ${cx+3*s},${cy+2*s}`}
        stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={`M${cx-5.5*s},${cy+2*s} Q${cx-5.5*s},${cy-6.5*s} ${cx},${cy-6.5*s} Q${cx+5.5*s},${cy-6.5*s} ${cx+5.5*s},${cy+2*s}`}
        stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={0.8 * s} fill={color} />
    </svg>
  );
}

// ── Both-hands SVG ─────────────────────────────────────────
function HandsDiagram({ fingerStates, activeId }) {
  const H = "#e5e7eb", F = "white";
  return (
    <svg viewBox="0 -22 360 242" className="w-full" style={{ maxHeight: 230 }} aria-hidden="true">
      {/* LEFT HAND */}
      <rect x="46" y="26"  width="20" height="80" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="66" y="12"  width="20" height="94" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="86" y="4"   width="20" height="102" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="106" y="12" width="20" height="94" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="38" y="104" width="98" height="76" rx="18" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="2" y="120" width="46" height="18" rx="9" fill={F} stroke={H} strokeWidth="1.5"
        transform="rotate(-22 25 129)"/>
      <line x1="56"  y1="106" x2="56"  y2="100" stroke={H} strokeWidth="1"/>
      <line x1="76"  y1="106" x2="76"  y2="100" stroke={H} strokeWidth="1"/>
      <line x1="96"  y1="106" x2="96"  y2="100" stroke={H} strokeWidth="1"/>
      <line x1="116" y1="106" x2="116" y2="100" stroke={H} strokeWidth="1"/>

      {/* RIGHT HAND */}
      <rect x="234" y="12"  width="20" height="94" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="254" y="4"   width="20" height="102" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="274" y="12"  width="20" height="94" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="294" y="26"  width="20" height="80" rx="10" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="224" y="104" width="98" height="76" rx="18" fill={F} stroke={H} strokeWidth="1.5"/>
      <rect x="312" y="120" width="46" height="18" rx="9" fill={F} stroke={H} strokeWidth="1.5"
        transform="rotate(22 335 129)"/>
      <line x1="244" y1="106" x2="244" y2="100" stroke={H} strokeWidth="1"/>
      <line x1="264" y1="106" x2="264" y2="100" stroke={H} strokeWidth="1"/>
      <line x1="284" y1="106" x2="284" y2="100" stroke={H} strokeWidth="1"/>
      <line x1="304" y1="106" x2="304" y2="100" stroke={H} strokeWidth="1"/>

      {/* Fingerprint icons + labels */}
      {Object.entries(FPOS).map(([id, pos]) => {
        const state    = fingerStates[id] || "idle";
        const isActive = activeId === id;
        return (
          <g key={id}>
            <text x={pos.lx} y={pos.ly} textAnchor={pos.la} fontSize="7.5" fill="#6b7280" fontFamily="sans-serif">
              {pos.dispLabel}
            </text>
            <FPSwirl cx={pos.cx} cy={pos.cy} r={10} state={state} isActive={isActive} />
            {state === "success" && !isActive && (
              <g>
                <circle cx={pos.cx + 7} cy={pos.cy - 7} r={5} fill="#155235"/>
                <polyline points={`${pos.cx+4.5},${pos.cy-7} ${pos.cx+6.5},${pos.cy-5} ${pos.cx+9.5},${pos.cy-9}`}
                  stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            )}
            {state === "failed" && !isActive && (
              <g>
                <circle cx={pos.cx + 7} cy={pos.cy - 7} r={5} fill="#ef4444"/>
                <line x1={pos.cx+4.5} y1={pos.cy-9.5} x2={pos.cx+9.5} y2={pos.cy-4.5} stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1={pos.cx+9.5} y1={pos.cy-9.5} x2={pos.cx+4.5} y2={pos.cy-4.5} stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </g>
            )}
            {isActive && (() => {
              const bw = 50, bx = Math.min(pos.cx + 6, 308), by = pos.cy - 22;
              return (
                <g>
                  <rect x={bx} y={by} width={bw} height={16} rx={8} fill="#155235"/>
                  <text x={bx + bw / 2} y={by + 11} textAnchor="middle" fontSize="8.5" fill="white" fontFamily="sans-serif" fontWeight="600">
                    Scanning
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────
export default function AgentFingerprintVerification({ onSuccess, onBack, embedded }) {
  const [fingerStates, setFingerStates] = useState(
    Object.fromEntries(SCAN_ORDER.map((f) => [f.id, "idle"]))
  );
  // null = not started, 0..9 = scanning that index, 10 = all done
  const [currentIdx, setCurrentIdx] = useState(null);
  const [failedIds,  setFailedIds]  = useState([]);
  const [scanning,   setScanning]   = useState(false);
  const [allDone,    setAllDone]    = useState(false);

  const completed = Object.values(fingerStates).filter((s) => s === "success").length;
  const current   = currentIdx !== null && currentIdx < SCAN_ORDER.length
    ? SCAN_ORDER[currentIdx] : null;

  // ── KEY FIX: depend ONLY on currentIdx, NOT on `scanning` ──
  // Previously [currentIdx, scanning] caused the cleanup to cancel
  // the setTimeout whenever `setScanning(true)` triggered a re-render.
  useEffect(() => {
    if (currentIdx === null) return;

    if (currentIdx >= SCAN_ORDER.length) {
      setAllDone(true);
      setScanning(false);
      return;
    }

    const finger = SCAN_ORDER[currentIdx];
    let cancelled = false;

    setScanning(true);
    setFingerStates((p) => ({ ...p, [finger.id]: "scanning" }));

    const delay = 1100 + Math.random() * 500;
    const timer = setTimeout(() => {
      if (cancelled) return;
      const ok = Math.random() > 0.12;
      setFingerStates((p) => ({ ...p, [finger.id]: ok ? "success" : "failed" }));
      if (!ok) setFailedIds((prev) => [...prev, finger.id]);
      setScanning(false);
      // Advance to next finger after a short pause so user sees the result
      setTimeout(() => {
        if (!cancelled) setCurrentIdx((i) => i + 1);
      }, 300);
    }, delay);

    // Cleanup: set cancelled flag — but do NOT clear the timer
    // (clearTimeout would re-cancel the scan on every scanning=true re-render)
    return () => { cancelled = true; };
  }, [currentIdx]); // ← only currentIdx, never `scanning`

  const retryFailed = () => {
    const firstFailed = SCAN_ORDER.findIndex((f) => failedIds.includes(f.id));
    setFingerStates((p) => {
      const n = { ...p };
      failedIds.forEach((id) => { n[id] = "idle"; });
      return n;
    });
    setFailedIds([]);
    setAllDone(false);
    setCurrentIdx(firstFailed >= 0 ? firstFailed : 0);
  };

  const passThreshold = completed >= MIN_SUCCESS_SCANS;

  const statusMain = scanning && current
    ? `Scanning ${current.label}.....`
    : allDone
      ? passThreshold
        ? failedIds.length > 0
          ? "Scan successful"
          : "All scans complete!"
        : `Need at least ${MIN_SUCCESS_SCANS} successful scans`
      : current
        ? `Ready: ${current.label}`
        : "Tap to begin scanning";

  const placeNextFinger =
    allDone || !current
      ? ""
      : `Place the ${current.label.toLowerCase()} on the scanner.`;

  const statusSub = scanning
    ? "Hold still"
    : allDone && passThreshold
      ? failedIds.length > 0
        ? "Minimum verification met — Continue or retry failed scans."
        : "Tap Continue to proceed"
      : allDone && !passThreshold
        ? "Retry failed scans or run again until at least 7 fingers verify."
        : placeNextFinger;

  const LEGEND = [
    { color: COLORS.idle,    text: "Fingerprint not scanned yet" },
    { color: COLORS.success, text: "Fingerprint scan successful"  },
    { color: COLORS.failed,  text: "Fingerprint scan failed"     },
  ];

  const rootClass = embedded
    ? "flex flex-col min-h-0 flex-1 w-full max-h-[calc(100dvh-220px)]"
    : "page-container";
  const scrollPb = embedded ? "pb-4" : "pb-40";
  const bottomClass = embedded
    ? "flex items-center justify-center gap-3 w-full mt-auto pt-4 border-t border-brand-border shrink-0 px-4"
    : "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 pb-6 bg-white pt-3 space-y-3 z-10 flex flex-col items-center";

  return (
    <div className={rootClass}>
      <div className={`flex-1 px-4 pt-5 overflow-y-auto scrollbar-hide min-h-0 ${scrollPb}`}>
        <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary mb-5">
          <ArrowLeft size={18} /><span className="font-sans text-sm">Go back</span>
        </button>

        <h1 className="font-display font-bold text-3xl md:text-[48px] md:leading-[52px] text-brand-text-primary mb-1 md:text-center">
          Fingerprint verification
        </h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-5 md:text-center">
          Scan each finger to complete identity verification
        </p>

        {/* Legend */}
        <div className="mb-5 md:text-center">
          <p className="font-sans text-sm font-semibold text-brand-text-primary mb-2">
            Fingerprint scan status guide
          </p>
          <div className="space-y-2 md:flex md:items-center md:justify-center md:gap-5 md:space-y-0">
            {LEGEND.map(({ color, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <FPLegendIcon color={color} size={20} />
                <span className="font-sans text-sm text-brand-text-primary">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hands diagram */}
        <div className="mb-4 px-1">
          <HandsDiagram fingerStates={fingerStates} activeId={scanning && current ? current.id : null} />
        </div>

        {/* Status text */}
        <div className="text-center mb-4">
          <p className="font-display font-semibold text-lg text-brand-text-primary">{statusMain}</p>
          {statusSub && <p className="font-sans text-sm text-brand-text-secondary mt-1">{statusSub}</p>}
        </div>

        {/* Counter pill */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-brand-border">
            <FPLegendIcon color={COLORS.success} size={18} />
            <span className="font-sans text-sm text-brand-text-primary">
              Completed Scans :{" "}
              <span className="font-semibold text-brand-green">{completed}/10</span>
              <span className="text-brand-text-muted text-xs ml-1">(min. {MIN_SUCCESS_SCANS})</span>
            </span>
          </div>
        </div>
      </div>

      <div className={bottomClass}>
        {allDone && failedIds.length > 0 && (
          <button
            type="button"
            onClick={retryFailed}
            className="inline-flex h-[44px] w-[220px] items-center justify-center rounded-full border-2 border-brand-green text-brand-green font-sans font-semibold text-sm"
          >
            Retry Failed Scans
          </button>
        )}
        {currentIdx === null ? (
          <button
            type="button"
            onClick={() => setCurrentIdx(0)}
            className="btn-capture-pill w-[220px] justify-center"
          >
            Begin Fingerprint Scan
          </button>
        ) : (
          <button
            type="button"
            onClick={onSuccess}
            disabled={!allDone || !passThreshold}
            className="btn-capture-pill w-[220px] justify-center disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
