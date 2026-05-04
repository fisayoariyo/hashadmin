import { Navigate } from "react-router-dom";

export default function RequireAgentAuth({ children }) {
  try {
    const raw = sessionStorage.getItem("hcx_agent_auth");
    if (!raw) {
      return <Navigate to="/agent/login" replace />;
    }
  } catch {
    return <Navigate to="/agent/login" replace />;
  }
  return children;
}
