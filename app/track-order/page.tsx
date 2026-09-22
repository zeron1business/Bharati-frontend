"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = orderNumber.trim();
    if (!cleanNumber) {
      setError("Please enter your order number");
      return;
    }
    router.push(`/orders/${cleanNumber}`);
  };

  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="max-w-2xl">
          <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
            Order Tracking
          </span>
          <h1 className="text-headline text-bharati-black mb-4">
            Track Your Order
          </h1>
          <p className="text-body-large text-bharati-ash mb-8 font-light">
            Enter your order number below to check live shipping status and delivery updates.
          </p>

          {/* Tracking form */}
          <div className="max-w-md">
            <form onSubmit={handleTrack} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-bharati-ivory border border-bharati-mist rounded-xl text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark font-medium"
                  placeholder="e.g. ORD-1726912345"
                  autoFocus
                />
                <button type="submit" className="btn-primary flex items-center gap-1 text-sm py-3 px-5">
                  <span>Track</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}
            </form>

            <p className="text-xs text-bharati-silver mt-4 font-light">
              You can find your order number in your order confirmation screen or SMS updates.
            </p>
          </div>

          <div className="mt-16 pt-10 border-t border-bharati-mist/60 flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-bharati-ash hover:text-bharati-black transition-colors"
            >
              &larr; Back to Home
            </Link>
            <Link
              href="/orders"
              className="text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark hover:underline transition-colors"
            >
              View Full Order History &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
