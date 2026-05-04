import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { getAgentSession } from "../../services/cropexApi";

const REG_KEY = "hcx_agent_registration";

export default function AgentAccountVerified() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(REG_KEY) || !getAgentSession()?.accessToken) {
        navigate("/agent/login", { replace: true });
      }
    } catch {
      navigate("/agent/login", { replace: true });
    }
  }, [navigate]);

  const goDashboard = () => {
    try {
      sessionStorage.removeItem(REG_KEY);
    } catch {
      /* ignore */
    }
    navigate("/agent/home");
  };

  const iconBlock = (
    <div className="w-28 h-28 rounded-full bg-brand-green/15 flex items-center justify-center mb-6 shadow-inner">
      <BadgeCheck className="w-16 h-16 text-brand-green" strokeWidth={2} />
    </div>
  );

  const body = (
    <>
      {iconBlock}
      <p className="font-sans text-sm text-brand-text-primary max-w-md">
        You can now start registering farmers and using all features of the app.
      </p>
    </>
  );

  const actions = (
    <button type="button" onClick={goDashboard} className="btn-primary w-full max-w-sm">
      Go to Dashboard
    </button>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        centerTitle
        title="You're Verified"
        subtitle="Your account has been successfully verified."
        actions={actions}
      >
        <div className="flex flex-col items-center">{body}</div>
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-6 flex flex-col items-center text-center">
        <button type="button" onClick={() => navigate("/agent/account-under-review")} className="self-start flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-2">You&apos;re Verified</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-6">Your account has been successfully verified.</p>
        {body}
      </div>
      <div className="px-5 pb-8 flex justify-center">{actions}</div>
    </div>
  );
}
