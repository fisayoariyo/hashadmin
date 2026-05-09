/** Agent verification queue — replace with API when wired. */

export type AgentVerificationStatus = "pending" | "verified";

export type AdminAgentVerificationListRow = {
  id: string;
  name: string;
  phone: string;
  status: AgentVerificationStatus;
  state: string;
  lga: string;
  submittedAtSort: number; // unix ms for sort
};

export type AdminAgentVerificationDetail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string;
  gender: string;
  status: AgentVerificationStatus;
  state: string;
  lga: string;
};

const baseRows: AdminAgentVerificationListRow[] = [
  {
    id: "v-1",
    name: "Adesipe Tomide",
    phone: "08133905285",
    status: "verified",
    state: "Ekiti",
    lga: "Igbara-odo",
    submittedAtSort: Date.parse("2026-03-18T12:00:00Z"),
  },
  {
    id: "v-2",
    name: "Adebayo Oluwaseun",
    phone: "08023456789",
    status: "verified",
    state: "Oyo",
    lga: "Ibadan North",
    submittedAtSort: Date.parse("2026-03-10T10:00:00Z"),
  },
  {
    id: "v-3",
    name: "Chukwu Emeka",
    phone: "07011223344",
    status: "pending",
    state: "Lagos",
    lga: "Ikeja",
    submittedAtSort: Date.parse("2026-03-22T09:30:00Z"),
  },
  {
    id: "v-4",
    name: "Ibrahim Musa",
    phone: "09088776655",
    status: "verified",
    state: "Kano",
    lga: "Nasarawa",
    submittedAtSort: Date.parse("2026-02-28T14:00:00Z"),
  },
  {
    id: "v-5",
    name: "Ngozi Okonkwo",
    phone: "08155667788",
    status: "pending",
    state: "Anambra",
    lga: "Awka South",
    submittedAtSort: Date.parse("2026-03-25T16:20:00Z"),
  },
  {
    id: "v-6",
    name: "Tunde Bakare",
    phone: "08099887766",
    status: "verified",
    state: "Ogun",
    lga: "Abeokuta South",
    submittedAtSort: Date.parse("2026-01-15T11:00:00Z"),
  },
  {
    id: "v-7",
    name: "Fatima Yusuf",
    phone: "07033445566",
    status: "pending",
    state: "Kaduna",
    lga: "Chikun",
    submittedAtSort: Date.parse("2026-03-19T08:45:00Z"),
  },
  {
    id: "v-8",
    name: "Peter Okafor",
    phone: "08122334455",
    status: "verified",
    state: "Enugu",
    lga: "Enugu East",
    submittedAtSort: Date.parse("2026-03-05T13:10:00Z"),
  },
  {
    id: "v-9",
    name: "Maryam Abdullahi",
    phone: "09044556677",
    status: "pending",
    state: "Plateau",
    lga: "Jos North",
    submittedAtSort: Date.parse("2026-03-26T07:00:00Z"),
  },
  {
    id: "v-10",
    name: "Samuel Eze",
    phone: "08066778899",
    status: "verified",
    state: "Rivers",
    lga: "Port Harcourt",
    submittedAtSort: Date.parse("2026-02-01T15:30:00Z"),
  },
  {
    id: "v-11",
    name: "Grace John",
    phone: "07088990011",
    status: "pending",
    state: "Akwa Ibom",
    lga: "Uyo",
    submittedAtSort: Date.parse("2026-03-27T12:00:00Z"),
  },
  {
    id: "v-12",
    name: "Usman Garba",
    phone: "08199001122",
    status: "verified",
    state: "Niger",
    lga: "Minna",
    submittedAtSort: Date.parse("2026-03-12T10:40:00Z"),
  },
];

const detailById: Record<string, AdminAgentVerificationDetail> = {
  "v-1": {
    id: "v-1",
    name: "Adesipe Tomide",
    phone: "08133905285",
    email: "olatomdo@gmail.com",
    registrationDate: "20/03/2026",
    gender: "Male",
    status: "verified",
    state: "Ekiti state",
    lga: "Igbara-odo",
  },
};

function defaultDetailFromRow(row: AdminAgentVerificationListRow): AdminAgentVerificationDetail {
  const slug = row.name.toLowerCase().replace(/\s+/g, ".");
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: `${slug}@email.com`,
    registrationDate: "15/03/2026",
    gender: row.id.charCodeAt(row.id.length - 1) % 2 === 0 ? "Female" : "Male",
    status: row.status,
    state: `${row.state} state`,
    lga: row.lga,
  };
}

export const adminAgentVerificationList: AdminAgentVerificationListRow[] = baseRows;

export function getAdminAgentVerificationDetail(id: string): AdminAgentVerificationDetail | null {
  const row = baseRows.find((r) => r.id === id);
  if (!row) return null;
  return detailById[id] ?? defaultDetailFromRow(row);
}
