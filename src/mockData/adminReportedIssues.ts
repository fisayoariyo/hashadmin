/** Reported issues mock — replace with API when wired. */

export type AdminIssueStatus = "Open" | "In review" | "Resolved";

export type AdminIssueRow = {
  id: string;
  reporter: string;
  subject: string;
  category: string;
  status: AdminIssueStatus;
  createdAt: string;
};

export const adminIssueStatusOptions = ["All", "Open", "In review", "Resolved"] as const;

const ISSUE_STATUS_OVERRIDES_KEY = "hashmar-admin-reported-issue-status";

function readStatusOverrides(): Record<string, AdminIssueStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(ISSUE_STATUS_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, AdminIssueStatus>;
  } catch {
    return {};
  }
}

function writeStatusOverrides(map: Record<string, AdminIssueStatus>) {
  sessionStorage.setItem(ISSUE_STATUS_OVERRIDES_KEY, JSON.stringify(map));
}

export function getMergedIssueStatus(issueId: string, base: AdminIssueStatus): AdminIssueStatus {
  return readStatusOverrides()[issueId] ?? base;
}

export function markReportedIssueResolved(issueId: string) {
  const next: Record<string, AdminIssueStatus> = {
    ...readStatusOverrides(),
    [issueId]: "Resolved",
  };
  writeStatusOverrides(next);
}

export const adminIssuesList: AdminIssueRow[] = Array.from({ length: 9 }, (_, i) => ({
  id: `ISS-${100 + i}`,
  reporter: i % 2 === 0 ? "HA Admin" : "System",
  subject: i % 3 === 0 ? "Duplicate farmer profile" : i % 3 === 1 ? "Agent cannot sync" : "Incorrect LGA mapping",
  category: i % 2 === 0 ? "Data quality" : "Sync",
  /** First row matches Figma reference (Pending on detail). */
  status: i === 0 ? "In review" : i % 4 === 0 ? "Open" : i % 4 === 1 ? "In review" : "Resolved",
  createdAt: "14/04/2026",
}));

export type AdminIssueAgentSummary = {
  agentId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
};

export type AdminIssueDetail = {
  id: string;
  subject: string;
  category: string;
  reporter: string;
  typeOfIssue: string;
  farmerId: string;
  description: string;
  issueDate: string;
  statusLabel: string;
  statusTone: "amber" | "red" | "green";
  agent: AdminIssueAgentSummary;
};

const DESCRIPTIONS = [
  "Agent personal information contains some errors and i will loke to correct these information",
  "Farmer record appears twice under different phone numbers; please merge or remove the duplicate.",
  "Mobile app fails to upload farm photos when network switches from Wi‑Fi to mobile data.",
] as const;

function statusPresentation(status: AdminIssueStatus): { label: string; tone: AdminIssueDetail["statusTone"] } {
  if (status === "Resolved") return { label: "Resolved", tone: "green" };
  if (status === "In review") return { label: "Pending", tone: "amber" };
  return { label: "Open", tone: "red" };
}

export function getAdminIssueDetail(issueId: string): AdminIssueDetail | null {
  const row = adminIssuesList.find((r) => r.id === issueId);
  if (!row) return null;

  const i = adminIssuesList.indexOf(row);
  const merged = getMergedIssueStatus(issueId, row.status);
  const { label, tone } = statusPresentation(merged);

  const typeOfIssue = "Farmer Registration";

  const farmerId =
    i === 0 ? "HCX-OY-2026-005482" : `HCX-OY-2026-${String(5482 + i).padStart(6, "0")}`;

  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    reporter: row.reporter,
    typeOfIssue,
    farmerId,
    description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    issueDate: i === 0 ? "20/03/2026" : row.createdAt,
    statusLabel: label,
    statusTone: tone,
    agent: {
      agentId: "AGT-HSH-2026-00401",
      fullName: "Adesipe Tomide",
      phone: "08133905285",
      email: "olatomdo@gmail.com",
      avatarUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=160&q=80",
    },
  };
}
