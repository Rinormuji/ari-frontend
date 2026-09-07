import { useCallback, useMemo, useRef, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { ToastContext } from "./toastContextValue";

const ICONS = {
  success: <CheckCircle size={17} className="shrink-0 text-green-400" />,
  error: <AlertCircle size={17} className="shrink-0 text-red-400" />,
  info: <Info size={17} className="shrink-0 text-blue-400" />,
  warning: <AlertCircle size={17} className="shrink-0 text-yellow-400" />,
};

const BORDER = {
  success: "border-green-500/30",
  error: "border-red-500/30",
  info: "border-white/10",
  warning: "border-yellow-500/30",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const remove = useCallback(
    (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
    [],
  );

  const toast = useMemo(() => Object.assign(addToast, {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    info: (message, duration) => addToast(message, "info", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-[#111] text-white text-sm font-medium animate-in slide-in-from-right-5 fade-in duration-200 ${BORDER[t.type] || BORDER.info}`}
          >
            {ICONS[t.type] || ICONS.info}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Mbyll njoftimin"
              className="text-white/40 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
