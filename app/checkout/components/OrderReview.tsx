"use client";

import React from "react";
import Image from "next/image";
import { CartItem, Address, AddressInput } from "@/types/ecommerce";
import { MapPin, ShieldCheck, RefreshCw, Truck, Package, Banknote } from "lucide-react";

interface OrderReviewProps {
  items: CartItem[];
  subtotal: number;
  selectedAddress?: Address | null;
  newAddress?: AddressInput | null;
  customerName?: string;
  customerPhone?: string;
  onEditAddress: () => void;
  onPlaceOrder: () => void;
  loading: boolean;
  errorMessage?: string | null;
}

export function OrderReview({
  items,
  subtotal,
  selectedAddress,
  newAddress,
  customerName,
  customerPhone,
  onEditAddress,
  onPlaceOrder,
  loading,
  errorMessage,
}: OrderReviewProps) {
  const displayAddress = selectedAddress || newAddress;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-bharati-mist/60">
        <div className="w-9 h-9 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center font-bold text-sm">
          4
        </div>
        <div>
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Review Your Order
          </h2>
          <p className="text-xs text-bharati-silver font-light">
            Please verify your delivery details and items before placing your order
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Delivery Summary Banner */}
      <div className="p-4 rounded-xl bg-bharati-ivory/80 border border-bharati-mist/60 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-bharati-mint-dark shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-bharati-charcoal">
                Delivering to {customerName || "Customer"}
              </span>
              {customerPhone && (
                <span className="text-xs text-bharati-silver">({customerPhone})</span>
              )}
            </div>
            {displayAddress && (
              <p className="text-xs text-bharati-ash leading-relaxed">
                {displayAddress.line1}
                {displayAddress.line2 ? `, ${displayAddress.line2}` : ""},{" "}
                {displayAddress.city}, {displayAddress.state} — {displayAddress.pincode}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onEditAddress}
          className="text-xs text-bharati-mint-dark hover:underline font-semibold shrink-0"
        >
          Change
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-bharati-charcoal block">
          Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
        </span>
        <div className="divide-y divide-bharati-mist/40 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || "default"}`}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-bharati-ivory rounded-lg overflow-hidden shrink-0 border border-bharati-mist/30">
                  <Image
                    src={item.imageUrl || "/products/cooker_cutout.png"}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-bharati-charcoal line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-bharati-silver">
                    Qty: {item.quantity} &times; ₹ {item.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-bharati-charcoal shrink-0">
                ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="pt-4 border-t border-bharati-mist/60 space-y-2.5 text-xs">
        <div className="flex justify-between text-bharati-ash">
          <span>Items Subtotal</span>
          <span className="font-medium text-bharati-charcoal">
            ₹ {subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between text-bharati-ash">
          <span>Delivery</span>
          <span className="font-semibold text-bharati-mint-dark uppercase tracking-wider">
            FREE
          </span>
        </div>
        <div className="flex justify-between text-bharati-ash">
          <span>Taxes</span>
          <span className="font-light text-bharati-silver">Included</span>
        </div>

        <div className="pt-3 border-t border-bharati-mist/60 flex justify-between items-baseline">
          <span className="text-sm font-semibold text-bharati-black">Total Amount</span>
          <span className="text-xl font-bold text-bharati-charcoal">
            ₹ {subtotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Place Order CTA */}
      <div className="space-y-3 pt-2">
        {/* COD badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-bharati-mint-dark bg-bharati-mint/10 border border-bharati-mint/20 rounded-xl py-2.5">
          <Banknote size={16} />
          <span>Payment Method: Cash on Delivery</span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={loading}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Placing Your Order...</span>
            </>
          ) : (
            <>
              <Truck size={18} />
              <span>Place Order — Pay on Delivery (₹ {subtotal.toLocaleString("en-IN")})</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-bharati-silver font-light">
          You will pay <strong className="text-bharati-charcoal">₹ {subtotal.toLocaleString("en-IN")}</strong> in cash when your order arrives at your doorstep.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-bharati-silver pt-1">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={14} className="text-bharati-mint-dark" />
            Verified Bharati Guarantee
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Truck size={14} className="text-bharati-mint-dark" />
            Complimentary Doorstep Shipping
          </span>
        </div>
      </div>
    </div>
  );
}
