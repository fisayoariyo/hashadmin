/** Agent Management mock — replace with API when wired. */

export type AdminAgentListRow = {
  id: string;
  agentId: string;
  name: string;
  phone: string;
  regDate: string;
  state: string;
  lga: string;
  status: "Active" | "Inactive" | "Pending";
};

export const adminAgentsList: AdminAgentListRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  agentId: `AGT-HSH-2026-${String(401 + i).padStart(5, "0")}`,
  name: i % 2 === 0 ? "Adesipe Tomide" : "Chinwe Okoro",
  phone: i % 2 === 0 ? "08133905285" : `0803${String(1000000 + i * 1111).slice(-7)}`,
  regDate: "18/03/2026",
  state: i % 3 === 0 ? "Lagos" : i % 3 === 1 ? "Oyo" : "Rivers",
  lga: i % 3 === 0 ? "Ikeja" : i % 3 === 1 ? "Ibadan North" : "Port Harcourt",
  status: i % 4 === 0 ? "Pending" : i % 4 === 1 ? "Inactive" : "Active",
}));

export type AdminAgentDetail = {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  status: AdminAgentListRow["status"];
  farmersOnboarded: string;
  gender: string;
  registrationDate: string;
  lastSync: string;
  lastActive: string;
  avatarUrl: string;
  /** Personal information status line (e.g. Verified). */
  verificationLabel: string;
};

const agentDetailById: Record<string, AdminAgentDetail> = {
  "AGT-HSH-2026-00401": {
    agentId: "AGT-HSH-2026-00401",
    name: "Adesipe Tomide",
    email: "olatomdo@gmail.com",
    phone: "08133905285",
    state: "Ekiti",
    lga: "Igbara-odo",
    status: "Active",
    farmersOnboarded: "100",
    gender: "Male",
    registrationDate: "20/03/2026",
    lastSync: "12/09/2026 08:30 am",
    lastActive: "12/09/2026",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
    verificationLabel: "Verified",
  },
};

function verificationFromRowStatus(status: AdminAgentListRow["status"]): string {
  if (status === "Active") return "Verified";
  if (status === "Pending") return "Pending";
  return "Inactive";
}

/** Farmers enrolled by an agent (mock list — replace with API). */
export type AdminAgentEnrolledFarmerRow = {
  id: string;
  farmerId: string;
  name: string;
  regDate: string;
  state: string;
  lga: string;
};

export function getAgentEnrolledFarmers(agentId: string): AdminAgentEnrolledFarmerRow[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: `ef-${agentId}-${i}`,
    farmerId: i === 0 ? "HSH-IB-2026-000123" : `HSH-IB-2026-${String(123 + i).padStart(6, "0")}`,
    name: "Adebayo Oluwaseun",
    regDate: "12/04/2026",
    state: "Anambra",
    lga: "Igbara-odo",
  }));
}

export function getAdminAgentDetail(agentId: string): AdminAgentDetail | null {
  const exact = agentDetailById[agentId];
  if (exact) return exact;

  const fromList = adminAgentsList.find((r) => r.agentId === agentId);
  const base = agentDetailById["AGT-HSH-2026-00401"];
  if (!base) return null;

  if (fromList) {
    return {
      ...base,
      agentId: fromList.agentId,
      name: fromList.name,
      phone: fromList.phone,
      state: fromList.state,
      lga: fromList.lga,
      status: fromList.status,
      registrationDate: fromList.regDate,
      verificationLabel: verificationFromRowStatus(fromList.status),
    };
  }

  return {
    ...base,
    agentId,
    verificationLabel: verificationFromRowStatus(base.status),
  };
}
