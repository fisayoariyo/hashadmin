import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAdminSession from "@/components/admin/RequireAdminSession";
import { useOnlineOutboxSync } from "@/hooks/useOnlineOutboxSync";
import AdminShellLayout from "@/layouts/AdminShellLayout";
import AdminAgentDeactivatePage from "@/pages/admin/AdminAgentDeactivatePage";
import AdminAgentDetailPage from "@/pages/admin/AdminAgentDetailPage";
import AdminAgentEditPage from "@/pages/admin/AdminAgentEditPage";
import AdminAgentEnrolledFarmersPage from "@/pages/admin/AdminAgentEnrolledFarmersPage";
import AdminAgentReassignLocationPage from "@/pages/admin/AdminAgentReassignLocationPage";
import AdminAgentVerificationDetailPage from "@/pages/admin/AdminAgentVerificationDetailPage";
import AdminAgentVerificationPage from "@/pages/admin/AdminAgentVerificationPage";
import AdminAgentsPage from "@/pages/admin/AdminAgentsPage";
import AdminCreateAdminPage from "@/pages/admin/AdminCreateAdminPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminFarmerDetailPage from "@/pages/admin/AdminFarmerDetailPage";
import AdminFarmerEditPage from "@/pages/admin/AdminFarmerEditPage";
import AdminFarmerEnrollingAgentPage from "@/pages/admin/AdminFarmerEnrollingAgentPage";
import AdminFarmersPage from "@/pages/admin/AdminFarmersPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminLogoutPage from "@/pages/admin/AdminLogoutPage";
import AdminReportedIssueDetailPage from "@/pages/admin/AdminReportedIssueDetailPage";
import AdminReportedIssuesPage from "@/pages/admin/AdminReportedIssuesPage";

function OutboxSync() {
  useOnlineOutboxSync();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <OutboxSync />
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/logout" element={<AdminLogoutPage />} />

        <Route element={<RequireAdminSession />}>
          <Route element={<AdminShellLayout />}>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admins/create" element={<AdminCreateAdminPage />} />
            <Route path="/farmers" element={<AdminFarmersPage />} />
            <Route path="/farmers/:farmerId/edit" element={<AdminFarmerEditPage />} />
            <Route
              path="/farmers/:farmerId/enrolling-agent"
              element={<AdminFarmerEnrollingAgentPage />}
            />
            <Route path="/farmers/:farmerId" element={<AdminFarmerDetailPage />} />
            <Route path="/agents" element={<AdminAgentsPage />} />
            <Route path="/agents/:agentId/deactivate" element={<AdminAgentDeactivatePage />} />
            <Route path="/agents/:agentId/enrolled-farmers" element={<AdminAgentEnrolledFarmersPage />} />
            <Route path="/agents/:agentId/edit" element={<AdminAgentEditPage />} />
            <Route
              path="/agents/:agentId/reassign-location"
              element={<AdminAgentReassignLocationPage />}
            />
            <Route path="/agents/:agentId" element={<AdminAgentDetailPage />} />
            <Route
              path="/agent-verification/:verificationId"
              element={<AdminAgentVerificationDetailPage />}
            />
            <Route path="/agent-verification" element={<AdminAgentVerificationPage />} />
            <Route path="/reported-issues" element={<AdminReportedIssuesPage />} />
            <Route
              path="/reported-issues/:issueId"
              element={<AdminReportedIssueDetailPage />}
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
