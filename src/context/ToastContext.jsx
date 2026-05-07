import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

let _id = 0;

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

  const toast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Convenience helpers
  toast.success = (msg, dur) => toast(msg, "success", dur);
  toast.error = (msg, dur) => toast(msg, "error", dur);
  toast.info = (msg, dur) => toast(msg, "info", dur);
  toast.warning = (msg, dur) => toast(msg, "warning", dur);

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
              onClick={() => remove(t.id)}
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

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
