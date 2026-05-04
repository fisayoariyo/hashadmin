import type { ReactNode } from "react";
import cardPattern from "@/assets/comps/card-pattern-desktop.svg";

type AdminStatCardProps = {
  label: string;
  value: string;
  badge?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
};

/**
 * Stat tile — #005F4A base → pattern (SVG may read warm) → soft warm pass → #016A53 multiply
 * to merge hue like Figma (yellow-ish lines + green glaze → single teal field).
 */
export default function AdminStatCard({
  label,
  value,
  badge,
  icon,
  onClick,
}: AdminStatCardProps) {
  const body = (
    <div className="relative isolate h-[208px] w-full overflow-hidden rounded-[20px] bg-[#005F4A] px-5 pb-5 pt-5 text-white shadow-[0_6px_14px_rgba(0,95,74,0.22),inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-inset ring-white/12 lg:h-[214px] lg:px-7 lg:pb-6 lg:pt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-center scale-[1.1] opacity-[0.58] contrast-[1.1]"
        style={{
          backgroundImage: `url(${cardPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#fef9c3]/18 mix-blend-soft-light" />
      <div className="pointer-events-none absolute inset-0 bg-[#016A53]/34 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-2 lg:mb-4">
          <div className="shrink-0 text-white/95 [&_svg]:h-8 [&_svg]:w-8 lg:[&_svg]:h-9 lg:[&_svg]:w-9">{icon}</div>
          {badge ? <div className="shrink-0">{badge}</div> : <span />}
        </div>
        <p className="line-clamp-2 min-h-[2.75rem] font-sans text-[15px] font-light leading-snug text-white/90 lg:text-[17px]">
          {label}
        </p>
        <p className="mt-auto font-display text-[clamp(1.85rem,2.8vw,3.75rem)] font-medium leading-none tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full cursor-pointer text-left transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005F4A] focus-visible:ring-offset-2"
      >
        {body}
      </button>
    );
  }

  return body;
}
