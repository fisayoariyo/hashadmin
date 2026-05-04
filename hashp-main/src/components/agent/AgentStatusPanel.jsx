import { Loader2, RefreshCw, X } from "lucide-react";

/**
 * Centered status blocks — AWD-HP-COMP loading / sync loading / success / failed.
 */
export default function AgentStatusPanel({
  variant = "loading",
  onRetry,
  className = "",
}) {
  if (variant === "loading") {
    return (
      <div className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}>
        <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" strokeWidth={2.25} aria-hidden />
        <p className="font-display font-bold text-brand-green text-lg tracking-tight">Loading.....</p>
        <p className="font-sans text-sm text-brand-green/70 mt-1">Please wait</p>
      </div>
    );
  }

  if (variant === "sync-loading") {
    return (
      <div className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}>
        <div
          className="w-14 h-14 rounded-full bg-brand-amber flex items-center justify-center mb-4"
          aria-hidden
        >
          <RefreshCw className="w-7 h-7 text-brand-text-primary animate-spin" strokeWidth={2} />
        </div>
        <p className="font-display font-bold text-brand-green text-base">Synchronization in progress</p>
        <p className="font-sans text-sm text-brand-text-secondary mt-1">Please wait</p>
      </div>
    );
  }

  if (variant === "sync-success") {
    return (
      <div className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}>
        <span className="w-14 h-14 rounded-full bg-brand-green flex items-center justify-center mb-4" aria-hidden>
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" aria-hidden>
            <path d="M6 12l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display font-bold text-brand-green text-base leading-tight">Synchronization</p>
        <p className="font-display font-bold text-brand-green text-base leading-tight">successful</p>
      </div>
    );
  }

  if (variant === "sync-failed") {
    return (
      <div className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}>
        <span className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mb-4" aria-hidden>
          <X className="w-7 h-7 text-white" strokeWidth={2.5} />
        </span>
        <p className="font-display font-bold text-brand-green text-base mb-2">Synchronization failed</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="font-sans text-sm font-medium text-brand-green/80 hover:text-brand-green underline-offset-2 hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return null;
}
