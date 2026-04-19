import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, CircleX } from "lucide-react";
import cardPattern from "@/assets/comps/card-pattern-desktop.svg";
import { getAdminAgentVerificationDetail } from "@/mockData/adminAgentVerification";

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[16px] border border-[#e4e4e4] bg-white p-5 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${cardPattern})`,
          backgroundSize: "160% auto",
          backgroundPosition: "50% 20%",
        }}
      />
      <div className="relative z-10">
        <h3 className="mb-4 font-sans text-sm font-medium text-brand-text-muted">{title}</h3>
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

function DetailLine({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <p className="font-sans text-sm leading-relaxed text-brand-text-secondary">
      <span className="font-normal">{label}</span>{" "}
      <span className={`font-semibold text-brand-text-primary ${valueClassName ?? ""}`}>{value}</span>
    </p>
  );
}

export default function AdminAgentVerificationDetailPage() {
  const { verificationId = "" } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  const detail = getAdminAgentVerificationDetail(decodeURIComponent(verificationId));

  if (!detail) {
    return (
      <div className="rounded-[20px] border border-[#e4e4e4] bg-white p-8 text-center">
        <p className="font-sans text-sm text-brand-text-secondary">Agent verification record not found.</p>
        <button
          type="button"
          onClick={() => navigate("/agent-verification")}
          className="mt-4 font-sans text-sm font-semibold text-[#03624D] hover:underline"
        >
          Back to Agent Verification
        </button>
      </div>
    );
  }

  const statusClass =
    detail.status === "verified" ? "font-semibold text-emerald-600" : "font-semibold text-orange-600";

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="flex items-center gap-2 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
          <button
            type="button"
            onClick={() => navigate("/agent-verification")}
            className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
            aria-label="Back to Agent Verification"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          Agent Verification Details
        </h2>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e4e4] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-brand-text-primary transition hover:bg-[#fafafa]"
          >
            Reject
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white">
              <CircleX size={18} className="text-red-500" strokeWidth={1.9} />
            </span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
          >
            Approve
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40">
              <BadgeCheck size={18} className="text-white" strokeWidth={1.9} />
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <InfoCard title="Personal information">
          <DetailLine label="Full Name :" value={detail.name} />
          <DetailLine label="Phone number :" value={detail.phone} />
          <DetailLine label="Email :" value={detail.email} />
          <DetailLine label="Registration date :" value={detail.registrationDate} />
          <DetailLine label="Gender :" value={detail.gender} />
          <p className="font-sans text-sm leading-relaxed text-brand-text-secondary">
            <span className="font-normal">Status :</span>{" "}
            <span className={statusClass}>{detail.status === "verified" ? "Verified" : "Pending"}</span>
          </p>
        </InfoCard>

        <InfoCard title="Assigned Location">
          <DetailLine label="State :" value={detail.state} />
          <DetailLine label="Local Government :" value={detail.lga} />
        </InfoCard>
      </div>
    </div>
  );
}
