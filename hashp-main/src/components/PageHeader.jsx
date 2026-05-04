import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, onBack, action }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-brand-text-secondary active:text-brand-text-primary transition-colors -ml-1"
      >
        <ArrowLeft size={20} strokeWidth={2} />
        {!title && (
          <span className="font-sans text-sm">Back</span>
        )}
      </button>

      {title && (
        <h1 className="font-display font-bold text-base text-brand-text-primary absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>
      )}

      {action ? (
        <div>{action}</div>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}
