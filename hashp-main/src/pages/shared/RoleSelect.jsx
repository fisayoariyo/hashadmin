import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP — split panel  (hidden on mobile via `hidden md:flex`)
// Matches the Select Role design screen exactly.
// ─────────────────────────────────────────────────────────────────────────────
function DesktopRoleSelect() {
  const navigate = useNavigate();
  // Farmer is pre-selected per design
  const [selected, setSelected] = useState("farmer");

  const handleContinue = () => {
    if (selected === "farmer") navigate("/farmer/verify");
    else navigate("/agent/create-account");
  };

  return (
    <div className="hidden md:flex min-h-dvh bg-white p-5 lg:p-6 gap-5 lg:gap-6">

      {/* ── LEFT: hero photo card ─────────────────────────────── */}
      {/*
        Same image as Login screen 1 (farmer-1.jpg = woman with
        leaves/basket on head).
      */}
      <div className="relative w-[45%] shrink-0 rounded-3xl overflow-hidden">
        <img
          src={selected === "agent" ? "/onboarding/agent-onboard1.png" : "/onboarding/farmer-1.jpg"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* dark gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* brand block */}
        <div className="absolute bottom-8 left-8 right-8 lg:bottom-10 lg:left-10 lg:right-10">
          {/*
            block + max-w-[200px]: prevents the inline-baseline white-line
            artefact under the logo PNG.
          */}
          <img
            src="/brand/HFEI_Primary_Logo_White.png"
            alt="HFEI by Hashmar Cropex Ltd"
            className="block h-10 w-auto max-w-[200px] object-contain object-left mb-4"
            draggable="false"
          />
          <h2 className="font-display font-bold text-[1.85rem] lg:text-[2.1rem] text-white leading-tight mb-2">
            Welcome to your Farmer Profile
          </h2>
          <p className="font-sans text-base lg:text-[1.05rem] text-white/85 leading-snug">
            You now have a digital identity that helps you access support,
            loans, and better opportunities.
          </p>
        </div>
      </div>

      {/* ── RIGHT: role selection ──────────────────────────────── */}
      {/*
        justify-between: heading+cards sit at the top,
        Continue button pins to the bottom.
      */}
      <div className="flex-1 flex flex-col justify-between py-14 lg:py-16 px-6 lg:px-14 xl:px-20">

        {/* top: title + subtitle + role cards */}
        <div className="flex flex-col items-center w-full">
          <h1 className="font-display font-bold text-[2rem] lg:text-[2.3rem] text-brand-text-primary text-center mb-3">
            Get Started
          </h1>
          <p className="font-sans text-sm text-brand-text-secondary text-center leading-relaxed mb-10 max-w-xs">
            Tell us how you'll be using Hashmar, Tap the card that best
            describes your role
          </p>

          {/* ── Role cards ── */}
          <div className="grid grid-cols-2 gap-5 w-full max-w-[520px]">

            {/* Farmer card */}
            <button
              type="button"
              onClick={() => setSelected("farmer")}
              className={`flex-1 rounded-xl overflow-hidden text-left transition-all duration-200
                ${selected === "farmer"
                  ? "border-2 border-brand-green shadow-md"
                  : "border border-gray-200 shadow-sm"
                }`}
            >
              {/* photo — upper ~75% of card */}
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src="/onboarding/farmer-2.png"
                  alt="Farmer"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* label — lower ~25% */}
              <div
                className={`py-4 text-center font-sans font-medium text-sm transition-colors
                  ${selected === "farmer"
                    ? "bg-brand-green text-white"
                    : "bg-white text-brand-text-primary"
                  }`}
              >
                Farmer
              </div>
            </button>

            {/* Agent card */}
            <button
              type="button"
              onClick={() => setSelected("agent")}
              className={`flex-1 rounded-xl overflow-hidden text-left transition-all duration-200
                ${selected === "agent"
                  ? "border-2 border-brand-green shadow-md"
                  : "border border-gray-200 shadow-sm"
                }`}
            >
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src="/onboarding/agent-1.png"
                  alt="Agent"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`py-4 text-center font-sans font-medium text-sm transition-colors
                  ${selected === "agent"
                    ? "bg-brand-green text-white"
                    : "bg-white text-brand-text-primary"
                  }`}
              >
                Agent
              </div>
            </button>

          </div>
        </div>

        {/* bottom: Continue button — full-width green pill */}
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary w-full max-w-[520px] self-center"
        >
          Continue
        </button>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE — existing card layout, unchanged  (hidden on md+ via `md:hidden`)
// ─────────────────────────────────────────────────────────────────────────────
function MobileRoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="md:hidden min-h-dvh w-full flex items-center justify-center bg-brand-bg-page px-4 py-8">
      <div className="w-full max-w-role bg-white rounded-3xl shadow-card-lg px-6 py-10 sm:px-10 sm:py-14 flex flex-col items-center gap-8">

        {/* Logo */}
        <img
          src="/brand/HFEI_Primary_Logo_.png"
          alt="HFEI by Hashmar Cropex Ltd"
          className="block h-14 w-auto object-contain"
          draggable="false"
        />

        {/* Tagline */}
        <p className="font-sans text-base text-brand-text-secondary text-center leading-relaxed max-w-sm">
          Empowering Farmers, Enabling Growth
        </p>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="font-sans text-xs text-brand-text-muted uppercase tracking-widest">
            Select your role
          </span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        {/* Role buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/farmer/splash")}
            className="flex-1 flex flex-col items-center gap-3 bg-brand-green text-white rounded-2xl px-6 py-6 hover:bg-brand-green-dark active:scale-[0.97] transition-all duration-200 shadow-card"
          >
            <span className="text-4xl select-none">🌾</span>
            <div className="text-center">
              <p className="font-display font-bold text-lg leading-tight">I am a Farmer</p>
              <p className="font-sans text-white/75 text-xs mt-1 leading-snug">
                View your digital ID, farms and profile
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/agent/splash")}
            className="flex-1 flex flex-col items-center gap-3 bg-brand-amber text-white rounded-2xl px-6 py-6 hover:brightness-95 active:scale-[0.97] transition-all duration-200 shadow-card"
          >
            <span className="text-4xl select-none">🪪</span>
            <div className="text-center">
              <p className="font-display font-bold text-lg leading-tight">I am an Agent</p>
              <p className="font-sans text-white/75 text-xs mt-1 leading-snug">
                Register farmers and manage records
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="font-sans text-xs text-brand-text-muted text-center mt-2">
          Hashmar CropEx Limited · Verified Farmer Identity Platform
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// Both render in DOM — CSS controls which is visible at each breakpoint.
// ─────────────────────────────────────────────────────────────────────────────
export default function RoleSelect() {
  return (
    <>
      <MobileRoleSelect />
      <DesktopRoleSelect />
    </>
  );
}
