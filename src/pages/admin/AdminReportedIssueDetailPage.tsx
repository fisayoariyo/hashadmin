import { useEffect, type ReactNode, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, SquareCheck } from "lucide-react";
import {
  getSupportTicketById,
  updateSupportTicketStatus,
  type AdminSupportTicketRow,
  type AdminSupportTicketStatus,
} from "@/lib/adminApi";

const cardClass =
  "rounded-2xl border border-[#E8E8E8] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
const cardBody = "font-sans text-[15px] leading-[22px]";
const labelCls = `${cardBody} font-normal text-brand-text-secondary`;
const valueInline = `${cardBody} font-semibold text-brand-text-primary`;

function IssueStatusBadge({ label, tone }: { label: string; tone: "amber" | "red" | "green" }) {
  const styles =
    tone === "amber"
      ? "bg-[#FFF8ED] text-[#C2410C]"
      : tone === "red"
        ? "bg-[#FEF2F2] text-[#B91C1C]"
        : "bg-[#ECFDF5] text-[#047857]";
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3.5 py-1.5 font-sans text-[13px] font-semibold leading-none ${styles}`}
    >
      {label}
    </span>
  );
}

function CardSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-5 font-sans text-sm font-medium leading-5 text-[#9B9B9B]">{children}</h3>;
}

function statusLabel(status: AdminSupportTicketStatus) {
  if (status === "In review") return "Pending";
  return status;
}

function ticketTone(status: AdminSupportTicketRow["status"]): "amber" | "red" | "green" {
  if (status === "Resolved") return "green";
  if (status === "In review") return "amber";
  return "red";
}

export default function AdminReportedIssueDetailPage() {
  const { issueId = "" } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(issueId);
  const [ticket, setTicket] = useState<AdminSupportTicketRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getSupportTicketById(id)
      .then((row) => {
        if (active) setTicket(row);
      })
      .catch((fetchError) => {
        if (active) {
          setTicket(null);
          setError(fetchError instanceof Error ? fetchError.message : "Could not load support ticket.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleMarkResolved = async () => {
    if (!ticket || ticket.status === "Resolved") return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateSupportTicketStatus(ticket.id, "Resolved");
      setTicket(updated);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not mark issue as resolved.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Loading support ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">
            {error || "Support ticket not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/reported-issues")}
            className="mt-4 font-sans text-[15px] font-semibold text-[#005F4A] hover:underline"
          >
            Back to Reported Issues
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const agentProfilePath =
    ticket.agentId && ticket.agentId !== "-"
      ? `/agents/${encodeURIComponent(ticket.agentId)}`
      : null;

  return (
    <div className="w-full space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 tracking-tight text-brand-text-primary sm:text-[21px]">
          <button
            type="button"
            onClick={() => navigate("/reported-issues")}
            className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
            aria-label="Back to Reported Issues"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          Reported Issue Details
        </h2>

        <button
          type="button"
          disabled={saving || ticket.status === "Resolved"}
          onClick={handleMarkResolved}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#03624D] px-5 font-sans text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Mark as resolved"}
          <SquareCheck size={18} strokeWidth={2} />
        </button>
      </div>

      {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}

      <div className={cardClass}>
        <CardSectionTitle>Issue Details</CardSectionTitle>
        <div className="space-y-5">
          <p className={valueInline}>
            <span className={labelCls}>Type of Issue : </span>
            <span className="font-semibold">{ticket.issueType}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Farmer ID : </span>
            <span className="font-semibold">{ticket.farmerId}</span>
          </p>
          <div className="space-y-2">
            <p className={labelCls}>Description :</p>
            <p className="font-sans text-[15px] font-semibold leading-[1.55] text-brand-text-primary">
              {ticket.description}
            </p>
          </div>
          <p className={valueInline}>
            <span className={labelCls}>Issue date : </span>
            <span className="font-semibold">{ticket.createdAt}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={labelCls}>Status :</span>
            <IssueStatusBadge
              label={statusLabel(ticket.status)}
              tone={ticketTone(ticket.status)}
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <CardSectionTitle>Agent Details</CardSectionTitle>
        <div className="space-y-5">
          {ticket.agentAvatarUrl ? (
            <img
              src={ticket.agentAvatarUrl}
              alt={ticket.agentName}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F3F3F3] font-sans text-lg font-semibold text-[#03624D]">
              {ticket.agentName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className={valueInline}>
            <span className={labelCls}>Full Name : </span>
            <span className="font-semibold">{ticket.agentName}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Phone number : </span>
            <span className="font-semibold">{ticket.agentPhone}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Email : </span>
            <span className="font-semibold">{ticket.agentEmail}</span>
          </p>
          {agentProfilePath ? (
            <button
              type="button"
              onClick={() => navigate(agentProfilePath)}
              className="inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-[#03624D] hover:underline"
            >
              View Agent Profile
              <ExternalLink size={17} strokeWidth={2} className="shrink-0 opacity-90" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
