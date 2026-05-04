// Selectable crop type card — FWMHPCOMPcroptype design
// Two states: default (white, no ring) and selected (teal ring)

const cropEmoji = {
  Maize: "🌽",
  Rice: "🌾",
  "Green Beans": "🫘",
  "Soya bean": "🫘",
  Tomato: "🍅",
  Cassava: "🌿",
  Yam: "🍠",
  Pepper: "🌶️",
  default: "🌱",
};

export default function CropTypeCard({ crop, selected = false, onSelect }) {
  const emoji = cropEmoji[crop] || cropEmoji.default;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white shadow-card aspect-square transition-all active:scale-95 ${
        selected ? "ring-2 ring-brand-green" : "ring-0"
      }`}
    >
      <span className="text-4xl leading-none select-none">{emoji}</span>
      <span
        className={`font-sans text-sm font-medium ${
          selected ? "text-brand-green" : "text-brand-text-primary"
        }`}
      >
        {crop}
      </span>
    </button>
  );
}
