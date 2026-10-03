"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { fetchTopBannerPromos } from "@/app/lib/api";

export interface PromoCodeItem {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountCap?: number;
  isActive: boolean;
  displayInHero?: boolean;
  displayInTopBanner?: boolean;
}

export const DEFAULT_PROMOS: PromoCodeItem[] = [
  {
    id: "diwali25",
    code: "DIWALI25",
    description: "Massive Diwali Sale! 25% off up to ₹2000",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minOrderValue: 2000,
    isActive: true,
    displayInHero: true,
  },
  {
    id: "welcome10",
    code: "WELCOME10",
    description: "10% off on your first order up to ₹500",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 1000,
    isActive: true,
    displayInHero: true,
  },
  {
    id: "flat200",
    code: "FLAT200",
    description: "Flat ₹200 off on orders above ₹1500",
    discountType: "FIXED",
    discountValue: 200,
    minOrderValue: 1500,
    isActive: true,
    displayInHero: true,
  },
];

interface PromoBannerProps {
  promos?: PromoCodeItem[];
}

export function PromoBanner({ promos: initialPromos = [] }: PromoBannerProps) {
  const [promos, setPromos] = useState<PromoCodeItem[]>(() => {
    return initialPromos && initialPromos.length > 0 ? initialPromos : DEFAULT_PROMOS;
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with initial promos if passed
  useEffect(() => {
    if (initialPromos && initialPromos.length > 0) {
      setPromos(initialPromos);
    }
  }, [initialPromos]);

  // Client-side fetch live promos from backend
  useEffect(() => {
    let isMounted = true;
    fetchTopBannerPromos()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPromos(data);
        }
      })
      .catch((err) => {
        console.warn("Could not refresh top banner promos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (e: React.MouseEvent | React.TouchEvent, code: string) => {
    e.stopPropagation();
    setIsPaused(true);
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
      setIsPaused(false);
    }, 2200);
  };

  // Build repeating items to ensure track is comfortably wider than any screen
  const repeatCount = useMemo(() => {
    if (promos.length === 1) return 4;
    if (promos.length === 2) return 3;
    return 2;
  }, [promos.length]);

  const set1 = useMemo(() => {
    const items: PromoCodeItem[] = [];
    for (let r = 0; r < repeatCount; r++) {
      items.push(...promos);
    }
    return items;
  }, [promos, repeatCount]);

  if (promos.length === 0) return null;

  const renderItem = (promo: PromoCodeItem, key: string) => {
    const isCopied = copiedCode === promo.code;

    // Prioritize user's exact announcement text given in description
    const displayText = promo.description?.trim()
      ? promo.description.trim()
      : promo.discountValue
        ? promo.discountType === "PERCENTAGE"
          ? `${promo.discountValue}% OFF`
          : `FLAT ₹${promo.discountValue} OFF`
        : promo.code
          ? "SPECIAL OFFER"
          : "";

    if (!displayText && !promo.code) return null;

    return (
      <div
        key={key}
        className="flex items-center gap-2.5 sm:gap-3 shrink-0 px-4 sm:px-8"
      >
        {/* User-given Announcement Text / Headline */}
        {displayText && (
          <span className="text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
            {displayText}
            {/* Show min order value only if not already mentioned in user's text */}
            {promo.minOrderValue && !displayText.toLowerCase().includes("order") && (
              <span className="text-white/85 font-normal ml-1">
                ON ORDERS OVER ₹{promo.minOrderValue}
              </span>
            )}
          </span>
        )}

        {/* Separator dot */}
        {displayText && promo.code && (
          <span className="text-white/40 text-[10px] select-none">•</span>
        )}

        {/* Interactive Copyable Promo Code Badge */}
        {promo.code && (
          <button
            type="button"
            onClick={(e) => handleCopy(e, promo.code)}
            title="Click to copy promo code"
            className="group/btn inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[#fcedc7] border border-white/20 transition-all cursor-pointer shadow-xs select-none shrink-0"
          >
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90">
              CODE:
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#fcedc7]">
              {promo.code}
            </span>
            {isCopied ? (
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-300 ml-0.5">
                <Check size={12} strokeWidth={2.5} className="mr-0.5" /> COPIED!
              </span>
            ) : (
              <Copy
                size={11}
                strokeWidth={1.75}
                className="text-white/70 group-hover/btn:text-white transition-colors ml-0.5"
              />
            )}
          </button>
        )}

        {/* Visual Separator between different promo entries */}
        <span className="text-white/30 text-xs sm:text-sm ml-4 sm:ml-8 select-none">
          ✦
        </span>
      </div>
    );
  };

  return (
    <aside
      aria-label="Promotion Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="marquee-container fixed top-0 left-0 right-0 h-[var(--banner-height,38px)] min-h-[38px] z-[60] bg-black border-b border-white/10 text-white flex items-center overflow-hidden shadow-xs select-none"
      style={{ height: "var(--banner-height, 38px)" }}
    >
      <div
        className="w-full h-full flex items-center overflow-hidden select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Track 1 */}
        <div
          className="animate-marquee-track flex items-center shrink-0"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {set1.map((promo, idx) => renderItem(promo, `s1-${idx}-${promo.id}`))}
        </div>

        {/* Track 2 (Identical seamless duplicate for endless loop) */}
        <div
          className="animate-marquee-track flex items-center shrink-0"
          aria-hidden="true"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {set1.map((promo, idx) => renderItem(promo, `s2-${idx}-${promo.id}`))}
        </div>
      </div>
    </aside>
  );
}
