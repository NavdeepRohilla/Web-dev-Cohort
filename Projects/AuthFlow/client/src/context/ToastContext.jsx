import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => removeToast(id), 4500);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className="grid grid-cols-[10px_1fr_auto] items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-zinc-900"
          >
            <span className={getToastDotClass(toast.type)} />
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function getToastDotClass(type) {
  const base = "h-2.5 w-2.5 rounded-full";

  if (type === "error") return `${base} bg-red-500`;
  if (type === "warning") return `${base} bg-amber-500`;
  return `${base} bg-emerald-500`;
}
