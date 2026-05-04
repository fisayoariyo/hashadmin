import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CircleX, ExternalLink, MapPin, Pencil } from "lucide-react";
import { getAdminAgentDetail } from "@/mockData/adminAgents";

const cardClass =
  "rounded-2xl border border-[#E8E8E8] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function CardSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-5 font-sans text-sm font-medium leading-5 text-[#9B9B9B]">{children}</h3>;
}

function FieldRow({
  label,
  value,
  shaded = false,
  valueClassName = "font-normal text-brand-text-primary",
}: {
  label: string;
  value: string;
  shaded?: boolean;
  valueClassName?: string;
}) {
  return (
    <p
      className={`rounded-xl px-3 py-2.5 font-sans text-[15px] leading-[22px] ${
        shaded ? "bg-[#fafafa]" : "bg-white"
      }`}
    >
      <span className="font-semibold text-brand-text-primary">{label} : </span>
      <span className={valueClassName}>{value}</span>
    </p>
  );
}

function stateDisplay(state: string) {
  const s = state.trim();
  if (/state$/i.test(s)) return s;
  return `${s} state`;
}

export default function AdminAgentDetailPage() {
  const { agentId = "" } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(agentId);
  const agent = getAdminAgentDetail(id);

  if (!agent) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Agent not found.</p>
          <button
            type="button"
            onClick={() => navigate("/agents")}
            className="mt-4 font-sans text-[15px] font-semibold text-[#03624D] hover:underline"
          >
            Back to Agent Management
          </button>
        </div>
      </div>
    );
  }

  const statusValueClass =
    agent.verificationLabel === "Verified"
      ? "font-medium text-emerald-700"
      : agent.verificationLabel === "Pending"
        ? "font-medium text-amber-700"
        : "font-medium text-brand-text-muted";

  const outlineBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5";
  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]";

  const agentBase = `/agents/${encodeURIComponent(agent.agentId)}`;

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
          <button
            type="button"
            onClick={() => navigate("/agents")}
            className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
            aria-label="Back to Agent Management"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          Agent Details
        </h2>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button type="button" className={outlineBtn} onClick={() => navigate(`${agentBase}/deactivate`)}>
            Deactivate agent
            <CircleX size={18} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className={outlineBtn}
            onClick={() => navigate(`${agentBase}/reassign-location`)}
          >
            Reassign location
            <MapPin size={18} strokeWidth={1.9} />
          </button>
          <button type="button" className={primaryBtn} onClick={() => navigate(`${agentBase}/edit`)}>
            Edit Details
            <Pencil size={18} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <img
        src={agent.avatarUrl}
        alt=""
        className="h-[100px] w-[100px] shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]"
      />

      <div className="space-y-6">
        <section className={cardClass}>
          <CardSectionTitle>Personal information</CardSectionTitle>
          <div className="space-y-4">
            <FieldRow label="Full Name" value={agent.name} />
            <FieldRow label="Phone number" value={agent.phone} shaded />
            <FieldRow label="Email" value={agent.email} />
            <FieldRow label="Registration date" value={agent.registrationDate} shaded />
            <FieldRow label="Gender" value={agent.gender} />
            <FieldRow
              label="Status"
              value={agent.verificationLabel}
              shaded
              valueClassName={statusValueClass}
            />
          </div>
        </section>

        <section className={cardClass}>
          <CardSectionTitle>Assigned Location</CardSectionTitle>
          <div className="space-y-4">
            <FieldRow label="State" value={stateDisplay(agent.state)} />
            <FieldRow label="Local Government" value={agent.lga} shaded />
          </div>
        </section>

        <section className={cardClass}>
          <CardSectionTitle>Performance</CardSectionTitle>
          <div className="space-y-4">
            <FieldRow label="Total farmers registered" value={agent.farmersOnboarded} />
            <FieldRow label="Last sync" value={agent.lastSync} shaded />
            <FieldRow label="Last active" value={agent.lastActive} />
          </div>
          <button
            type="button"
            onClick={() => navigate(`${agentBase}/enrolled-farmers`)}
            className="mt-6 inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-[#03624D] hover:underline"
          >
            View Registered Farmers
            <ExternalLink size={17} strokeWidth={2} className="shrink-0 opacity-90" />
          </button>
        </section>
      </div>
    </div>
  );
}
