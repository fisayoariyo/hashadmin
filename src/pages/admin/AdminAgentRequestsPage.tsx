import PendingAgentsPanel from "@/components/admin/PendingAgentsPanel";
import { listFarmerUpgradeRequests } from "@/lib/adminApi";

export default function AdminAgentRequestsPage() {
  return (
    <PendingAgentsPanel
      title="Agent Requests"
      description="Monitor incoming agent requests, filter by state, and open details to approve or reject each submission."
      fetchRows={listFarmerUpgradeRequests}
    />
  );
}
