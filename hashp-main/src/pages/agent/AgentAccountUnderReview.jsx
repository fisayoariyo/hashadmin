import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { getAgentDashboard, getAgentSession } from "../../services/cropexApi";

const REG_KEY = "hcx_agent_registration";

export default function AgentAccountUnderReview() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(REG_KEY);
      const session = getAgentSession();
      if (!raw) {
        navigate("/agent/create-account", { replace: true });
        return;
      }
      const reg = JSON.parse(raw);
      if (!reg.state || !reg.lga) {
        navigate("/agent/select-location", { replace: true });
        return;
      }
      if (!session?.accessToken) {
        navigate("/agent/verify-phone", { replace: true, state: { mode: "register" } });
      }
    } catch {
      navigate("/agent/create-account", { replace: true });
    }
  }, [navigate]);

  const handleRefresh = async () => {
    setLoading(true);
    setToast("");
    try {
      const payload = await getAgentDashboard();
      if (payload?.agent?.is_active === true) {
        navigate("/agent/account-verified");
        return;
      }
      setToast("Still under review. An administrator must verify your account before you can use the app.");
    } catch (refreshError) {
      setToast(refreshError instanceof Error ? refreshError.message : "Could not refresh your review status.");
    } finally {
      setLoading(false);
    }
  };

  const iconBlock = (
    <div className="w-28 h-28 rounded-full bg-brand-amber/20 flex items-center justify-center mb-6">
      <BadgeCheck className="w-16 h-16 text-brand-amber" strokeWidth={1.5} />
    </div>
  );

  const body = (
    <>
      {iconBlock}
      <p className="font-sans text-sm text-brand-text-primary max-w-md mb-2">
        You will be able to start registering farmers once your account is verified.
      </p>
      <p className="font-sans text-xs text-brand-text-secondary max-w-md mb-6">
        This usually takes a short while. We will notify you once an administrator has approved your application.
      </p>
      {toast && (
        <p className="font-sans text-sm text-brand-amber font-medium max-w-md mb-4" role="status">
          {toast}
        </p>
      )}
    </>
  );

  const actions = (
    <div className="space-y-3 w-full max-w-sm">
      <button
        type="button"
        onClick={() => void handleRefresh()}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Checking..." : "Refresh status"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/agent/contact-support", { state: { preAuth: true, from: "under-review" } })}
        className="w-full py-4 rounded-3xl border-2 border-brand-border text-brand-green font-sans font-semibold text-sm"
      >
        Contact support
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        centerTitle
        title="Account Under Review"
        subtitle="Your details have been submitted successfully and are currently being reviewed."
        actions={actions}
      >
        <div className="flex flex-col items-center">{body}</div>
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-6 flex flex-col items-center text-center">
        <button type="button" onClick={() => navigate("/agent/select-location")} className="self-start flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-2">Account Under Review</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-6 max-w-sm">
          Your details have been submitted successfully and are currently being reviewed.
        </p>
        {body}
      </div>
      <div className="px-5 pb-8">{actions}</div>
    </div>
  );
}
