import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { ROUTES } from "../constants/routes";

// TODO: Replace with API call from src/services/api.js
import { getFarmerByPhone } from "../services/api";

export default function VerifyScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleContinue = async () => {
    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await getFarmerByPhone(phone.trim());
      navigate(ROUTES.OTP, {
        state: { phone: phone.trim(), farmerID: result.farmerID, from },
      });
    } catch {
      setError("No farmer profile found for this number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container bg-white">
      <div className="flex-1 flex flex-col px-6 pt-16">
        <h1 className="font-display font-bold text-[2rem] leading-tight text-brand-text-primary mb-10">
          Login to your farmer profile
        </h1>

        <div className="mb-6">
          <p className="font-sans text-sm font-medium text-brand-text-primary mb-2">
            Phone Number
          </p>
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all">
            <Smartphone size={18} className="text-brand-text-secondary shrink-0" />
            <div className="w-px h-5 bg-brand-border" />
            <span className="text-sm text-brand-text-secondary font-sans shrink-0">+234</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Input your phone number here"
              className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Continue"}
        </button>
        <button
          onClick={() => navigate(ROUTES.ONBOARD)}
          className="w-full text-center text-brand-green font-sans text-sm py-2"
        >
          I do not have an account
        </button>
      </div>
    </div>
  );
}
