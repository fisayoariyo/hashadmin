// Square selectable activity card — used in Add Farm / Activity selection flows
// FWMHPCOMPactivitybox: white card, emoji icon, label below, teal ring when selected

const activityEmoji = {
  plant: "🌱",
  watering: "🪣",
  harvesting: "🌾",
  mapping: "📍",
  fertilizer: "🌿",
};

export default function ActivityBox({ type, label, selected = false, onSelect }) {
  const emoji = activityEmoji[type] || "🌿";

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white shadow-card aspect-square transition-all active:scale-95 ${
        selected
          ? "ring-2 ring-brand-green"
          : "ring-0"
      }`}
    >
      <span className="text-3xl leading-none select-none">{emoji}</span>
      <span
        className={`font-sans text-sm font-medium ${
          selected ? "text-brand-green" : "text-brand-text-primary"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
