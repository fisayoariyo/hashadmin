import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CircleX, Pencil } from "lucide-react";
import DeactivateAgentConfirmModal from "@/components/admin/DeactivateAgentConfirmModal";
import { getAdminAgentDetail } from "@/mockData/adminAgents";

export default function AdminAgentDeactivatePage() {
  const { agentId = "" } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(agentId);
  const agent = getAdminAgentDetail(id);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const back = `/agents/${encodeURIComponent(agent.agentId)}`;

  return (
    <div className="w-full space-y-6 pb-4">
      <DeactivateAgentConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          navigate("/agents");
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
          <button
            type="button"
            onClick={() => navigate(back)}
            className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
            aria-label="Back to Agent Details"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          Deactivate Agent
        </h2>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#03624D] px-6 py-3 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99] sm:self-auto"
        >
          Deactivate Agent
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/35">
            <CircleX size={18} className="text-white" strokeWidth={1.9} />
          </span>
        </button>
      </div>

      <section className="rounded-[20px] border border-[#e4e4e4] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6">
          <h3 className="font-sans text-sm font-medium text-[#9B9B9B]">Reason for deactivation</h3>
          <p className="mt-4 font-sans text-sm font-semibold text-brand-text-primary">
            Why are you deactivating this agent?
          </p>
          <div className="relative mt-3">
            <Pencil
              size={18}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-4 top-4 text-brand-text-muted"
              aria-hidden
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={8}
              placeholder="Enter your text here"
              className="min-h-[200px] w-full resize-y rounded-2xl border border-[#e4e4e4] bg-white py-3.5 pl-12 pr-4 font-sans text-sm text-brand-text-primary outline-none transition placeholder:text-brand-text-muted focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D]"
              aria-label="Reason for deactivating this agent"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
