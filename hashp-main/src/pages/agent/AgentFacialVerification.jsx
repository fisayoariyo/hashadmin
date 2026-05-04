import { useState } from "react";
import { ArrowLeft } from "lucide-react";

// Facial states:
// idle    → waiting, show Capture button
// scanning → animated scanning overlay
// success  → green tick, show "Verification successful"

export default function AgentFacialVerification({ onSuccess, onBack, embedded }) {
  const [status, setStatus] = useState("idle"); // idle | scanning | success

  const handleCapture = () => {
    setStatus("scanning");
    // Simulate camera processing for 2 seconds then succeed
    setTimeout(() => setStatus("success"), 2000);
  };

  const handleContinue = () => {
    onSuccess();
  };

  const rootClass = embedded
    ? "flex flex-col min-h-0 flex-1 w-full max-h-[calc(100dvh-220px)] justify-center"
    : "page-container bg-brand-bg-page flex flex-col";
  const scrollPb = embedded ? "pb-2" : "pb-28";
  const bottomClass = embedded
    ? "flex flex-col items-center gap-3 w-full mt-auto pt-4 border-t border-brand-border/80 shrink-0 px-4"
    : "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 pb-8 bg-transparent pt-3 z-10 flex flex-col items-center";

  const innerCard =
    "w-full max-w-md mx-auto rounded-2xl border border-brand-border bg-white p-5 flex flex-col min-h-0 flex-1 shadow-sm";

  const content = (
    <>
      <div className={`flex-1 overflow-y-auto scrollbar-hide min-h-0 ${scrollPb}`}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-text-secondary mb-5"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>

        <h1 className="font-display font-bold text-2xl md:text-[48px] md:leading-[52px] text-brand-text-primary mb-1 md:text-center">
          Facial Verification
        </h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-6 md:text-center">
          Capture face for identity verification.
        </p>

        {/* Oval camera frame — proportional to ID card photo (~112px wide) */}
        <div className="flex justify-center mb-4">
          <div className="relative w-52 h-[13.5rem] max-w-[85vw]">
            {/* Dashed green oval border */}
            <svg
              viewBox="0 0 256 320"
              className="absolute inset-0 w-full h-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <ellipse
                cx="128"
                cy="160"
                rx="118"
                ry="148"
                stroke={status === "success" ? "#155235" : "#155235"}
                strokeWidth="2.5"
                strokeDasharray="10 7"
                className={status === "scanning" ? "animate-spin" : ""}
                style={{ transformOrigin: "128px 160px" }}
              />
            </svg>

            {/* Camera preview — placeholder face image */}
            <div className="absolute inset-3 rounded-full overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80"
                alt="Camera preview"
                className="w-full h-full object-cover"
              />

              {/* Scanning overlay */}
              {status === "scanning" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                  {/* Vertical scan line animation */}
                  <div
                    className="w-full h-0.5 bg-brand-green/80"
                    style={{
                      animation: "scanLine 1.5s ease-in-out infinite alternate",
                    }}
                  />
                </div>
              )}

              {/* Success overlay */}
              {status === "success" && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-green/20">
                  <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center">
                    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                      <polyline
                        points="6,17 13,24 26,10"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical centre-line — only when idle/scanning */}
            {status !== "success" && (
              <div
                className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-0.5 bg-white/70"
                style={{ backgroundImage: "repeating-linear-gradient(to bottom, white 0 8px, transparent 8px 14px)" }}
              />
            )}
          </div>
        </div>

        {/* Instruction text */}
        <p className="font-sans text-center text-sm text-brand-text-primary leading-relaxed px-4">
          {status === "idle" && "Position your face within the frame and look directly at the camera"}
          {status === "scanning" && "Hold still — scanning in progress..."}
          {status === "success" && (
            <span className="text-brand-green font-semibold">
              Face verification successful ✓
            </span>
          )}
        </p>
      </div>

      <div className={bottomClass}>
        {status === "success" ? (
          <button type="button" onClick={handleContinue} className="btn-capture-pill w-[220px] justify-center">
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            disabled={status === "scanning"}
            className="btn-capture-pill w-[220px] justify-center disabled:opacity-60"
          >
            {status === "scanning" ? "Scanning..." : "Capture"}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className={rootClass}>
      {embedded ? (
        <div className="flex flex-col min-h-0 flex-1 w-full">
          {content}
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-md mx-auto px-3 pt-4 pb-4">
          <div className="rounded-2xl border border-brand-border bg-white p-5 flex flex-col flex-1 min-h-0 shadow-sm">
            {content}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          from { transform: translateY(-120px); }
          to   { transform: translateY(120px); }
        }
      `}</style>
    </div>
  );
}
