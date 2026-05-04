import { useEffect } from "react";
import { X } from "lucide-react";

type DeactivateFarmerConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeactivateFarmerConfirmModal({
  open,
  onClose,
  onConfirm,
}: DeactivateFarmerConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-farmer-title"
        className="w-full max-w-[420px] rounded-[20px] bg-white px-8 pb-9 pt-10 shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#005F4A] bg-white">
          <X size={30} strokeWidth={2.25} className="text-[#005F4A]" aria-hidden />
        </div>
        <h2
          id="deactivate-farmer-title"
          className="mt-7 text-center font-sans text-lg font-bold leading-snug text-[#005F4A] sm:text-[19px]"
        >
          Are you sure you want to
          <br />
          deactivate this farmer?
        </h2>
        <div className="mt-10 flex gap-3">
          <button
            type="button"
            className="min-h-[48px] flex-1 rounded-full border border-[#C8E6DC] bg-white py-3 font-sans text-[15px] font-semibold text-[#005F4A] transition hover:bg-[#f2faf7]"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            type="button"
            className="min-h-[48px] flex-1 rounded-full bg-[#005F4A] py-3 font-sans text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(0,95,74,0.25)] transition hover:brightness-[1.03] active:scale-[0.99]"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
