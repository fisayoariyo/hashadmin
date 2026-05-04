import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import BottomNav from "../components/BottomNav";
import FarmCard from "../components/FarmCard";
import FarmWeatherCard from "../components/FarmWeatherCard";
import EmptyState from "../components/EmptyState";
import { WeatherCardSkeleton, CardSkeleton } from "../components/Skeleton";
import { useFarms } from "../hooks/useFarms";

function buildWeatherData(farm) {
  return {
    farmName: farm.name,
    location: farm.location,
    farmSize: farm.size,
    cropType: farm.crop,
    expectedYield: "60 Kg",
    temperature: "28°C",
    condition: farm.conditionType === "rainy" ? "Expected Rainfall" : "Sunny Day",
    conditionType: farm.conditionType || "sunny",
    expectedRainfall: "May 10, 2026",
  };
}

export default function FarmsScreen() {
  const navigate = useNavigate();
  const { farms, loading, error, refetch } = useFarms();
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  const selectedFarm =
    farms.find((f) => f.id === selectedFarmId) ?? farms[0] ?? null;

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 pb-28 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-text-secondary"
          >
            <ArrowLeft size={18} />
            <span className="font-sans text-sm">Back</span>
          </button>
          <h1 className="font-display font-bold text-base text-brand-text-primary">
            My Farms
          </h1>
          <div className="w-16 flex justify-end">
            <div className="flex items-center gap-1 text-brand-text-muted">
              <Plus size={14} />
              <span className="text-xs font-sans">Add</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="px-4 space-y-4">
            <WeatherCardSkeleton />
            <CardSkeleton rows={2} />
            <CardSkeleton rows={2} />
          </div>
        )}

        {error && (
          <EmptyState
            emoji="⚠️"
            title="Could not load farms"
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

        {!loading && !error && farms.length === 0 && (
          <EmptyState
            emoji="🌾"
            title="No farms yet"
            subtitle="Your farms will appear here once a field agent has added them to your profile."
          />
        )}

        {!loading && !error && farms.length > 0 && (
          <>
            <div className="px-4">
              <FarmWeatherCard data={buildWeatherData(selectedFarm)} />
            </div>

            <div className="px-4">
              <h2 className="section-title">All Farms ({farms.length})</h2>
              <div className="space-y-2.5">
                {farms.map((farm) => (
                  <FarmCard
                    key={farm.id}
                    farm={farm}
                    onPress={() => setSelectedFarmId(farm.id)}
                  />
                ))}
              </div>
            </div>

            <div className="px-4">
              <div className="card">
                <h3 className="font-display font-bold text-xs text-brand-text-secondary uppercase tracking-wider mb-3">
                  Selected Farm Details
                </h3>
                <div className="grid grid-cols-2 gap-y-3">
                  {[
                    { label: "Farm Name", value: selectedFarm.name },
                    { label: "Crop Type", value: selectedFarm.crop },
                    { label: "Farm Size", value: selectedFarm.size },
                    { label: "Soil Type", value: selectedFarm.soilType },
                    { label: "Location", value: selectedFarm.location },
                  ].map(({ label, value }) => (
                    <div key={label} className={label === "Location" ? "col-span-2" : ""}>
                      <p className="label-sm">{label}</p>
                      <p className="value-md">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
