import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTES.ONBOARD);
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative h-dvh w-full max-w-sm mx-auto overflow-hidden bg-black">
      <img
        src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80"
        alt="Farm rows"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-2xl border-2 border-white/80 flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16"
            >
              <path
                d="M40 8 L68 24 L68 56 L40 72 L12 56 L12 24 Z"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
              />
              <ellipse cx="40" cy="40" rx="14" ry="18" stroke="white" strokeWidth="2" fill="none" />
              <path d="M40 22 Q50 35 40 58" stroke="white" strokeWidth="2" fill="none" />
              <path d="M40 22 Q30 35 40 58" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="52" cy="32" r="3" fill="white" />
              <path d="M52 32 Q56 28 60 30" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="font-display font-black text-4xl text-white tracking-widest uppercase">
              HASHMAR
            </h1>
            <p className="font-display font-light text-white/90 text-sm tracking-[0.3em] uppercase mt-1">
              CROPEX LIMITED
            </p>
          </div>
        </div>

        <div className="absolute bottom-16 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <div
            className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    </div>
  );
}
