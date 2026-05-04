import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Info, TrendingUp } from "lucide-react";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import { ActivitySkeleton } from "../components/Skeleton";
import { useNotifications } from "../hooks/useNotifications";

const typeConfig = {
  identity: { icon: BadgeCheck, bg: "bg-brand-green-muted", color: "text-brand-green" },
  verification: { icon: BadgeCheck, bg: "bg-green-50", color: "text-green-600" },
  info: { icon: Info, bg: "bg-blue-50", color: "text-blue-500" },
  update: { icon: TrendingUp, bg: "bg-amber-50", color: "text-amber-500" },
};

export default function UpdatesScreen() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useNotifications();

  return (
    <div className="page-container">
      <div className="page-content">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-text-secondary mb-4 pt-2"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Back</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl text-brand-text-primary">
            Updates
          </h1>
          {unreadCount > 0 && (
            <span className="bg-brand-green text-white text-xs font-bold font-sans px-2.5 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {loading ? (
          <ActivitySkeleton count={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="No updates yet"
            subtitle="You'll see notifications about your profile and available services here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.info;
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`card flex items-start gap-3 ${
                    !notif.read ? "border-l-4 border-brand-green" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${config.bg}`}
                  >
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-sans font-semibold text-sm text-brand-text-primary leading-snug">
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-brand-green shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="font-sans text-xs text-brand-text-secondary mt-1 leading-relaxed">
                      {notif.body}
                    </p>
                    <p className="font-sans text-[10px] text-brand-text-muted mt-2">
                      {new Date(notif.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
