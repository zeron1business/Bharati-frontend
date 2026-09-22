"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/lib/api";
import { OrderDetail } from "@/types/ecommerce";
import { Package, Calendar, ArrowRight, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";
import { OtpVerification } from "@/app/checkout/components/OtpVerification";

export default function OrdersHistoryPage() {
  const { isLoggedIn, isLoading: authLoading, customer } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    getMyOrders()
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Error fetching order history:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load orders. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-bharati-mint-dark animate-spin" />
          <p className="text-xs text-bharati-silver uppercase tracking-wider">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, show OTP login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
        <div className="section-container section-spacing max-w-md mx-auto py-16">
          <div className="text-center mb-8">
            <span className="text-label text-bharati-mint-dark mb-2 block font-medium">
              Customer Portal
            </span>
            <h1 className="text-2xl font-medium text-bharati-black mb-2">
              View Your Orders
            </h1>
            <p className="text-xs text-bharati-silver font-light">
              Enter your mobile number to view past purchases and delivery status
            </p>
          </div>
          <OtpVerification onVerified={() => setLoading(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-bharati-mist/60">
          <div>
            <span className="text-label text-bharati-mint-dark mb-1 block font-medium">
              Order History
            </span>
            <h1 className="text-headline text-bharati-black">
              Your Orders ({orders.length})
            </h1>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-bharati-ash hover:text-bharati-mint-dark transition-colors self-start sm:self-auto"
          >
            Explore More Cookware &rarr;
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-bharati-mist text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-bharati-ivory flex items-center justify-center text-bharati-ash mx-auto">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-bharati-charcoal">
              No Orders Placed Yet
            </h2>
            <p className="text-xs text-bharati-silver font-light leading-relaxed">
              Explore our range of premium cookers and utensils to place your first order.
            </p>
            <Link href="/products" className="btn-primary inline-flex text-xs">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 border border-bharati-mist shadow-xs space-y-5 hover:border-bharati-mint/40 transition-colors"
                >
                  {/* Order header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-bharati-mist/50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-bharati-charcoal text-base">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
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

                    <div className="flex items-center gap-4 text-xs text-bharati-silver">
                      <span className="inline-flex items-center gap-1.5 font-light">
                        <Calendar size={14} /> {orderDate}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-bharati-charcoal text-sm">
                        ₹ {Number(order.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnails preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative w-14 h-14 bg-bharati-ivory rounded-xl overflow-hidden shrink-0 border border-bharati-mist/30"
                          title={item.titleSnapshot}
                        >
                          <Image
                            src={item.productImageUrl || "/products/cooker_cutout.png"}
                            alt={item.titleSnapshot}
                            fill
                            className="object-contain p-1.5"
                            sizes="56px"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-14 h-14 bg-bharati-ivory rounded-xl border border-bharati-mist/30 flex items-center justify-center text-xs font-semibold text-bharati-silver shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold text-bharati-mint-dark hover:text-bharati-charcoal py-2 px-4 rounded-xl border border-bharati-mist hover:border-bharati-mint transition-colors self-start sm:self-auto"
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
