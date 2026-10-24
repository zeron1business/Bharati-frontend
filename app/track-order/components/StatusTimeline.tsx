"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface StatusTimelineProps {
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StepConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  {
    key: "PLACED",
    title: "Order Placed",
    description: "Your order has been received and verified",
    icon: Clock,
  },
  {
    key: "PAID",
    title: "Payment Confirmed",
    description: "Payment has been processed successfully",
    icon: CheckCircle2,
  },
  {
    key: "CONFIRMED",
    title: "Order Confirmed",
    description: "Order is packed and ready for dispatch",
    icon: Package,
  },
  {
    key: "SHIPPED",
    title: "Shipped",
    description: "Handed over to carrier & on the way",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Package safely delivered to your address",
    icon: CheckCheck,
  },
];

export default function StatusTimeline({
  status,
  createdAt,
  updatedAt,
}: StatusTimelineProps) {
  const normStatus = (status || "").toUpperCase();

  const isCancelled = normStatus === "CANCELLED";
  const isRefunded = normStatus === "REFUNDED";
  const isPaymentFailed = normStatus === "PAYMENT_FAILED";

  // Determine the highest reached step index (0-indexed)
  // 0: PLACED, 1: PAID, 2: CONFIRMED, 3: SHIPPED, 4: DELIVERED
  let currentStepIndex = 0;
  if (normStatus === "DELIVERED") {
    currentStepIndex = 4;
  } else if (normStatus === "SHIPPED") {
    currentStepIndex = 3;
  } else if (normStatus === "CONFIRMED") {
    currentStepIndex = 2;
  } else if (normStatus === "PAID") {
    currentStepIndex = 1;
  } else if (normStatus === "PAYMENT_PENDING" || normStatus === "CREATED") {
    currentStepIndex = 0;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const formattedCreated = formatDate(createdAt);
  const formattedUpdated = formatDate(updatedAt);

  return (
    <div className="w-full">
      {/* Alert Banner for Special Statuses */}
      {isCancelled && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <XCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="text-xs">
            <span className="font-semibold uppercase tracking-wider block">Order Cancelled</span>
            <span className="text-red-600/90">This order was cancelled. No further delivery updates will occur.</span>
          </div>
        </div>
      )}

      {isRefunded && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800">
          <RotateCcw className="w-5 h-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <span className="font-semibold uppercase tracking-wider block">Refund Issued</span>
            <span className="text-amber-700/90">Payment has been refunded to your original payment method.</span>
          </div>
        </div>
      )}

      {isPaymentFailed && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="text-xs">
            <span className="font-semibold uppercase tracking-wider block">Payment Failed</span>
            <span className="text-red-600/90">The transaction could not be completed. Please reorder or try another method.</span>
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="relative pl-2 sm:pl-4 space-y-6">
        {STEPS.map((step, index) => {
          const isDone = !isCancelled && !isRefunded && !isPaymentFailed && index < currentStepIndex;
          const isCurrent =
            !isCancelled &&
            !isRefunded &&
            !isPaymentFailed &&
            index === currentStepIndex &&
            normStatus !== "DELIVERED";
          const isDelivered = !isCancelled && !isRefunded && !isPaymentFailed && normStatus === "DELIVERED" && index === 4;
          const isPending =
            isCancelled || isRefunded || isPaymentFailed || index > currentStepIndex;

          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Connector vertical line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute left-[17px] top-[34px] w-[2px] h-[calc(100%-10px)] transition-colors duration-500 ${
                    index < currentStepIndex && !isCancelled && !isRefunded
                      ? "bg-emerald-500"
                      : "bg-bharati-mist/60"
                  }`}
                />
              )}

              {/* Step Icon / Circle */}
              <div className="relative z-10 shrink-0">
                {isDone || isDelivered ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-4 ring-emerald-50">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : isCurrent ? (
                  <div className="relative w-9 h-9 rounded-full bg-bharati-mint-dark text-white flex items-center justify-center shadow-md">
                    <span className="absolute -inset-1 rounded-full bg-bharati-mint/40 animate-ping opacity-75" />
                    <IconComponent className="w-4 h-4 relative z-10 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-bharati-ivory border border-bharati-mist text-bharati-silver flex items-center justify-center">
                    <IconComponent className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="pt-1.5 flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4
                    className={`text-sm font-semibold tracking-wide ${
                      isDone || isDelivered
                        ? "text-bharati-charcoal font-medium"
                        : isCurrent
                        ? "text-bharati-charcoal font-bold"
                        : "text-bharati-silver"
                    }`}
                  >
                    {step.title}
                  </h4>

                  {/* Timestamps */}
                  {index === 0 && formattedCreated && (
                    <span className="text-[11px] font-mono text-bharati-ash bg-bharati-ivory px-2 py-0.5 rounded-md border border-bharati-mist/40 w-fit">
                      {formattedCreated}
                    </span>
                  )}
                  {((isCurrent && index > 0) || isDelivered) && formattedUpdated && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                      Updated: {formattedUpdated}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isDone || isDelivered || isCurrent
                      ? "text-bharati-ash"
                      : "text-bharati-silver/80"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
