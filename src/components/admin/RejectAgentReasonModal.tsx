import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";

type RejectAgentReasonModalProps = {
  open: boolean;
  onClose: () => void;
  /** Optional note sent with the reject API call. */
  onConfirm: (reason: string) => void | Promise<void>;
  submitting: boolean;
};

export default function RejectAgentReasonModal({
  open,
  onClose,
  onConfirm,
  submitting,
}: RejectAgentReasonModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-agent-title"
        className="w-full max-w-[440px] rounded-[20px] bg-white px-6 pb-8 pt-8 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
          <CircleX size={28} className="text-red-500" strokeWidth={2} aria-hidden />
        </div>
        <h2
          id="reject-agent-title"
          className="mt-5 text-center font-sans text-lg font-bold leading-snug text-brand-text-primary sm:text-[19px]"
        >
          Reject this agent?
        </h2>
        <p className="mt-2 text-center font-sans text-sm text-brand-text-secondary">
          You can add an optional note for the record. It will be sent with the rejection.
        </p>
        <label className="mt-5 block">
          <span className="sr-only">Rejection reason (optional)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            rows={3}
            placeholder="Reason (optional)"
            className="w-full resize-y rounded-xl border border-[#e4e4e4] bg-[#fafafa] px-3 py-2.5 font-sans text-sm text-brand-text-primary outline-none ring-[#03624D] transition focus:border-[#03624D] focus:bg-white focus:ring-2 disabled:opacity-60"
          />
        </label>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={submitting}
            className="min-h-[48px] flex-1 rounded-full border border-[#e4e4e4] bg-white py-3 font-sans text-[15px] font-semibold text-brand-text-primary transition hover:bg-[#fafafa] disabled:opacity-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            className="min-h-[48px] flex-1 rounded-full bg-red-600 py-3 font-sans text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.25)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            onClick={() => void onConfirm(reason.trim())}
          >
            {submitting ? "Rejecting…" : "Reject agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
