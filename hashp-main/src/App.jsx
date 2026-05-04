import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Shared ──────────────────────────────────────
import RoleSelect from "./pages/shared/RoleSelect";

// ── Farmer pages ─────────────────────────────────
import FarmerSplash        from "./pages/farmer/FarmerSplash";
import FarmerVerify        from "./pages/farmer/FarmerVerify";
import FarmerHome          from "./pages/farmer/FarmerHome";
import FarmerID            from "./pages/farmer/FarmerID";
import FarmerProfile       from "./pages/farmer/FarmerProfile";
import FarmerSettings      from "./pages/farmer/FarmerSettings";
import FarmerComingSoon     from "./pages/farmer/FarmerComingSoon";

// ── Agent pages ──────────────────────────────────
import AgentSplash              from "./pages/agent/AgentSplash";
import AgentCreateAccount       from "./pages/agent/AgentCreateAccount";
import AgentVerifyPhone         from "./pages/agent/AgentVerifyPhone";
import AgentSelectLocation      from "./pages/agent/AgentSelectLocation";
import AgentAccountUnderReview  from "./pages/agent/AgentAccountUnderReview";
import AgentAccountVerified     from "./pages/agent/AgentAccountVerified";
import AgentVerificationFailed  from "./pages/agent/AgentVerificationFailed";
import AgentContactSupport      from "./pages/agent/AgentContactSupport";
import AgentForgotPassword      from "./pages/agent/AgentForgotPassword";
import AgentResetPasswordNew    from "./pages/agent/AgentResetPasswordNew";
import AgentLogin               from "./pages/agent/AgentLogin";
import AgentHome                from "./pages/agent/AgentHome";
import AgentRegisterFarmer      from "./pages/agent/AgentRegisterFarmer";
import AgentSavedFarmers        from "./pages/agent/AgentSavedFarmers";
import AgentSettings            from "./pages/agent/AgentSettings";
import RequireAgentAuth         from "./components/agent/RequireAgentAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared */}
        <Route path="/"                        element={<RoleSelect />} />

        {/* Farmer */}
        <Route path="/farmer/splash"           element={<FarmerSplash />} />
        <Route path="/farmer/verify"           element={<FarmerVerify />} />
        <Route path="/farmer/home"             element={<FarmerHome />} />
        <Route path="/farmer/id"               element={<FarmerID />} />
        <Route path="/farmer/profile"          element={<FarmerProfile />} />
        <Route path="/farmer/settings"         element={<FarmerSettings />} />
        <Route path="/farmer/loans"            element={<FarmerComingSoon />} />
        <Route path="/farmer/support"          element={<FarmerComingSoon />} />
        <Route path="/farmer/buyers"           element={<FarmerComingSoon />} />

        {/* Agent */}
        <Route path="/agent/splash"              element={<AgentSplash />} />
        <Route path="/agent/create-account"      element={<AgentCreateAccount />} />
        <Route path="/agent/verify-phone"        element={<AgentVerifyPhone />} />
        <Route path="/agent/select-location"     element={<AgentSelectLocation />} />
        <Route path="/agent/account-under-review"  element={<AgentAccountUnderReview />} />
        <Route path="/agent/account-verified"      element={<AgentAccountVerified />} />
        <Route path="/agent/verification-failed"   element={<AgentVerificationFailed />} />
        <Route path="/agent/contact-support"      element={<AgentContactSupport />} />
        <Route path="/agent/forgot-password"       element={<AgentForgotPassword />} />
        <Route path="/agent/reset-password-new"    element={<AgentResetPasswordNew />} />
        <Route path="/agent/login"                 element={<AgentLogin />} />
        <Route
          path="/agent/home"
          element={
            <RequireAgentAuth>
              <AgentHome />
            </RequireAgentAuth>
          }
        />
        <Route
          path="/agent/register-farmer"
          element={
            <RequireAgentAuth>
              <AgentRegisterFarmer />
            </RequireAgentAuth>
          }
        />
        <Route
          path="/agent/saved-farmers"
          element={
            <RequireAgentAuth>
              <AgentSavedFarmers />
            </RequireAgentAuth>
          }
        />
        <Route
          path="/agent/settings"
          element={
            <RequireAgentAuth>
              <AgentSettings />
            </RequireAgentAuth>
          }
        />

        {/* Fallback */}
        <Route path="*"                        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
