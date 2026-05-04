import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Smartphone, BadgeCheck, RefreshCw, Copy } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import QRCodeModal from "../components/QRCodeModal";
import { useFarmerID } from "../hooks/useFarmerID";
import { useAuth } from "../context/AuthContext";
import { useClipboard } from "../hooks/useClipboard";
import { buildWhatsAppShareURL, buildSMSShareURL } from "../utils/helpers";

export default function FarmerIDScreen() {
  const navigate = useNavigate();
  const { farmerID } = useAuth();
  const { idData, loading, error, refetch } = useFarmerID();
  const { copy } = useClipboard();
  const [showQR, setShowQR] = useState(false);

  const handleWhatsApp = () => {
    if (farmerID) window.open(buildWhatsAppShareURL(farmerID), "_blank");
  };

  const handleSMS = () => {
    if (farmerID) window.open(buildSMSShareURL(farmerID), "_blank");
  };

  return (
    <div className="page-container">
      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        idData={idData}
      />

      <div className="page-content">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-text-secondary mb-6 pt-2"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Back</span>
        </button>

        <h1 className="font-display font-bold text-xl text-brand-text-primary mb-6">
          My Farmer ID
        </h1>

        {loading && (
          <div className="space-y-4">
            <div className="bg-brand-green/20 rounded-3xl p-5 animate-pulse space-y-4">
              <div className="h-8 w-32 bg-white/40 rounded-full" />
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-white/40 rounded-2xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-white/40 rounded w-3/4" />
                  <div className="h-3 bg-white/40 rounded w-1/2" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="h-6 w-40 bg-white/40 rounded" />
                <div className="w-16 h-16 bg-white/40 rounded-xl" />
              </div>
            </div>
            <CardSkeleton rows={4} />
          </div>
        )}

        {error && (
          <EmptyState
            emoji="⚠️"
            title="Could not load your ID"
            subtitle={error}
            action={
              <button onClick={refetch} className="flex items-center gap-2 text-brand-green font-semibold text-sm">
                <RefreshCw size={14} /> Try again
              </button>
            }
          />
        )}

        {!loading && !error && idData && (
          <>
            <div className="bg-brand-green rounded-3xl p-5 mb-4 shadow-card-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <BadgeCheck size={16} className="text-white" />
                  </div>
                  <span className="font-display font-bold text-white text-sm tracking-wider">
                    HASHMAR CROPEX
                  </span>
                </div>
                <span className="text-[10px] text-white/70 font-sans">
                  Expires{" "}
                  {new Date(idData.expiryDate).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <img
                  src={idData.photo}
                  alt={idData.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40"
                />
                <div>
                  <h2 className="font-display font-bold text-white text-lg leading-tight">
                    {idData.name}
                  </h2>
                  <p className="font-sans text-white/80 text-xs mt-0.5">
                    {idData.primaryCrop} Farmer
                  </p>
                  <p className="font-sans text-white/70 text-xs mt-0.5 line-clamp-1">
                    {idData.cooperative}
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-white/20 mb-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-white/60 text-[10px] mb-1">
                    Farmer ID
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-white text-sm tracking-widest">
                      {idData.farmerID}
                    </p>
                    <button
                      onClick={() => copy(idData.farmerID, "Farmer ID copied!")}
                      className="opacity-60 active:opacity-100 transition-opacity"
                    >
                      <Copy size={12} className="text-white" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowQR(true)}
                  className="bg-white rounded-xl p-1.5 active:scale-95 transition-transform"
                  title="Tap to expand QR code"
                >
                  <img
                    src={idData.qrCodeURL}
                    alt="QR Code"
                    className="w-16 h-16 rounded-lg"
                  />
                  <p className="text-[9px] text-brand-green font-sans font-medium text-center mt-0.5">
                    Tap to expand
                  </p>
                </button>
              </div>
            </div>

            <div className="card mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <BadgeCheck size={14} className="text-brand-green" />
                <span className="text-xs font-semibold text-brand-green font-sans">
                  Verified Profile
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-3">
                {[
                  { label: "Cooperative", value: idData.cooperative },
                  { label: "Primary Crop", value: idData.primaryCrop },
                  { label: "Status", value: idData.status },
                  {
                    label: "Expiry Date",
                    value: new Date(idData.expiryDate).toLocaleDateString(
                      "en-GB"
                    ),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="label-sm">{label}</p>
                    <p className="value-md">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-display font-semibold text-sm text-brand-text-primary mb-3">
              Share My ID
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans font-semibold text-sm py-3.5 rounded-2xl active:brightness-90 transition-all"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
              <button
                onClick={handleSMS}
                className="flex items-center justify-center gap-2 bg-brand-text-primary text-white font-sans font-semibold text-sm py-3.5 rounded-2xl active:brightness-90 transition-all"
              >
                <Smartphone size={16} />
                SMS
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

