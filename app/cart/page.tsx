"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Plus, Minus, ShieldCheck, Truck } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bharati-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-[var(--header-height)]">
        <div className="section-container section-spacing flex flex-col items-center justify-center text-center max-w-lg mx-auto py-24">
          <div className="w-20 h-20 rounded-full bg-bharati-ivory flex items-center justify-center text-bharati-ash mb-6">
            <ShoppingBag size={36} strokeWidth={1.2} />
          </div>
          <h1 className="text-2xl font-medium text-bharati-black mb-3">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-body-large text-bharati-ash mb-8 font-light">
            Discover our collection of modern, durable kitchenware crafted to elevate everyday Indian cooking.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Explore The Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10 pb-6 border-b border-bharati-mist/60">
          <div>
            <span className="text-label text-bharati-mint-dark mb-1 block font-medium">
              Checkout Bag
            </span>
            <h1 className="text-subtitle md:text-headline text-bharati-black">
              Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs tracking-wider uppercase text-bharati-silver hover:text-red-600 transition-colors self-start sm:self-auto"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold text-bharati-ash hover:text-bharati-mint-dark transition-colors group"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                Continue Shopping
              </Link>
            </div>

            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "default"}`}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-bharati-mist/70 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                {/* Product Image & Title */}
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-bharati-ivory rounded-xl overflow-hidden shrink-0 border border-bharati-mist/40">
                    <Image
                      src={item.imageUrl || "/products/cooker_cutout.png"}
                      alt={item.title}
                      fill
                      unoptimized={Boolean(item.imageUrl?.startsWith("http"))}
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium text-bharati-charcoal text-[1.05rem] hover:text-bharati-mint-dark transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm font-light text-bharati-silver">
                      Price: ₹ {item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Controls & Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-bharati-mist/40">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-bharati-mist rounded-full bg-bharati-ivory/60 px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="p-1 text-bharati-charcoal hover:text-bharati-mint-dark transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-bharati-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="p-1 text-bharati-charcoal hover:text-bharati-mint-dark transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal for Item */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-[1.1rem] font-semibold text-bharati-charcoal block">
                      ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="p-2 text-bharati-silver hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs sticky top-24 space-y-6">
              <h2 className="text-lg font-medium text-bharati-black pb-4 border-b border-bharati-mist/60">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-bharati-ash">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-bharati-charcoal">
                    ₹ {subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-bharati-ash">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-bharati-mint-dark uppercase text-xs tracking-wider">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-bharati-ash">
                  <span>Estimated Tax</span>
                  <span className="font-light text-bharati-silver">
                    Included
                  </span>
                </div>

                <div className="pt-4 border-t border-bharati-mist/60 flex justify-between items-baseline">
                  <span className="text-base font-medium text-bharati-black">Total</span>
                  <span className="text-2xl font-bold text-bharati-charcoal">
                    ₹ {subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full py-4 text-center block text-[0.95rem] font-medium"
              >
                Proceed to Checkout
              </Link>

              {/* Guarantees */}
              <div className="pt-4 space-y-3 text-xs text-bharati-silver font-light">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-bharati-mint-dark shrink-0" />
                  <span>Complimentary insured shipping on all orders</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-bharati-mint-dark shrink-0" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
