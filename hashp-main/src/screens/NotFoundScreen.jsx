import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="page-container bg-white items-center justify-center">
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <span className="text-7xl mb-6 select-none">🌾</span>
        <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-2">
          Page Not Found
        </h1>
        <p className="font-sans text-sm text-brand-text-secondary leading-relaxed mb-10 max-w-xs">
          Looks like this field hasn't been planted yet. Let's get you back to
          familiar ground.
        </p>
        <button
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="btn-primary max-w-xs"
        >
          Go to Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-brand-green font-sans text-sm font-medium py-2"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
