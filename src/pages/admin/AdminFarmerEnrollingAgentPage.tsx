import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CircleX, MapPinned, Pencil, UserRound } from "lucide-react";
import { getAdminEnrollingAgent } from "@/mockData/adminFarmers";

function DetailField({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <p className="font-sans text-sm leading-6 text-brand-text-primary">
      <span className="font-normal">{label} :</span>{" "}
      <span className="font-semibold">{value}</span>
    </p>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#f1f1f1] bg-white px-6 py-5">
      <h3 className="mb-4 font-sans text-[34px] font-normal leading-none text-[#bababa]">{title}</h3>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

export default function AdminFarmerEnrollingAgentPage() {
  const { farmerId = "" } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(farmerId);
  const agent = getAdminEnrollingAgent(id);
  const back = `/farmers/${encodeURIComponent(id)}`;

  if (!agent) {
    return (
      <div className="rounded-[20px] border border-[#e4e4e4] bg-white p-8 text-center">
        <p className="font-sans text-sm text-brand-text-secondary">Profile not found.</p>
        <button
          type="button"
          onClick={() => navigate(back)}
          className="mt-4 font-sans text-sm font-semibold text-[#03624D] hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
            <button
              type="button"
              onClick={() => navigate(back)}
              className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
              aria-label="Back to farmer"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            Enrolling Agent
          </h2>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfeceb] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5"
          >
            Deactivate agent
            <CircleX size={18} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfeceb] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5"
          >
            Reassign location
            <MapPinned size={18} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`${back}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
          >
            Edit Details
            <Pencil size={18} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="w-[170px]">
        <div className="h-[148px] w-full overflow-hidden rounded-2xl bg-[#e8eef5] ring-1 ring-[#e4e4e4]">
          {agent.photoUrl ? (
            <img src={agent.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-text-muted">
              <UserRound size={64} strokeWidth={1.2} />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <InfoCard title="Personal information">
          <DetailField label="Full Name" value={agent.fullName} />
          <DetailField label="Phone number" value={agent.phone} />
          <DetailField label="Email" value={agent.email} />
          <DetailField label="Registration date" value={agent.registrationDate} />
          <DetailField label="Gender" value={agent.gender} />
          <DetailField
            label="Status"
            value={
              <span className="inline-flex items-center rounded-md bg-[#e7f8f2] px-2 py-[1px] font-sans text-xs font-semibold text-[#158f65]">
                {agent.status}
              </span>
            }
          />
        </InfoCard>
        <InfoCard title="Assigned Location">
          <DetailField label="State" value={agent.state} />
          <DetailField label="Local Government" value={agent.lga} />
        </InfoCard>
        <InfoCard title="Performance">
          <DetailField label="Total farmers registered" value={agent.totalFarmersRegistered} />
          <DetailField label="Last sync" value={agent.lastSync} />
          <DetailField label="Last active" value={agent.lastActive} />
        </InfoCard>
      </div>
    </div>
  );
}
