import { Outlet, useLocation } from "react-router-dom";
import AdminDesktopShell, {
  type AdminShellNavKey,
} from "@/components/admin/AdminDesktopShell";

function activeNavFromPath(pathname: string): AdminShellNavKey {
  if (pathname.startsWith("/admins/create")) return "create-admin";
  if (pathname.startsWith("/farmers")) return "farmers";
  if (pathname.startsWith("/agents")) return "agents";
  if (pathname.startsWith("/agent-verification")) return "agent-verification";
  if (pathname.startsWith("/reported-issues")) return "reported-issues";
  return "dashboard";
}

/**
 * Layout route: desktop-only shell (no mobile layout yet).
 * Below `md`, show a short notice instead of duplicating the dashboard UI.
 */
export default function AdminShellLayout() {
  const { pathname } = useLocation();
  const active = activeNavFromPath(pathname);

  return (
    <>
      <AdminDesktopShell active={active}>
        <Outlet />
      </AdminDesktopShell>

      <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-bg-page px-6 py-10 text-center md:hidden">
        <p className="max-w-sm font-sans text-sm leading-relaxed text-brand-text-secondary">
          Please open the admin console on a desktop-sized window. Mobile layout is not
          available yet.
        </p>
      </div>
    </>
  );
}
