import { ScanFace, Check, ChevronRight } from "lucide-react";

// Face verification row — FWMCOMPfaceverification + FWMCOMPfacecapture designs
// States: idle (shows "Capture your face to verify" + chevron)
//         verified (shows "Face verification successful" + green check)
// Capture variant: label changes to "Click here to capture your face"

export default function FaceVerification({
  verified = false,
  onCapture,
  variant = "verify",
}) {
  const idleLabel =
    variant === "capture"
      ? "Click here to capture your face"
      : "Capture your face to verify";

  const sectionLabel =
    variant === "capture" ? "Capture your face" : "Face verification";

  return (
    <div>
      <p className="font-sans text-sm font-medium text-brand-text-primary mb-2">
        {sectionLabel}
      </p>
      <button
        onClick={!verified ? onCapture : undefined}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all active:scale-[0.99] ${
          verified
            ? "bg-white border border-brand-green/30"
            : "bg-white border border-brand-border"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
            verified
              ? "border-brand-green text-brand-green"
              : "border-brand-text-muted text-brand-text-muted"
          }`}
        >
          <ScanFace size={18} strokeWidth={1.5} />
        </div>
        <span
          className={`flex-1 text-left font-sans text-sm ${
            verified
              ? "text-brand-green font-medium"
              : "text-brand-text-secondary"
          }`}
        >
          {verified ? "Face verification successful" : idleLabel}
        </span>
        {verified ? (
          <Check size={16} className="text-brand-green shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-brand-text-muted shrink-0" />
        )}
      </button>
    </div>
  );
}
