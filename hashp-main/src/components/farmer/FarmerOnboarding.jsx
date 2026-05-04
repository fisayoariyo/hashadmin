import { useState, useRef } from "react";
import { farmerOnboardingSlides } from "../../mockData/farmer";

/**
 * FWM farmer onboarding — full-bleed + bottom copy on mobile;
 * split hero + white content column on desktop (FWD).
 */
export default function FarmerOnboarding({ onDone }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef(null);
  const slide = farmerOnboardingSlides[idx];
  const isLast = idx === farmerOnboardingSlides.length - 1;

  const next = () => {
    if (isLast) onDone();
    else setIdx((i) => i + 1);
  };

  const dots = (
    <div className="flex gap-2 mb-6 md:mb-10">
      {farmerOnboardingSlides.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === idx ? "w-8 bg-brand-amber" : "w-2 bg-white/40 md:bg-brand-border"
          }`}
        />
      ))}
    </div>
  );

  const ctaLabel = isLast ? "Login" : "Next";

  return (
    <div
      className="min-h-dvh w-full flex flex-col bg-black md:grid md:grid-cols-2 md:min-h-dvh md:bg-white md:px-6 md:py-6 lg:px-8 lg:py-8 md:gap-6 lg:gap-8 md:items-stretch"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) next();
        else if (dx > 50 && idx > 0) setIdx((i) => i - 1);
        touchX.current = null;
      }}
    >
      <div className="relative w-full h-dvh min-h-dvh shrink-0 md:h-auto md:min-h-0 md:flex md:min-w-0 md:items-stretch">
        {/* Mobile: full-viewport bleed (FWM) — image fills entire screen */}
        <div className="md:hidden absolute inset-0 h-full w-full">
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />
        </div>
        {/* Desktop: inset card */}
        <div className="hidden md:block relative w-full min-h-[calc(100dvh-3rem)] rounded-3xl overflow-hidden border border-black/8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/15 to-black/50" />
        </div>

        <div className="md:hidden relative z-10 flex h-full min-h-dvh flex-col justify-end px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24">
          <h2 className="font-display font-bold text-3xl text-white leading-tight mb-2">{slide.title}</h2>
          <p className="font-sans text-sm text-white/80 leading-relaxed mb-6">{slide.sub}</p>
          {dots}
          <button type="button" onClick={next} className="btn-primary">
            {ctaLabel}
          </button>
        </div>
      </div>

      <div className="hidden md:flex min-w-0 flex-col justify-center px-4 lg:px-8 py-8 lg:py-10 w-full max-w-[34rem] mx-auto lg:max-w-[36rem] lg:mx-0 lg:pr-10">
        <h2 className="font-display font-bold text-3xl lg:text-4xl text-brand-text-primary leading-[1.15] mb-4">
          {slide.title}
        </h2>
        <p className="font-sans text-base lg:text-lg text-brand-text-secondary leading-[1.45] mb-9 max-w-[32rem]">
          {slide.sub}
        </p>
        {dots}
        <div className="max-w-md w-full">
          <button type="button" onClick={next} className="btn-primary">
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
