"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { Check, Loader2, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastStatus = "success" | "error" | "loading" | "info";

type ToastInput = {
  id?: string;
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
};

type ToastItem = Required<Pick<ToastInput, "id" | "title" | "status" | "duration">> & {
  description?: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  updateToast: (id: string, input: Omit<ToastInput, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = input.id ?? createToastId();
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      status: input.status ?? "info",
      duration: input.duration ?? (input.status === "loading" ? 120000 : 3600),
    };

    setToasts((current) => [item, ...current.filter((toastItem) => toastItem.id !== id)].slice(0, 4));
    return id;
  }, []);

  const updateToast = useCallback((id: string, input: Omit<ToastInput, "id">) => {
    setToasts((current) =>
      current.map((toastItem) =>
        toastItem.id === id
          ? {
              ...toastItem,
              title: input.title,
              description: input.description,
              status: input.status ?? toastItem.status,
              duration: input.duration ?? (input.status === "loading" ? 120000 : 3600),
            }
          : toastItem,
      ),
    );
  }, []);

  const value = useMemo(() => ({ toast, updateToast, dismissToast }), [dismissToast, toast, updateToast]);

  return (
    <ToastContext.Provider value={value}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((toastItem) => (
          <RadixToast.Root
            key={toastItem.id}
            duration={toastItem.duration}
            onOpenChange={(open) => {
              if (!open) dismissToast(toastItem.id);
            }}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-[var(--peblo-border)] bg-white/92 p-3 sm:p-4 shadow-[0_18px_50px_rgba(74,37,189,0.18)] backdrop-blur transition data-[state=closed]:animate-none data-[state=open]:animate-none data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]"
          >
            <StatusIcon status={toastItem.status} />
            <div className="min-w-0">
              <RadixToast.Title className="text-sm sm:text-base font-black text-[var(--peblo-ink)]">{toastItem.title}</RadixToast.Title>
              {toastItem.description ? (
                <RadixToast.Description className="mt-1 text-sm leading-5 text-[var(--peblo-muted)]">
                  {toastItem.description}
                </RadixToast.Description>
              ) : null}
            </div>
            <RadixToast.Close aria-label="Close toast" className="grid h-7 w-7 place-items-center rounded-md text-[var(--peblo-muted)] transition hover:bg-[var(--peblo-purple-soft)]">
              <X size={14} />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed right-4 top-4 z-[80] grid w-[calc(100vw-2rem)] max-w-sm gap-3 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

function StatusIcon({ status }: { status: ToastStatus }) {
  const baseClass = "mt-0.5 grid h-8 w-8 place-items-center rounded-full";
  if (status === "loading") {
    return (
      <div className={`${baseClass} bg-[var(--peblo-purple-soft)] text-[var(--peblo-purple-deep)]`}>
        <Loader2 className="animate-spin" size={16} />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className={`${baseClass} bg-rose-50 text-rose-700`}>
        <X size={16} />
      </div>
    );
  }
  return (
    <div className={`${baseClass} bg-[var(--peblo-gold-soft)] text-[#8a5a00]`}>
      <Check size={16} />
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
