import { AlertCircle, Check } from "lucide-react";

/**
 * Inline form feedback (AWD-CA-COMP toast style as row, not floating).
 * Error: outlined alert + red text. Success: filled green disc + check + green text.
 */
export default function AgentFormFeedback({ variant = "error", children, className = "" }) {
  if (variant === "success") {
    return (
      <div className={`flex items-center gap-2.5 text-brand-green font-sans text-sm font-medium ${className}`}>
        <span className="shrink-0 w-6 h-6 rounded-full bg-brand-green flex items-center justify-center" aria-hidden>
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </span>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 text-red-600 font-sans text-sm font-medium ${className}`}>
      <AlertCircle className="shrink-0 w-6 h-6 text-red-600" strokeWidth={2} aria-hidden />
      {children}
    </div>
  );
}
