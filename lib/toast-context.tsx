"use client";

/**
 * Lightweight toast notification context.
 *
 * Wrap your layout with <ToastProvider> and use the useToast() hook anywhere:
 *
 *   const { toast } = useToast();
 *   toast({ message: "Payout requested!", variant: "success" });
 *
 * The <ToastContainer /> is rendered by the provider itself — no need to
 * add it manually.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "danger" | "warning" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (options: { message: string; variant?: ToastVariant; duration?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback(
    ({
      message,
      variant = "info",
      duration = 3500,
    }: {
      message: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const variantStyles: Record<ToastVariant, string> = {
    success: "border-(--success)/25 bg-(--success)/8 text-(--success-ink)",
    danger: "border-(--danger)/25 bg-(--danger)/8 text-(--danger-ink)",
    warning: "border-(--warning)/25 bg-(--warning)/8 text-(--warning-ink)",
    info: "border-(--info)/25 bg-(--info)/8 text-(--info-ink)",
  };

  const icons: Record<ToastVariant, string> = {
    success: "✓",
    danger: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm reveal-up ${variantStyles[t.variant]}`}
            style={{ background: "rgba(255,255,255,0.92)" }}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                t.variant === "success"
                  ? "bg-(--success) text-white"
                  : t.variant === "danger"
                    ? "bg-(--danger) text-white"
                    : t.variant === "warning"
                      ? "bg-(--warning) text-white"
                      : "bg-(--info) text-white"
              }`}
            >
              {icons[t.variant]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
