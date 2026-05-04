import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { agentOnboardingSlides } from "../../mockData/agent";

export default function AgentOnboarding({ onDone }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const touchX = useRef(null);
  const slide = agentOnboardingSlides[idx];
  const isLast = idx === agentOnboardingSlides.length - 1;

  const next = () => {
    if (isLast) navigate("/agent/create-account");
    else setIdx((i) => i + 1);
  };

  const skip = () => navigate("/agent/create-account");

  const dots = (
    <div className="flex gap-2 items-center">
      {agentOnboardingSlides.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= idx ? "w-8 bg-[#005646]" : "w-4 bg-[#dce8e2]"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className="w-full flex flex-col bg-white overflow-hidden"
      style={{ height: "100dvh" }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) next();
        else if (dx > 50 && idx > 0) setIdx((i) => i - 1);
        touchX.current = null;
      }}
    >
      {/* ── MOBILE ── */}
      <div className="md:hidden w-full max-w-[480px] mx-auto flex flex-col h-full px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">

        {/* dots + skip */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          {dots}
          {!isLast ? (
            <button type="button" onClick={skip} className="font-sans text-[#005646] text-base font-medium">
              Skip
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {/* image — fixed height, fills most of screen */}
        <div className="rounded-[1.75rem] overflow-hidden shrink-0" style={{ height: "48vh" }}>
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* copy */}
        <div className="mt-5 shrink-0">
          <h2 className="font-display font-bold text-[1.6rem] leading-[1.2] text-[#005646] mb-2">
            {slide.title}
          </h2>
          <p className="font-sans text-sm leading-relaxed text-[#404040]">
            {slide.sub}
          </p>
        </div>

        {/* CTA — pushed to bottom */}
        <div className="mt-auto shrink-0">
          <button
            type="button"
            onClick={next}
            className="w-full py-5 rounded-[1.5rem] bg-[#005646] text-white font-sans font-semibold text-lg"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </div>

      {/* ── DESKTOP left ── */}
      <div className="hidden md:grid md:grid-cols-2 w-full h-full px-6 py-6 gap-6">
        <div className="relative rounded-3xl overflow-hidden border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/15 to-black/50" />
        </div>

        {/* ── DESKTOP right ── */}
        <div className="flex flex-col justify-center px-4 lg:px-8 py-8">
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-brand-text-primary leading-tight mb-4">
            {slide.title}
          </h2>
          <p className="font-sans text-lg lg:text-xl text-brand-text-secondary leading-relaxed mb-10 max-w-lg">
            {slide.sub}
          </p>
          {dots}
          <div className="max-w-md w-full mt-10">
            <button type="button" onClick={next} className="btn-primary">
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
