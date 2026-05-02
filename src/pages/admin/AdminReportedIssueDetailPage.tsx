import { useEffect, type ReactNode, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listSupportTickets, type AdminSupportTicketRow } from "@/lib/adminApi";

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
  return (
    <h3 className="mb-5 font-sans text-sm font-medium leading-5 text-[#9B9B9B]">{children}</h3>
  );
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listSupportTickets()
      .then((tickets) => {
        if (!active) return;
        setTicket(tickets.find((row) => row.id === id) ?? null);
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

  const detailCardClass =
    "rounded-2xl border border-[#E8E8E8] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

  if (loading) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Loading support ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
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

        <IssueStatusBadge label={ticket.status} tone={ticketTone(ticket.status)} />
      </div>

      <div className={detailCardClass}>
        <CardSectionTitle>Issue Details</CardSectionTitle>
        <div className="space-y-5">
          <p className={valueInline}>
            <span className={labelCls}>Ticket ID : </span>
            <span className="font-semibold">{ticket.id}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Issue type : </span>
            <span className="font-semibold">{ticket.issueType}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Farmer ID : </span>
            <span className="font-semibold">{ticket.farmerId}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Reported by user ID : </span>
            <span className="font-semibold">{ticket.userId}</span>
          </p>

          <div className="space-y-2">
            <p className={labelCls}>Description :</p>
            <p className="font-sans text-[15px] font-semibold leading-[1.55] text-brand-text-primary">
              {ticket.description}
            </p>
          </div>

          <p className={valueInline}>
            <span className={labelCls}>Created at : </span>
            <span className="font-semibold">{ticket.createdAt}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={labelCls}>Status :</span>
            <IssueStatusBadge label={ticket.status} tone={ticketTone(ticket.status)} />
          </div>
        </div>
      </div>

      <div className={detailCardClass}>
        <CardSectionTitle>Reporter Reference</CardSectionTitle>
        <div className="space-y-5">
          <p className={valueInline}>
            <span className={labelCls}>User ID : </span>
            <span className="font-semibold">{ticket.userId}</span>
          </p>
          <p className="font-sans text-[15px] leading-[1.55] text-brand-text-secondary">
            The current admin support-ticket endpoint returns the reporter reference and issue data,
            but not a full reporter profile.
          </p>
        </div>
      </div>
    </div>
  );
}
