import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function AddFarmBanner() {
  const navigate = useNavigate();

  return (
    <div className="bg-brand-green rounded-3xl px-5 py-5 flex items-center justify-between overflow-hidden relative">
      <div className="flex-1 pr-4 z-10">
        <h3 className="font-display font-bold text-white text-xl leading-tight mb-1">
          Add Your Farm
        </h3>
        <p className="font-sans text-white/75 text-xs leading-relaxed mb-4">
          Let us get started by telling us about your farm
        </p>
        <button
          onClick={() => navigate(ROUTES.FARMS)}
          className="bg-brand-amber text-white font-display font-semibold text-sm px-5 py-2.5 rounded-2xl active:brightness-90 transition-all"
        >
          Input Farm Details
        </button>
      </div>

      <div className="absolute right-4 bottom-0 w-28 h-24 pointer-events-none select-none">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 right-0 w-24 h-14 bg-green-500 rounded-full opacity-60 blur-sm" />
          <div className="absolute bottom-2 right-2 text-5xl leading-none">🌱</div>
          <div className="absolute bottom-10 right-6 text-2xl leading-none">☀️</div>
        </div>
      </div>
    </div>
  );
}
