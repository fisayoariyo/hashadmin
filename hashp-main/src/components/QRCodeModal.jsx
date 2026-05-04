import { X, Copy, MessageCircle, Smartphone } from "lucide-react";
import { useClipboard } from "../hooks/useClipboard";
import { buildWhatsAppShareURL, buildSMSShareURL } from "../utils/helpers";

export default function QRCodeModal({ open, onClose, idData }) {
  const { copy } = useClipboard();

  if (!open || !idData) return null;

  const handleWhatsApp = () => {
    window.open(buildWhatsAppShareURL(idData.farmerID), "_blank");
  };

  const handleSMS = () => {
    window.open(buildSMSShareURL(idData.farmerID), "_blank");
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center max-w-sm mx-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl mx-6 p-6 w-full max-w-[320px] animate-slide-up shadow-card-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display font-bold text-base text-brand-text-primary">
              My QR Code
            </p>
            <p className="font-sans text-xs text-brand-text-secondary mt-0.5">
              Scan to verify my farmer profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-brand-text-secondary" />
          </button>
        </div>

        <div className="bg-brand-green-muted rounded-2xl p-4 flex items-center justify-center mb-4">
          <img
            src={idData.qrCodeURL}
            alt="Farmer QR Code"
            className="w-48 h-48 rounded-xl"
          />
        </div>

        <button
          onClick={() => copy(idData.farmerID, "Farmer ID copied!")}
          className="w-full flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 mb-4 active:bg-gray-100 transition-colors"
        >
          <span className="font-display font-bold text-sm text-brand-green tracking-widest">
            {idData.farmerID}
          </span>
          <Copy size={14} className="text-brand-text-muted" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans font-semibold text-sm py-3 rounded-2xl active:brightness-90 transition-all"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>
          <button
            onClick={handleSMS}
            className="flex items-center justify-center gap-2 bg-brand-text-primary text-white font-sans font-semibold text-sm py-3 rounded-2xl active:brightness-90 transition-all"
          >
            <Smartphone size={15} />
            SMS
          </button>
        </div>
      </div>
    </div>
  );
}
