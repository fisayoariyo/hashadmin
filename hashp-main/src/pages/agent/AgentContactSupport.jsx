import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import AgentDesktopShell from "../../components/agent/AgentDesktopShell";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import { AgentBottomNav } from "./AgentHome";
import { agentSupportContact } from "../../mockData/agent";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { createSupportTicket, getAgentDashboard, getAgentSession } from "../../services/cropexApi";

export default function AgentContactSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [issueType, setIssueType] = useState("Profile Update");
  const [farmerId, setFarmerId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [agentProfile, setAgentProfile] = useState(null);

  const session = getAgentSession();
  const hasAuthSession = Boolean(session);
  const isPreAuthSupport = Boolean(location.state?.preAuth) || !hasAuthSession;
  const goBackPath =
    location.state?.from === "under-review"
      ? "/agent/account-under-review"
      : location.state?.from === "verification-failed"
        ? "/agent/verification-failed"
        : "/agent/login";

  useEffect(() => {
    if (!hasAuthSession) return undefined;
    let active = true;
    getAgentDashboard()
      .then((payload) => {
        if (active) setAgentProfile(payload?.agent || null);
      })
      .catch(() => {
        if (active) setAgentProfile(null);
      });
    return () => {
      active = false;
    };
  }, [hasAuthSession]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!issueDescription.trim()) {
      setFeedback({ type: "error", message: "Please describe the issue." });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await createSupportTicket({
        issue_type: issueType,
        description: issueDescription.trim(),
        farmer_id: farmerId.trim() || undefined,
      });
      setIssueDescription("");
      setFarmerId("");
      setFeedback({ type: "success", message: "Support ticket submitted successfully." });
    } catch (submitError) {
      setFeedback({
        type: "error",
        message: submitError instanceof Error ? submitError.message : "Could not submit support ticket.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="w-full md:max-w-[862.81px]">
      <h1 className="font-display text-[40px] md:text-[40px] font-bold leading-[48px] text-[#030F0F]">
        Help &amp; Support
      </h1>
      <p className="mt-2 max-w-[760px] text-[14px] leading-[20px] text-[#030F0F]/80">
        Having issues on the field? Reach out to the Hashmar support team for support with farmer
        registration, your profile, or any other concerns.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-[760px]">
        {feedback.message && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <label className="block">
            <span className="mb-2 block text-[28px] md:text-[20px] font-bold leading-6 text-[#030F0F]">
              Type of issue
            </span>
            <div className="relative">
              <select
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-[15px] border border-[#E6E6E6] bg-white px-4 pr-10 text-[14px] text-[#030F0F] outline-none focus:border-[#03624D]"
              >
                <option>Profile Update</option>
                <option>Farmer Sync Issue</option>
                <option>Registration Issue</option>
                <option>Login Issue</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#030F0F]/60">
                &#9662;
              </span>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[28px] md:text-[20px] font-bold leading-6 text-[#030F0F]">
              Farmer ID
            </span>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#030F0F]/55" />
              <input
                value={farmerId}
                onChange={(event) => setFarmerId(event.target.value)}
                placeholder="Enter farmer ID"
                className="h-[52px] w-full rounded-[15px] border border-[#E6E6E6] bg-white pl-10 pr-4 text-[14px] text-[#030F0F] outline-none placeholder:text-[#030F0F]/40 focus:border-[#03624D]"
              />
            </div>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-[28px] md:text-[20px] font-bold leading-6 text-[#030F0F]">
            Issue description
          </span>
          <textarea
            value={issueDescription}
            onChange={(event) => setIssueDescription(event.target.value)}
            placeholder="Description of the issue"
            className="h-[153px] w-full resize-none rounded-[15px] border border-[#E6E6E6] bg-white px-4 py-3 text-[14px] text-[#030F0F] outline-none placeholder:text-[#030F0F]/40 focus:border-[#03624D]"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 inline-flex h-[47px] w-[187px] items-center justify-center rounded-[15px] bg-[#03624D] text-[20px] font-medium leading-6 text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="mt-8 w-full max-w-[520px] rounded-[20px] bg-[#FFFFFF] p-5">
        <p className="text-[14px] leading-6 text-[#030F0F]">
          If you experience network issues, contact Hashmar support directly at these phone numbers.
        </p>
        <div className="mt-4 space-y-3 text-[14px] leading-5 text-[#030F0F]">
          <p className="flex items-center gap-2">
            <User size={14} className="text-[#030F0F]" />
            <span>
              Agent Name: {agentProfile?.full_name || session?.fullName || session?.full_name || "Unavailable"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Phone size={14} className="text-[#030F0F]" />
            <span>
              Phone Number: {agentProfile?.phone_number || session?.phone || "Unavailable"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  const preAuthContent = (
    <div className="w-full max-w-[430px]">
      <h1 className="font-display text-[44px] font-bold leading-[1.05] text-[#030F0F]">Need Help?</h1>
      <p className="mt-3 text-[18px] leading-[1.35] text-[#030F0F]/70">
        We&apos;re here to support you. Reach out to us if you&apos;re having any issues with registration,
        verification, or syncing data.
      </p>

      <div className="mt-8 rounded-[14px] border border-[#E6E6E6] bg-white p-4">
        <p className="font-display text-[24px] font-bold leading-7 text-[#030F0F]">Customer Support</p>
        <p className="mt-1 text-[14px] leading-5 text-[#030F0F]/75">Get help from our support team</p>

        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-2.5 text-[18px] text-[#030F0F]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand-green text-white">
              <Phone size={14} />
            </span>
            <span>{agentSupportContact.phoneDisplay}</span>
          </p>
          <p className="flex items-center gap-2.5 text-[18px] text-[#030F0F]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand-green text-white">
              <Mail size={14} />
            </span>
            <span>{agentSupportContact.email}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`md:hidden min-h-dvh ${isPreAuthSupport ? "bg-white" : "bg-brand-bg-page"}`}>
        <div className="px-4 pt-5 pb-28">
          <button
            type="button"
            onClick={() => navigate(isPreAuthSupport ? goBackPath : -1)}
            className="mb-4 text-sm text-[#030F0F]/70"
          >
            Back
          </button>
          {isPreAuthSupport ? preAuthContent : content}
        </div>
        {!isPreAuthSupport && <AgentBottomNav />}
      </div>

      {isDesktop &&
        (isPreAuthSupport ? (
          <AgentAuthDesktopLayout title="" subtitle="" leading={null} actions={null}>
            <div className="w-full">
              <button
                type="button"
                onClick={() => navigate(goBackPath)}
                className="mb-4 inline-flex items-center gap-2 text-sm text-brand-text-secondary"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              {preAuthContent}
            </div>
          </AgentAuthDesktopLayout>
        ) : (
          <AgentDesktopShell active="support">{content}</AgentDesktopShell>
        ))}
    </>
  );
}
