import { useNavigate, useLocation } from "react-router-dom";
import { Home, User } from "lucide-react";
import { ROUTES } from "../constants/routes";

const TABS = [
  { label: "Home", path: ROUTES.HOME, Icon: Home },
  { label: "My profile", path: ROUTES.PROFILE, Icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-4 z-50 pointer-events-none">
      <div className="bg-white rounded-[2.5rem] shadow-nav flex items-center justify-around px-4 py-2 pointer-events-auto">
        {TABS.map(({ label, path, Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex items-center justify-center"
            >
              <div
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2.5 rounded-[1.5rem] transition-all duration-200 ${
                  active ? "bg-brand-green" : "bg-transparent"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  className={active ? "text-white" : "text-brand-green"}
                />
                <span
                  className={`text-xs font-sans font-medium ${
                    active ? "text-white" : "text-brand-text-secondary"
                  }`}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
