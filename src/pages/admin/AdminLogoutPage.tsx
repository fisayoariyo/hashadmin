import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminSession } from "@/lib/adminSession";

/** Clears the offline admin session and sends the user to the login screen. */
export default function AdminLogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void clearAdminSession().then(() => navigate("/login", { replace: true }));
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-bg-page font-sans text-sm text-brand-text-secondary">
      Signing out…
    </div>
  );
}
