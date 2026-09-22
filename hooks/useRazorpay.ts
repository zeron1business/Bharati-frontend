"use client";

import { useCallback } from "react";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: string | number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

export function useRazorpay() {
  const loadScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openPayment = useCallback(
    async (
      options: RazorpayOptions,
      onFailure?: (error: unknown) => void
    ): Promise<void> => {
      const isLoaded = await loadScript();
      if (!isLoaded) {
        if (onFailure) {
          onFailure(new Error("Failed to load Razorpay payment SDK"));
        } else {
          alert("Payment gateway failed to load. Please check your internet connection.");
        }
        return;
      }

      const rzp = new window.Razorpay(options);
      if (onFailure) {
        rzp.on("payment.failed", (response: unknown) => {
          onFailure(response);
        });
      }
      rzp.open();
    },
    [loadScript]
  );

  return { openPayment };
}
