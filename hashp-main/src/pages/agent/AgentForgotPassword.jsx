import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import AgentFormFeedback from "../../components/agent/AgentFormFeedback";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { sendOtp } from "../../services/cropexApi";

export default function AgentForgotPassword() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await sendOtp(normalized);
      navigate("/agent/verify-phone", { state: { mode: "reset-password", phone: normalized } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send the reset code.");
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <div className="space-y-4 w-full">
      <p className="font-sans text-sm text-brand-text-secondary">
        Enter your registered phone number. We&apos;ll send a verification code to continue.
      </p>
      {error && <AgentFormFeedback variant="error">{error}</AgentFormFeedback>}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Phone Number</label>
        <div className="flex items-center bg-white border border-brand-border rounded-2xl px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all">
          <Phone size={18} className="text-brand-text-muted shrink-0" />
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleContinue()}
            placeholder="Input your phone number here"
            className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  const actions = (
    <div className="space-y-3 w-full">
      <button
        type="button"
        onClick={() => void handleContinue()}
        disabled={loading || phone.replace(/\D/g, "").length < 10}
        className="btn-primary w-full"
      >
        {loading ? "Sending code..." : "Continue"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/agent/login")}
        className="w-full py-4 rounded-3xl bg-gray-100 text-brand-green font-sans font-semibold text-sm"
      >
        Back to log in
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        title="Reset password"
        subtitle="We'll text a code to your registered number."
        actions={actions}
      >
        {formBody}
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-6">
        <button type="button" onClick={() => navigate("/agent/login")} className="flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-3xl text-brand-text-primary mb-2">Reset password</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-8">
          We&apos;ll text a code to your registered number.
        </p>
        {formBody}
      </div>
      <div className="px-5 pb-8">{actions}</div>
    </div>
  );
}
