"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trackOrder } from "@/lib/api";
import { TrackOrderData } from "@/types/ecommerce";
import StatusTimeline from "./components/StatusTimeline";
import {
  ArrowRight,
  Package,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackOrderData | null>(null);
  const [copied, setCopied] = useState(false);

  const performTrack = async (numToSearch: string) => {
    const cleanNumber = numToSearch.trim();
    if (!cleanNumber) {
      setError("Please enter your order number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await trackOrder(cleanNumber);
      setTrackingData(data);
    } catch (err: unknown) {
      console.error("Tracking error:", err);
      setTrackingData(null);
      setError(
        err instanceof Error
          ? err.message
          : "We could not find an order matching that number. Please verify and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      performTrack(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(orderNumber);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Delivered
        </span>
      );
    }
    if (s === "SHIPPED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          On The Way
        </span>
      );
    }
    if (s === "CONFIRMED" || s === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Processing
        </span>
      );
    }
    if (s === "CANCELLED" || s === "PAYMENT_FAILED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          {s === "CANCELLED" ? "Cancelled" : "Failed"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        Order Placed
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto py-10 sm:py-16">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark mb-2 inline-block">
            Order Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-bharati-charcoal tracking-tight mb-3">
            Track Your Order
          </h1>
          <p className="text-sm text-bharati-ash font-light leading-relaxed">
            Enter your order number to get live status, shipping progress, and package details.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs max-w-xl mx-auto mb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="orderNumberInput"
                className="block text-xs font-semibold uppercase tracking-wider text-bharati-charcoal mb-2"
              >
                Order Number
              </label>
              <div className="relative flex items-center">
                <Search
                  size={18}
                  className="absolute left-4 text-bharati-silver pointer-events-none"
                />
                <input
                  id="orderNumberInput"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-bharati-ivory/60 border border-bharati-mist rounded-xl text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white font-medium transition-all"
                  placeholder="e.g. ORD-1726912345"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold rounded-xl shadow-xs transition-transform active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Checking Status...</span>
                </>
              ) : (
                <>
                  <span>Track Package</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
              >
                <AlertTriangle size={16} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </motion.div>
            )}
          </form>

          <p className="text-[11px] text-bharati-silver mt-4 text-center font-light">
            You can find your order number in your order confirmation SMS or receipt.
          </p>
        </div>

        {/* Tracking Results Area */}
        <AnimatePresence mode="wait">
          {trackingData && (
            <motion.div
              key={trackingData.orderNumber}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Order Status Header Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs uppercase tracking-wider text-bharati-ash font-medium">
                      Order Number
                    </span>
                    <button
                      onClick={() => handleCopy(trackingData.orderNumber)}
                      className="inline-flex items-center gap-1.5 text-base sm:text-lg font-bold font-mono text-bharati-charcoal hover:text-bharati-mint-dark transition-colors"
                      title="Click to copy order number"
                    >
                      {trackingData.orderNumber}
                      {copied ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} className="text-bharati-silver" />
                      )}
                    </button>
                  </div>
                  {trackingData.shippingCity && (
                    <div className="flex items-center gap-1.5 text-xs text-bharati-ash">
                      <MapPin size={14} className="text-bharati-mint-dark" />
                      <span>
                        Destination: {trackingData.shippingCity}
                        {trackingData.shippingState ? `, ${trackingData.shippingState}` : ""}
                        {trackingData.shippingPincode ? ` — ${trackingData.shippingPincode}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {getStatusBadge(trackingData.status)}
                </div>
              </div>

              {/* Status Timeline Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-bharati-charcoal pb-4 border-b border-bharati-mist/60 mb-6 flex items-center gap-2">
                  <Package size={16} className="text-bharati-mint-dark" />
                  Order Journey
                </h3>
                <StatusTimeline
                  status={trackingData.status}
                  createdAt={trackingData.createdAt}
                  updatedAt={trackingData.updatedAt}
                />
              </div>

              {/* Package Items Preview Card */}
              {trackingData.items && trackingData.items.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-bharati-charcoal pb-4 border-b border-bharati-mist/60 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-bharati-mint-dark" />
                      Items in this Package
                    </span>
                    <span className="text-xs text-bharati-ash font-medium">
                      {trackingData.itemCount} {trackingData.itemCount === 1 ? "Item" : "Items"}
                    </span>
                  </h3>

                  <div className="divide-y divide-bharati-mist/50">
                    {trackingData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-4 first:pt-2 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 bg-bharati-ivory rounded-xl overflow-hidden shrink-0 border border-bharati-mist/40">
                            <Image
                              src={item.productImageUrl || "/products/cooker_cutout.png"}
                              alt={item.titleSnapshot || "Product item"}
                              fill
                              unoptimized={Boolean(item.productImageUrl?.startsWith("http"))}
                              className="object-contain p-1.5"
                              sizes="56px"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-bharati-charcoal line-clamp-1">
                              {item.titleSnapshot}
                            </h4>
                            <p className="text-xs text-bharati-silver mt-0.5">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <Link
                  href={`/orders/${trackingData.orderNumber}`}
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-3 px-6 rounded-xl font-semibold uppercase tracking-wider"
                >
                  <span>View Full Order Details & Invoice</span>
                  <ExternalLink size={14} />
                </Link>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      setTrackingData(null);
                      setOrderNumber("");
                    }}
                    className="text-xs font-semibold uppercase tracking-wider text-bharati-ash hover:text-bharati-charcoal transition-colors"
                  >
                    Track Another
                  </button>
                  <Link
                    href="/products"
                    className="text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark hover:underline transition-colors"
                  >
                    Continue Shopping &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        {!trackingData && (
          <div className="mt-12 pt-8 border-t border-bharati-mist/60 flex items-center justify-center gap-8">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-bharati-ash hover:text-bharati-charcoal transition-colors"
            >
              &larr; Back to Home
            </Link>
            <Link
              href="/orders"
              className="text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark hover:underline transition-colors"
            >
              My Orders &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="text-bharati-mint-dark animate-spin" />
            <p className="text-xs text-bharati-silver uppercase tracking-wider">
              Loading tracking page...
            </p>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
