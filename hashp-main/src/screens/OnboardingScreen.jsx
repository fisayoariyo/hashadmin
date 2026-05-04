import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    title: "Welcome to\nyour Farmer Profile",
    subtitle:
      "You now have a digital identity that helps you access support, loans, and better opportunities.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    title: "Your Identity\nMatters",
    subtitle:
      "Your Farmer ID makes you visible and verified. It helps you access financial services, insurance, and government support.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80",
    title: "Access More\nwith Ease",
    subtitle:
      "View your profile, get farming support, access markets, and explore opportunities all in one place.",
  },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const goNext = () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      navigate(ROUTES.VERIFY);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0 && current < slides.length - 1) setCurrent((c) => c + 1);
      if (dx > 0 && current > 0) setCurrent((c) => c - 1);
    }
    touchStartX.current = null;
  };

  const slide = slides[current];

  return (
    <div
      className="relative h-dvh w-full max-w-sm mx-auto overflow-hidden bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={slide.id}
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: 0.85 }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10">
        <h1 className="font-display font-bold text-[2rem] leading-tight text-white mb-3 whitespace-pre-line">
          {slide.title}
        </h1>
        <p className="font-sans text-white/80 text-sm leading-relaxed mb-8">
          {slide.subtitle}
        </p>

        <button
          onClick={goNext}
          className="w-full bg-brand-green text-white font-display font-semibold text-base py-4 rounded-3xl mb-6 active:brightness-90 transition-all"
        >
          Login
        </button>

        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-brand-amber"
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
