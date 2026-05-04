// Shimmer skeleton components for loading states

function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl ${className}`}
      style={{
        animation: "shimmer 1.5s infinite linear",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export function CardSkeleton({ rows = 2 }) {
  return (
    <div className="card space-y-3">
      <Shimmer className="h-10 w-10 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i === 0 ? "w-3/4" : "w-1/2"}`} />
      ))}
    </div>
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className="bg-brand-green/20 rounded-3xl p-5 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <Shimmer className="h-8 w-24 rounded-full" />
        <Shimmer className="h-16 w-16 rounded-full" />
      </div>
      <Shimmer className="h-4 w-48" />
      <div className="flex gap-4">
        <Shimmer className="h-8 flex-1" />
        <Shimmer className="h-8 flex-1" />
        <Shimmer className="h-8 flex-1" />
      </div>
      <div className="flex justify-between items-end">
        <Shimmer className="h-10 w-24" />
        <Shimmer className="h-6 w-32" />
      </div>
    </div>
  );
}

export function ActivitySkeleton({ count = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 animate-pulse">
          <Shimmer className="h-11 w-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3.5 w-2/3" />
            <Shimmer className="h-3 w-1/3" />
          </div>
          <Shimmer className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ProfileRowSkeleton({ count = 6 }) {
  return (
    <div className="card space-y-0 divide-y divide-brand-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3 space-y-1.5 animate-pulse">
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="h-3.5 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default Shimmer;
