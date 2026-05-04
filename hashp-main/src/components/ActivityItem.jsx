import { getActivityEmoji } from "../utils/helpers";
import { formatDateOrdinal } from "../utils/helpers";

export default function ActivityItem({ activity }) {
  const emoji = getActivityEmoji(activity.type);

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-card">
      <div className="w-11 h-11 rounded-xl bg-brand-green-muted flex items-center justify-center shrink-0 text-xl leading-none select-none">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-sm text-brand-text-primary leading-snug">
          {activity.title}
        </p>
        <p className="font-sans text-xs text-brand-text-muted mt-0.5">
          {activity.acres}
        </p>
      </div>
      <p className="font-sans text-xs text-brand-text-secondary shrink-0">
        {activity.date}
      </p>
    </div>
  );
}
