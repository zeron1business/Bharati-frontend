"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
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

const DEFAULT_PROMOS: PromoCodeItem[] = [
  {
    id: "welcome10",
    code: "WELCOME10",
    description: "10% off on your first order",
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

const SCROLL_SPEED = 0.85; // Silky smooth 60fps velocity

export function PromoBanner({ promos: initialPromos = [] }: PromoBannerProps) {
  const [promos, setPromos] = useState<PromoCodeItem[]>(() => {
    return initialPromos && initialPromos.length > 0 ? initialPromos : DEFAULT_PROMOS;
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const bannerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);

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

  // ── Auto-scroll circular loop ─────────────────────────────────────────────
  const scroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || isPausedRef.current) return;

    const halfWidth = el.scrollWidth / 2;
    if (halfWidth > 0) {
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      } else {
        el.scrollLeft += SCROLL_SPEED;
      }
    }

    animFrameRef.current = requestAnimationFrame(scroll);
  }, []);

  const startScroll = useCallback(() => {
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(scroll);
  }, [scroll]);

  const stopScroll = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // ── Pause ONLY on manual user stopping (drag, click, touch, wheel) ─────────
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    stopScroll();
  }, [stopScroll]);

  // ── Resume auto-scroll ───────────────────────────────────────────────────
  const resumeAutoScroll = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    startScroll();
  }, [startScroll]);

  // Resume when mouse moves/clicks outside the banner
  useEffect(() => {
    const handleOutsideInteraction = (e: MouseEvent) => {
      if (
        isPausedRef.current &&
        bannerRef.current &&
        !bannerRef.current.contains(e.target as Node)
      ) {
        resumeAutoScroll();
      }
    };

    window.addEventListener("mousemove", handleOutsideInteraction);
    document.addEventListener("mousedown", handleOutsideInteraction);

    return () => {
      window.removeEventListener("mousemove", handleOutsideInteraction);
      document.removeEventListener("mousedown", handleOutsideInteraction);
    };
  }, [resumeAutoScroll]);

  // Resume on focus change, window focus, or visibility change
  useEffect(() => {
    const handleFocusChange = () => {
      resumeAutoScroll();
    };

    window.addEventListener("focus", handleFocusChange);
    window.addEventListener("blur", handleFocusChange);
    document.addEventListener("visibilitychange", handleFocusChange);

    return () => {
      window.removeEventListener("focus", handleFocusChange);
      window.removeEventListener("blur", handleFocusChange);
      document.removeEventListener("visibilitychange", handleFocusChange);
    };
  }, [resumeAutoScroll]);

  // Start scrolling on mount & handle paused state changes
  useEffect(() => {
    if (isPaused) {
      stopScroll();
    } else {
      startScroll();
    }
    return () => stopScroll();
  }, [isPaused, startScroll, stopScroll]);

  // ── Mouse Drag Support ───────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoScroll();
    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollStartLeftRef.current = trackRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - dragStartXRef.current) * 1.4;
    trackRef.current.scrollLeft = scrollStartLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    pauseAutoScroll();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2200);
  };

  // Circular queue sets (each set repeated so Set 1 width > viewport width)
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

  const set2 = set1; // Identical duplicate for seamless continuous wrap

  const renderItem = (promo: PromoCodeItem, key: string) => {
    const isCopied = copiedCode === promo.code;
    const discountText =
      promo.discountType === "PERCENTAGE"
        ? `${promo.discountValue}% OFF`
        : `FLAT ₹${promo.discountValue} OFF`;

    return (
      <div
        key={key}
        className="flex items-center gap-3 shrink-0 px-6 sm:px-10"
      >
        {/* Discount Headline */}
        <span className="text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
          {discountText}
          {promo.minOrderValue && (
            <span className="text-white/85 font-normal ml-1">
              ON ORDERS OVER ₹{promo.minOrderValue}
            </span>
          )}
        </span>


        {/* Separator dot */}
        <span className="text-white/40 text-[10px] select-none">•</span>

        {/* Interactive Copyable Promo Code Badge */}
        <button
          type="button"
          onClick={(e) => handleCopy(e, promo.code)}
          title="Click to copy promo code"
          className="group/btn inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[#fcedc7] border border-white/20 transition-all cursor-pointer shadow-xs select-none"
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

        {/* Visual Separator between different promo entries */}
        <span className="text-white/30 text-xs sm:text-sm ml-6 sm:ml-10 select-none">
          ✦
        </span>
      </div>
    );
  };

  return (
    <aside
      ref={bannerRef}
      aria-label="Promotion Banner"
      onPointerDown={pauseAutoScroll}
      onWheel={pauseAutoScroll}
      onTouchStart={pauseAutoScroll}
      onMouseLeave={() => {
        handleMouseUpOrLeave();
        resumeAutoScroll();
      }}
      className="fixed top-0 left-0 right-0 h-[var(--banner-height)] z-[60] bg-black border-b border-white/10 text-white flex items-center overflow-hidden shadow-xs select-none"
    >
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className="w-full h-full flex items-center overflow-x-auto select-none cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Set 1 */}
        <div className="flex items-center shrink-0">
          {set1.map((promo, idx) => renderItem(promo, `s1-${idx}-${promo.id}`))}
        </div>

        {/* Set 2 (Identical duplicate for seamless endless circular queue) */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {set2.map((promo, idx) => renderItem(promo, `s2-${idx}-${promo.id}`))}
        </div>
      </div>
    </aside>
  );
}
