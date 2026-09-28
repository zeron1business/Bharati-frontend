"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrderByNumber } from "@/lib/api";
import { OrderDetail } from "@/types/ecommerce";
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  Printer,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const isSuccess = searchParams.get("status") === "success";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    getOrderByNumber(orderNumber)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Error fetching order details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not retrieve order details. Please ensure you are logged in."
        );
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-bharati-mint-dark animate-spin" />
          <p className="text-xs text-bharati-silver uppercase tracking-wider">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
        <div className="section-container section-spacing max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <Package size={28} />
          </div>
          <h1 className="text-xl font-medium text-bharati-charcoal mb-2">
            Order Not Found
          </h1>
          <p className="text-xs text-bharati-silver leading-relaxed mb-6 font-light">
            {error || `We could not find an order matching "${orderNumber}".`}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/track-order" className="btn-secondary text-xs">
              Track Another Order
            </Link>
            <Link href="/products" className="btn-primary text-xs">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto space-y-8">
        {/* Success Banner if redirected from successful payment */}
        {isSuccess && (
          <div className="bg-bharati-mint/10 border border-bharati-mint/30 rounded-2xl p-6 sm:p-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-bharati-mint text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-medium text-bharati-black">
              Thank You! Your Order is Confirmed
            </h1>
            <p className="text-sm text-bharati-ash max-w-md mx-auto font-light">
              We have received your payment. Your handcrafted Bharati cookware is being prepared for dispatch.
            </p>
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-bharati-charcoal tracking-tight">
                Order #{order.orderNumber}
              </h2>
              <span
                className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                  order.status === "PAID" || order.status === "CONFIRMED"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.status === "SHIPPED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-bharati-silver font-light">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> Placed on {orderDate}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard size={14} /> Razorpay Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-bharati-ash hover:text-bharati-charcoal border border-bharati-mist px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Printer size={14} />
            Print Receipt
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items & Shipping Snapshot */}
          <div className="lg:col-span-8 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60">
                Purchased Items ({order.items.length})
              </h3>
              <div className="divide-y divide-bharati-mist/50">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-bharati-ivory rounded-xl overflow-hidden shrink-0 border border-bharati-mist/30">
                        <Image
                          src={item.productImageUrl || "/products/cooker_cutout.png"}
                          alt={item.titleSnapshot}
                          fill
                          unoptimized={Boolean(item.productImageUrl?.startsWith("http"))}
                          className="object-contain p-2"
                          sizes="64px"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm text-bharati-charcoal">
                          {item.titleSnapshot}
                        </h4>
                        <p className="text-xs text-bharati-silver">
                          Qty: {item.quantity} &times; ₹ {Number(item.priceSnapshot).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-bharati-charcoal">
                      ₹ {(Number(item.priceSnapshot) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Snapshot */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60 flex items-center gap-2">
                <MapPin size={16} className="text-bharati-mint-dark" />
                Shipping Details
              </h3>
              <div className="text-xs text-bharati-ash space-y-1 leading-relaxed">
                <p className="font-semibold text-bharati-charcoal text-sm">
                  {order.shippingName || "Customer"}
                </p>
                {order.shippingPhone && (
                  <p className="text-bharati-silver">Contact: +91 {order.shippingPhone}</p>
                )}
                <p>
                  {order.shippingLine1}
                  {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                </p>
                <p>
                  {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
                </p>
                <p className="text-bharati-silver">{order.shippingCountry || "India"}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-4 sticky top-24">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60">
                Payment Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-bharati-ash">
                  <span>Subtotal</span>
                  <span className="font-medium text-bharati-charcoal">
                    ₹ {Number(order.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-bharati-ash">
                  <span>Delivery</span>
                  <span className="font-semibold text-bharati-mint-dark uppercase">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-bharati-ash">
                  <span>Taxes</span>
                  <span className="font-light text-bharati-silver">Included</span>
                </div>

                <div className="pt-3 border-t border-bharati-mist/60 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-bharati-black">Paid Total</span>
                  <span className="text-xl font-bold text-bharati-charcoal">
                    ₹ {Number(order.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-bharati-mist/60 space-y-3">
                <Link
                  href="/products"
                  className="btn-primary w-full py-3.5 text-center block text-xs"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/orders"
                  className="btn-secondary w-full py-3.5 text-center block text-xs"
                >
                  View All Orders
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-bharati-silver pt-2">
                <ShieldCheck size={14} className="text-bharati-mint-dark" />
                <span>Bharati 5-Year Replacement Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
