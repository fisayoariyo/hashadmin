/**
 * Single wide farm summary card: title + 4 columns (optional per-cell button actions).
 */
export default function FarmerFarmInfoBar({
  title = "My Farm Information",
  items,
}) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-gradient-to-b from-[#0d7a63] to-[#005F4A] p-5 text-white shadow-[0_6px_14px_rgba(0,95,74,0.22)] ring-1 ring-inset ring-white/12">
      <h2 className="mb-4 font-display text-lg font-bold leading-6 text-white">{title}</h2>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
        {items.map((item, i) => {
          const { label, value, onClick } = item;
          const cell = (
            <>
              <p className="font-sans text-sm font-normal text-white/90">{label}</p>
              <p className="mt-1.5 font-display text-lg font-bold leading-tight break-words line-clamp-2 md:text-xl">
                {value}
              </p>
            </>
          );

          const base =
            "w-full min-w-0 rounded-lg py-1 text-left " +
            (onClick
              ? "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              : "");

          return (
            <div
              key={label}
              className={`min-w-0 px-1 md:px-3 ${
                i > 0 ? "border-t border-white/20 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5" : ""
              }`}
            >
              {onClick ? (
                <button type="button" onClick={onClick} className={base + " cursor-pointer"}>
                  {cell}
                </button>
              ) : (
                <div className={base}>{cell}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
