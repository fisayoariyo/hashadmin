import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminSession } from "@/lib/adminSession";

/**
 * Blocks shell routes until an offline session exists (Dexie + localStorage mirror).
 */
export default function RequireAdminSession() {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getAdminSession();
      if (!cancelled) setState(s ? "ok" : "no");
    })();
    return () => {
      cancelled = true;
    };
  }, [location.key]);

  if (state === "loading") {
    return (
      <div className="hidden h-dvh items-center justify-center bg-brand-bg-page text-sm text-brand-text-secondary md:flex">
        Loading…
      </div>
    );
  }

  if (state === "no") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
