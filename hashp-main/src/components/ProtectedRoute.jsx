import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";

function isAuthenticated() {
  try {
    const token = localStorage.getItem("hcx_token");
    const farmerID = localStorage.getItem("hcx_farmer_id");
    return Boolean(token && farmerID);
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.VERIFY}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
