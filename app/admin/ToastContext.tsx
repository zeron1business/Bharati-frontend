"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { usePathname } from "next/navigation";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const FLASH_TOAST_KEY = "bharati_admin_flash_toast";

/**
 * Stores a toast message to be shown across page navigation.
 */
export function setFlashToast(message: string, type: ToastType = "success", title?: string) {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify({ message, type, title }));
    } catch (e) {
      console.error("Failed to set flash toast:", e);
    }
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pathname = usePathname();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success", title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Check for flash toast on route change or initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(FLASH_TOAST_KEY);
        if (stored) {
          sessionStorage.removeItem(FLASH_TOAST_KEY);
          const { message, type, title } = JSON.parse(stored);
          if (message) {
            setTimeout(() => {
              showToast(message, type || "success", title);
            }, 100);
          }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, [pathname, showToast]);

  // Global event listener for non-React contexts or decoupled dispatches
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type?: ToastType; title?: string }>;
      if (customEvent.detail?.message) {
        showToast(customEvent.detail.message, customEvent.detail.type || "success", customEvent.detail.title);
      }
    };

    window.addEventListener("bharati-admin-toast", handleCustomToast);
    return () => {
      window.removeEventListener("bharati-admin-toast", handleCustomToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Floating Top-Right Toast Container */}
      <div 
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full rounded-xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border backdrop-blur-md animate-slideInRight flex items-start gap-3.5 transition-all ${
              toast.type === "success"
                ? "bg-white/95 border-emerald-200/80 text-bharati-black"
                : toast.type === "error"
                ? "bg-white/95 border-red-200/80 text-bharati-black"
                : toast.type === "warning"
                ? "bg-white/95 border-amber-200/80 text-bharati-black"
                : "bg-white/95 border-bharati-mist text-bharati-black"
            }`}
          >
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : toast.type === "error"
                ? "bg-red-50 text-red-600 border border-red-100"
                : toast.type === "warning"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-bharati-cream text-bharati-charcoal border border-bharati-mist"
            }`}>
              {toast.type === "success" && <CheckCircle2 size={18} strokeWidth={2} />}
              {toast.type === "error" && <AlertCircle size={18} strokeWidth={2} />}
              {toast.type === "warning" && <AlertTriangle size={18} strokeWidth={2} />}
              {toast.type === "info" && <Info size={18} strokeWidth={2} />}
            </div>

            {/* Message Details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-sm font-semibold tracking-tight text-bharati-black">
                {toast.title || (toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : toast.type === "warning" ? "Notice" : "Info")}
              </div>
              <p className="text-xs text-bharati-charcoal mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-bharati-ash hover:text-bharati-black p-1 rounded-md transition-colors shrink-0 -mr-1 -mt-1 hover:bg-gray-100"
              title="Dismiss notification"
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
