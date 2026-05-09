/** Dashboard mock — replace with API when wired. */

export type AdminStatKey =
  | "farmers"
  | "agents"
  | "activeAgents"
  | "farmersToday"
  | "pendingVerification";

export const adminDashboardStats: {
  key: AdminStatKey;
  label: string;
  value: string;
  changeLabel: string | null;
  path: string;
}[] = [
  {
    key: "farmers",
    label: "Total Farmers Registered",
    value: "8,420",
    changeLabel: "+120 this week",
    path: "/farmers",
  },
  {
    key: "agents",
    label: "Total Agents",
    value: "135",
    changeLabel: "Across 12 states",
    path: "/agents",
  },
  {
    key: "activeAgents",
    label: "Active Agents",
    value: "128",
    changeLabel: "last 7 days",
    path: "/agents",
  },
  {
    key: "farmersToday",
    label: "Farmers Registered Today",
    value: "42",
    changeLabel: "Today",
    path: "/farmers",
  },
  {
    key: "pendingVerification",
    label: "Pending Agent verification",
    value: "10",
    changeLabel: "Awaiting review",
    path: "/agent-verification",
  },
];

export type AdminRecentFarmerRow = {
  id: string;
  name: string;
  farmerId: string;
  status: string;
  gender: string;
};

export const adminRecentFarmers: AdminRecentFarmerRow[] = [
  { id: "1", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000123", status: "Ekiti", gender: "Male" },
  { id: "2", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000124", status: "Ekiti", gender: "Male" },
  { id: "3", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000125", status: "Ekiti", gender: "Male" },
  { id: "4", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000126", status: "Ekiti", gender: "Male" },
  { id: "5", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000127", status: "Ekiti", gender: "Male" },
  { id: "6", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000128", status: "Ekiti", gender: "Male" },
  { id: "7", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000129", status: "Ekiti", gender: "Male" },
  { id: "8", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000130", status: "Ekiti", gender: "Male" },
  { id: "9", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000131", status: "Ekiti", gender: "Male" },
  { id: "10", name: "Adebayo Oluwaseun", farmerId: "HSH-IB-2026-000132", status: "Ekiti", gender: "Male" },
];

export type AdminPendingAgent = {
  id: string;
  name: string;
  email: string;
};

export const adminPendingAgents: AdminPendingAgent[] = [
  { id: "1", name: "Adebayo Oluwaseun", email: "adebayo@email.com" },
  { id: "2", name: "Adebayo Oluwaseun", email: "adebayo@email.com" },
  { id: "3", name: "Adebayo Oluwaseun", email: "adebayo@email.com" },
  { id: "4", name: "Adebayo Oluwaseun", email: "adebayo@email.com" },
];
