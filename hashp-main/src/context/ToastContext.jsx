import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "bg-brand-green text-white",
  error: "bg-red-500 text-white",
  info: "bg-brand-text-primary text-white",
  warning: "bg-brand-amber text-white",
};

function ToastItem({ toast, onDismiss }) {
  const Icon = icons[toast.type] || icons.info;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-card-lg w-full max-w-sm mx-auto animate-slide-up ${
        styles[toast.type]
      }`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-sans font-semibold text-sm leading-snug">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="font-sans text-xs opacity-90 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRef.current[id]);
    delete timerRef.current[id];
  }, []);

  const toast = useCallback(
    ({ type = "info", title, message, duration = 3500 }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      timerRef.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const success = useCallback(
    (message, title) => toast({ type: "success", title, message }),
    [toast]
  );
  const error = useCallback(
    (message, title) => toast({ type: "error", title, message }),
    [toast]
  );
  const info = useCallback(
    (message, title) => toast({ type: "info", title, message }),
    [toast]
  );
  const warning = useCallback(
    (message, title) => toast({ type: "warning", title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 left-0 right-0 z-[100] px-4 flex flex-col gap-2 max-w-sm mx-auto">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
