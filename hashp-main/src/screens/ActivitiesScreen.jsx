import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ActivityItem from "../components/ActivityItem";
import EmptyState from "../components/EmptyState";
import { ActivitySkeleton } from "../components/Skeleton";
import { useActivities } from "../hooks/useActivities";
import { getActivityEmoji } from "../utils/helpers";

const FILTERS = ["All", "plant", "watering", "harvesting", "mapping"];

const FILTER_LABELS = {
  All: "All",
  plant: "Planting",
  watering: "Watering",
  harvesting: "Harvesting",
  mapping: "Mapping",
};

export default function ActivitiesScreen() {
  const navigate = useNavigate();
  const { activities, loading, error, refetch } = useActivities();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? activities
      : activities.filter((a) => a.type === activeFilter);

  return (
    <div className="page-container">
      <div className="flex flex-col gap-0 pb-28 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-text-secondary"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display font-bold text-xl text-brand-text-primary">
            Farm Activities
          </h1>
        </div>

        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeFilter === f
                  ? "bg-brand-green text-white"
                  : "bg-white text-brand-text-secondary border border-brand-border"
              }`}
            >
              {f !== "All" && (
                <span className="text-sm leading-none">
                  {getActivityEmoji(f)}
                </span>
              )}
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="px-4">
          {loading && <ActivitySkeleton count={5} />}

          {error && (
            <EmptyState
              emoji="⚠️"
              title="Could not load activities"
              subtitle={error}
              action={
                <button
                  onClick={refetch}
                  className="text-brand-green font-semibold text-sm"
                >
                  Try again
                </button>
              }
            />
          )}

          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              emoji="🌾"
              title={
                activeFilter === "All"
                  ? "No activities yet"
                  : `No ${FILTER_LABELS[activeFilter].toLowerCase()} activities`
              }
              subtitle="Your farm activities will appear here once recorded."
            />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-2.5">
              {filtered.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
