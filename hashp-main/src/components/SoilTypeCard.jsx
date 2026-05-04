// Selectable soil type card — FWMHPCOMPsoiltype design
// White rounded card, soil photo centered, label below, teal ring when selected

const soilConfig = {
  "Clay Soil": {
    emoji: "🟤",
    description: "High water retention",
  },
  "Sandy Soil": {
    emoji: "🟡",
    description: "Fast drainage",
  },
  "Loamy Soil": {
    emoji: "🟫",
    description: "Best for crops",
  },
  "Silty Soil": {
    emoji: "⬜",
    description: "Fine texture",
  },
};

export default function SoilTypeCard({ soil, selected = false, onSelect }) {
  const config = soilConfig[soil] || { emoji: "🟤", description: "" };

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white shadow-card aspect-square transition-all active:scale-95 ${
        selected ? "ring-2 ring-brand-green" : "ring-0"
      }`}
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-50">
        <span className="text-4xl leading-none select-none">{config.emoji}</span>
      </div>
      <span
        className={`font-sans text-sm font-medium text-center leading-tight ${
          selected ? "text-brand-green" : "text-brand-text-primary"
        }`}
      >
        {soil}
      </span>
    </button>
  );
}
