import { useEffect, useMemo, useState } from "react";
import { farmerOnboardingSlides } from "../../mockData/farmer";

const SLIDE_INTERVAL_MS = 4500;

export default function FarmerAuthDesktopLayout({
  title,
  subtitle,
  children,
  actions,
  centerTitle = false,
  leading = null,
  contentClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  actionsClassName = "",
  fixedImage = "",
}) {
  const slides = useMemo(() => farmerOnboardingSlides || [], []);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (fixedImage || slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [fixedImage, slides]);

  const activeSlide = slides[slideIndex] || {
    image: fixedImage,
    title: "Welcome to your Farmer Profile",
    sub: "You now have a digital identity that helps you access support, loans, and better opportunities.",
  };

  const heroImage = fixedImage || activeSlide.image;

  return (
    <div className="hidden md:grid md:grid-cols-2 md:min-h-dvh md:bg-white md:px-6 md:py-6 lg:px-8 lg:py-8 md:gap-6 lg:gap-8 md:items-stretch">
      <div className="flex min-w-0 min-h-0 items-stretch">
        <div className="relative w-full min-h-[calc(100dvh-3rem)] overflow-hidden rounded-3xl border border-black/8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
          <img
            key={heroImage}
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />

          <div className="absolute left-6 right-6 bottom-6 lg:left-8 lg:right-8 lg:bottom-8 text-white">
            <img
              src="/brand/HFEI_Primary_Logo_White.png"
              alt="HFEI by Hashmar Cropex Ltd"
              className="block h-11 w-auto object-contain mb-4"
              draggable="false"
            />
            <h2 className="font-display font-bold text-4xl xl:text-[2.6rem] leading-tight mb-2 max-w-[30rem]">
              {activeSlide.title}
            </h2>
            <p className="font-sans text-[0.95rem] lg:text-[1.05rem] text-white/90 leading-[1.35] max-w-[31rem]">
              {activeSlide.sub}
            </p>

            {!fixedImage && slides.length > 1 ? (
              <div className="mt-5 flex items-center gap-2">
                {slides.map((slide, index) => (
                  <span
                    key={`${slide.title}-${index}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === slideIndex ? "w-8 bg-white" : "w-3 bg-white/40"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`flex min-w-0 flex-col w-full justify-center py-4 lg:py-6 px-4 lg:px-8 max-w-[620px] mx-auto ${
          centerTitle ? "items-center text-center" : ""
        } ${contentClassName}`}
      >
        {leading}
        {title ? (
          <h1 className={`font-display font-bold text-[3rem] leading-[1.05] text-brand-text-primary mb-3 ${titleClassName}`}>
            {title}
          </h1>
        ) : null}
        {subtitle && (
          <p
            className={`font-sans text-xl text-brand-text-secondary mb-8 ${
              centerTitle ? "max-w-md" : ""
            } ${subtitleClassName}`}
          >
            {subtitle}
          </p>
        )}
        <div className={`flex-1 w-full ${centerTitle ? "flex flex-col items-center" : ""}`}>{children}</div>
        {actions && (
          <div
            className={`pt-6 w-full ${centerTitle ? "flex flex-col items-center max-w-[420px]" : ""} ${actionsClassName}`}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
