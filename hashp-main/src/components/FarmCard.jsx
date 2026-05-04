import { MapPin, ChevronRight } from "lucide-react";

// Farm summary card — FWMHPCOMPfarmcard design
// White rounded card with farm name, location, crop and size info

export default function FarmCard({ farm, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full card flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
    >
      <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center shrink-0">
        <MapPin size={20} className="text-brand-green" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-sm text-brand-text-primary">
          {farm.name}
        </p>
        <p className="font-sans text-xs text-brand-text-muted mt-0.5 truncate">
          {farm.location}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs font-sans text-brand-text-secondary">
            🌱 {farm.crop}
          </span>
          <span className="text-xs font-sans text-brand-text-secondary">
            📐 {farm.size}
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="text-brand-text-muted shrink-0" />
    </button>
  );
}
