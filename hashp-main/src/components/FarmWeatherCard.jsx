import { MapPin, ChevronDown } from "lucide-react";

const weatherAssets = {
  sunny: {
    emoji: "☀️",
    label: "Sunny Day",
    src: "https://em-content.zobj.net/source/apple/391/sun_2600-fe0f.png",
  },
  rainy: {
    emoji: "🌧️",
    label: "Expected Rainfall",
    src: "https://em-content.zobj.net/source/apple/391/cloud-with-rain_1f327-fe0f.png",
  },
  cloudy: {
    emoji: "⛅",
    label: "Clear/Sunny Day",
    src: "https://em-content.zobj.net/source/apple/391/cloud_2601-fe0f.png",
  },
};

export default function FarmWeatherCard({ data }) {
  if (!data) return null;
  const weather = weatherAssets[data.conditionType] || weatherAssets.sunny;

  return (
    <div className="bg-brand-green rounded-3xl p-5 shadow-card-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-black/20 rounded-full px-3 py-1.5">
          <span className="font-sans text-white text-sm font-medium">
            {data.farmName}
          </span>
          <ChevronDown size={14} className="text-white/70" />
        </div>
        <img
          src={weather.src}
          alt={weather.label}
          className="w-16 h-16 object-contain drop-shadow-lg"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-white/80" />
        </div>
        <p className="font-sans text-white/90 text-sm leading-snug">
          {data.location}
        </p>
      </div>

      <div className="flex items-center gap-0 mb-4">
        <div className="flex-1 pr-4">
          <p className="label-sm text-white/50">Farm size</p>
          <p className="font-sans font-semibold text-white text-sm">
            {data.farmSize}
          </p>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex-1 px-4">
          <p className="label-sm text-white/50">Crop type</p>
          <p className="font-sans font-semibold text-white text-sm">
            {data.cropType}
          </p>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex-1 pl-4">
          <p className="label-sm text-white/50">Expected yield.</p>
          <p className="font-sans font-semibold text-white text-sm">
            {data.expectedYield}
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-white/15 mb-4" />

      <div className="flex items-end justify-between">
        <p className="font-display font-bold text-white text-4xl">
          {data.temperature}
        </p>
        <div className="text-right">
          <p className="font-sans text-white/60 text-xs">{weather.label}</p>
          <p className="font-sans text-white font-semibold text-sm">
            {data.expectedRainfall}
          </p>
        </div>
      </div>
    </div>
  );
}
