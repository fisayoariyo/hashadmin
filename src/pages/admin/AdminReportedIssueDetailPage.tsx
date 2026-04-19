import { useReducer, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ExternalLink } from "lucide-react";
import {
  getAdminIssueDetail,
  getMergedIssueStatus,
  markReportedIssueResolved,
  adminIssuesList,
} from "@/mockData/adminReportedIssues";

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

export default function AdminReportedIssueDetailPage() {
  const { issueId = "" } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(issueId);
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  const baseRow = adminIssuesList.find((r) => r.id === id);
  const detail = getAdminIssueDetail(id);

  if (!detail || !baseRow) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Issue not found.</p>
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

  const mergedStatus = getMergedIssueStatus(id, baseRow.status);
  const isResolved = mergedStatus === "Resolved";

  const detailCardClass =
    "rounded-2xl border border-[#E8E8E8] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

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

        {!isResolved ? (
          <button
            type="button"
            onClick={() => {
              markReportedIssueResolved(id);
              rerender();
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2.5 self-stretch rounded-2xl bg-[#005F4A] px-6 py-3.5 font-sans text-[15px] font-semibold leading-5 text-white shadow-[0_8px_20px_rgba(0,95,74,0.22)] transition hover:brightness-[1.03] active:scale-[0.99] sm:self-auto"
          >
            <BadgeCheck size={20} strokeWidth={2} className="shrink-0" />
            Mark as resolved
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#ECFDF5] px-3.5 py-1.5 font-sans text-[13px] font-semibold text-[#047857]">
            Resolved
          </span>
        )}
      </div>

      <div className={detailCardClass}>
        <CardSectionTitle>Issue Details</CardSectionTitle>
        <div className="space-y-5">
          <p className={valueInline}>
            <span className={labelCls}>Type of Issue : </span>
            <span className="font-semibold">{detail.typeOfIssue}</span>
          </p>
          <p className={valueInline}>
            <span className={labelCls}>Farmer ID : </span>
            <span className="font-semibold">{detail.farmerId}</span>
          </p>

          <div className="space-y-2">
            <p className={labelCls}>Description :</p>
            <p className="font-sans text-[15px] font-semibold leading-[1.55] text-brand-text-primary">
              {detail.description}
            </p>
          </div>

          <p className={valueInline}>
            <span className={labelCls}>Issue date : </span>
            <span className="font-semibold">{detail.issueDate}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={labelCls}>Status :</span>
            <IssueStatusBadge label={detail.statusLabel} tone={detail.statusTone} />
          </div>
        </div>
      </div>

      <div className={detailCardClass}>
        <CardSectionTitle>Agent Details</CardSectionTitle>
        <div className="flex flex-col gap-5">
          <img
            src={detail.agent.avatarUrl}
            alt=""
            className="h-[88px] w-[88px] shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]"
          />
          <div className="min-w-0 space-y-5">
            <p className={valueInline}>
              <span className={labelCls}>Full Name : </span>
              <span className="font-semibold">{detail.agent.fullName}</span>
            </p>
            <p className={valueInline}>
              <span className={labelCls}>Phone number : </span>
              <span className="font-semibold">{detail.agent.phone}</span>
            </p>
            <p className={`break-words ${valueInline}`}>
              <span className={labelCls}>Email : </span>
              <span className="font-semibold">{detail.agent.email}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate(`/agents/${encodeURIComponent(detail.agent.agentId)}`)}
              className="inline-flex items-center gap-1.5 pt-0.5 font-sans text-[15px] font-semibold leading-5 text-[#065F46] hover:underline"
            >
              View Agent Profile
              <ExternalLink size={17} strokeWidth={2} className="shrink-0 opacity-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
