import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const REG_KEY = "hcx_agent_registration";

export default function AgentVerificationFailed() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const retry = () => {
    sessionStorage.removeItem(REG_KEY);
    sessionStorage.removeItem("hcx_agent_review_refresh_count");
    sessionStorage.removeItem("hcx_agent_auth");
    navigate("/agent/create-account");
  };

  const body = (
    <>
      <div className="w-28 h-28 rounded-full bg-red-500/15 flex items-center justify-center mb-6">
        <XCircle className="w-16 h-16 text-red-500" strokeWidth={2} />
      </div>
      <p className="font-sans text-sm text-brand-text-primary max-w-md mb-2">
        We were unable to verify your account with the details provided. This may be due to incorrect or incomplete information.
      </p>
      <p className="font-sans text-xs text-brand-text-secondary max-w-md">
        Please review your details and try again. If you believe this is an error, contact support for assistance.
      </p>
    </>
  );

  const actions = (
    <div className="space-y-3 w-full max-w-sm">
      <button type="button" onClick={retry} className="btn-primary w-full">
        Retry verification
      </button>
      <button
        type="button"
        onClick={() => navigate("/agent/contact-support", { state: { preAuth: true, from: "verification-failed" } })}
        className="w-full py-4 rounded-3xl bg-gray-100 text-brand-green font-sans font-semibold text-sm"
      >
        Contact support
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        centerTitle
        title="Verification Failed"
        subtitle="We could not verify your account."
        actions={actions}
      >
        <div className="flex flex-col items-center">{body}</div>
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-6 flex flex-col items-center text-center">
        <button type="button" onClick={() => navigate("/agent/login")} className="self-start flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} /><span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-2">Verification Failed</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-6">We could not verify your account.</p>
        {body}
      </div>
      <div className="px-5 pb-8">{actions}</div>
    </div>
  );
}
