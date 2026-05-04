import { Copy, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { useFarmer } from "../hooks/useFarmer";
import { useClipboard } from "../hooks/useClipboard";
import { ROUTES } from "../constants/routes";

export default function WelcomeHeader() {
  const navigate = useNavigate();
  const { farmer, loading } = useFarmer();
  const { unreadCount } = useNotifications();
  const { copy } = useClipboard();

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div>
        <h2 className="font-display font-bold text-lg text-brand-text-primary leading-tight">
          {loading ? "Welcome..." : `Welcome ${farmer?.name ?? ""}`}
        </h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          {loading ? (
            <div className="h-3 w-40 bg-gray-200 animate-pulse rounded-md" />
          ) : (
            <>
              <span className="font-sans text-xs text-brand-text-secondary">
                your ID:{" "}
                <span className="font-semibold text-brand-green">
                  {farmer?.id}
                </span>
              </span>
              <button
                onClick={() => copy(farmer?.id, "Farmer ID copied!")}
                className="text-brand-text-muted active:text-brand-green transition-colors"
              >
                <Copy size={12} />
              </button>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate(ROUTES.UPDATES)}
        className="relative w-10 h-10 rounded-full bg-brand-green flex items-center justify-center active:brightness-90 transition-all shrink-0"
      >
        <Bell size={18} className="text-white" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
