import { useEffect } from "react";
import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const confirmStyles = {
    danger: "bg-red-500 text-white active:brightness-90",
    green: "bg-brand-green text-white active:brightness-90",
    amber: "bg-brand-amber text-white active:brightness-90",
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end max-w-sm mx-auto">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-card-lg animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-brand-text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-brand-text-secondary" />
          </button>
        </div>

        {message && (
          <p className="font-sans text-sm text-brand-text-secondary leading-relaxed mb-6">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full font-display font-semibold text-base py-4 rounded-3xl transition-all active:scale-95 ${
              confirmStyles[confirmVariant] || confirmStyles.danger
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full font-display font-semibold text-base py-4 rounded-3xl bg-gray-100 text-brand-text-secondary active:bg-gray-200 transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
