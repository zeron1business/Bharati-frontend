"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ProductCard } from "@/app/lib/types";

const CARD_GAP = 28;
const SCROLL_STEP = 1;

interface Props {
  /** Active products fetched directly from backend API */
  products?: ProductCard[];
}

/** Individual product circle card with lazy loading skeleton */
function ProductCircleCard({
  item,
}: {
  item: { id: string; name: string; image: string; href: string };
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="flex-shrink-0 category-card-item">
      <Link
        href={item.href}
        className="group flex flex-col items-center text-center"
      >
        {/* Circle with active product image & lazy loading placeholder */}
        <div className="category-circle relative rounded-full bg-bharati-ivory border border-bharati-mist/60 overflow-hidden mb-4 group-hover:border-bharati-mint/60 group-hover:shadow-lg transition-all duration-300">
          {/* Skeleton shimmer while image is lazy-loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-bharati-mist/30 via-bharati-ivory to-bharati-mist/10 animate-pulse rounded-full z-0" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            loading="lazy"
            unoptimized
            onLoad={() => setIsLoaded(true)}
            className={`object-cover transition-all duration-500 group-hover:scale-105 z-10 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            sizes="165px"
          />
        </div>
        {/* Product Label */}
        <span className="category-card-label font-medium text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300 leading-snug line-clamp-2">
          {item.name}
        </span>
      </Link>
    </div>
  );
}

export function ShopByCategory({ products = [] }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDirectionRef = useRef<1 | -1>(1);

  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Filter only active products that have a real uploaded primary image (unique list, no duplicates)
  const activeItems = useMemo(() => {
    return products
      .filter((p) => Boolean(p.primaryImageUrl && p.primaryImageUrl.trim().length > 0))
      .map((p) => ({
        id: p.id,
        name: p.name || p.title,
        image: p.primaryImageUrl,
        href: `/products/${p.slug}`,
      }));
  }, [products]);

  // ── Boundary detection for arrow buttons ──────────────────────────────────
  const updateScrollBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 4) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    // Left arrow only appears when scrolled away from start
    setCanScrollLeft(scrollLeft > 6);
    // Right arrow only appears when not yet reached the end
    setCanScrollRight(scrollLeft < maxScroll - 6);
  }, []);

  // ── Auto-scroll (reversible, smooth continuous movement) ────────────────────
  const scroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    if (scrollDirectionRef.current === 1) {
      // Scrolling right (forward)
      if (el.scrollLeft >= maxScroll - 4) {
        scrollDirectionRef.current = -1;
        updateScrollBounds();
        // Pause 2 seconds at the end before gently scrolling back
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(scroll);
        }, 2000);
        return;
      }
      el.scrollLeft += SCROLL_STEP;
    } else {
      // Scrolling left (backward)
      if (el.scrollLeft <= 4) {
        scrollDirectionRef.current = 1;
        updateScrollBounds();
        // Pause 2 seconds at start before gently scrolling forward again
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(scroll);
        }, 2000);
        return;
      }
      el.scrollLeft -= SCROLL_STEP;
    }

    updateScrollBounds();
    animFrameRef.current = requestAnimationFrame(scroll);
  }, [updateScrollBounds]);

  const startScroll = useCallback(() => {
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(scroll);
  }, [scroll]);

  const arrowAnimRef = useRef<number | null>(null);

  const stopScroll = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (arrowAnimRef.current) {
      cancelAnimationFrame(arrowAnimRef.current);
      arrowAnimRef.current = null;
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // Manual pause triggered ONLY when user explicitly clicks or manually scrolls
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    stopScroll();
  }, [stopScroll]);

  // ── Smooth slow transition to the next product on arrow click ───────────────
  const handleArrowScroll = useCallback((direction: "left" | "right") => {
    pauseAutoScroll();

    const el = trackRef.current;
    if (!el) return;

    if (arrowAnimRef.current) {
      cancelAnimationFrame(arrowAnimRef.current);
      arrowAnimRef.current = null;
    }

    const firstCard = el.querySelector<HTMLElement>(".category-card-item");
    const cardWidth = firstCard ? firstCard.offsetWidth : 160;
    const step = cardWidth + CARD_GAP;
    const maxScroll = el.scrollWidth - el.clientWidth;

    // Calculate next product aligned target
    const currentScroll = el.scrollLeft;
    const currentIndex = Math.round(currentScroll / step);
    const targetIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
    const target = Math.max(0, Math.min(maxScroll, targetIndex * step));

    const start = currentScroll;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;

    const duration = 850; // Smooth slow luxury transition (850ms)
    const startTime = performance.now();

    // Silky smooth ease-in-out cubic curve
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      el.scrollLeft = start + distance * ease;
      updateScrollBounds();

      if (progress < 1) {
        arrowAnimRef.current = requestAnimationFrame(animate);
      } else {
        el.scrollLeft = target;
        updateScrollBounds();
        arrowAnimRef.current = null;
      }
    };

    arrowAnimRef.current = requestAnimationFrame(animate);
  }, [pauseAutoScroll, updateScrollBounds]);

  const resumeAutoScroll = useCallback(() => {
    setIsPaused(false);
    startScroll();
  }, [startScroll]);

  // ── Resume auto-scroll when hovering or clicking OUTSIDE the section ───────
  useEffect(() => {
    const handleOutsideInteraction = (e: MouseEvent) => {
      if (
        isPaused &&
        sectionRef.current &&
        !sectionRef.current.contains(e.target as Node)
      ) {
        resumeAutoScroll();
      }
    };

    // Resumes as soon as mouse hovers outside the section
    window.addEventListener("mousemove", handleOutsideInteraction);
    // Also resumes on click outside (e.g. for touch devices)
    document.addEventListener("mousedown", handleOutsideInteraction);

    return () => {
      window.removeEventListener("mousemove", handleOutsideInteraction);
      document.removeEventListener("mousedown", handleOutsideInteraction);
    };
  }, [isPaused, resumeAutoScroll]);

  // Listen to manual scroll & window resize to update arrow boundaries
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      updateScrollBounds();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollBounds);

    // Initial check
    updateScrollBounds();

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [updateScrollBounds]);

  // Control start/stop based on isPaused state
  useEffect(() => {
    if (activeItems.length === 0) return;

    if (isPaused) {
      stopScroll();
    } else {
      startScroll();
    }

    return () => {
      stopScroll();
    };
  }, [isPaused, startScroll, stopScroll, activeItems.length]);

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      onPointerDown={pauseAutoScroll}
      onMouseLeave={resumeAutoScroll}
      className="py-14 md:py-20 bg-bharati-cream transition-colors"
      aria-label="Shop by Products"
    >
      <div className="section-container max-w-[1920px] mx-auto px-4 md:px-8">
        {/* Header */}
        <AnimatedSection className="flex items-end justify-between mb-10 md:mb-12">
          <div>
            <SectionLabel
              color="black"
              className="mb-2 block text-xs tracking-widest text-bharati-ash font-semibold uppercase"
            >
              Shop by Products
            </SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif text-[#449188] tracking-tight">
              Find your essentials
            </h2>
          </div>
          <div className="hidden md:block pb-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.1em] uppercase font-semibold text-bharati-ash hover:text-bharati-mint transition-colors duration-300"
            >
              View all Products
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </AnimatedSection>

        {/* Carousel with Dynamic Boundary Arrows */}
        <AnimatedSection delay={0.15} className="relative group/carousel">
          {/* Left Arrow Button — Only appears when list can be scrolled left */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleArrowScroll("left");
            }}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            className={`absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-bharati-white/95 hover:bg-bharati-white text-bharati-charcoal shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 border border-bharati-mist/60 hover:border-bharati-mint/60 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm ${canScrollLeft
                ? "opacity-100 pointer-events-auto translate-x-0"
                : "opacity-0 pointer-events-none -translate-x-2"
              }`}
          >
            <ChevronLeft size={20} className="stroke-[2.2]" />
          </button>

          {/* Left fade overlay */}
          <div
            className={`pointer-events-none absolute left-0 top-0 h-full w-12 md:w-16 z-10 transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"
              }`}
            style={{ background: "linear-gradient(to right, var(--color-bharati-cream), transparent)" }}
          />

          {/* Right fade overlay */}
          <div
            className={`pointer-events-none absolute right-0 top-0 h-full w-12 md:w-16 z-10 transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"
              }`}
            style={{ background: "linear-gradient(to left, var(--color-bharati-cream), transparent)" }}
          />

          {/* Right Arrow Button — Only appears when list can be scrolled right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleArrowScroll("right");
            }}
            aria-label="Scroll right"
            disabled={!canScrollRight}
            className={`absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-bharati-white/95 hover:bg-bharati-white text-bharati-charcoal shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 border border-bharati-mist/60 hover:border-bharati-mint/60 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm ${canScrollRight
                ? "opacity-100 pointer-events-auto translate-x-0"
                : "opacity-0 pointer-events-none translate-x-2"
              }`}
          >
            <ChevronRight size={20} className="stroke-[2.2]" />
          </button>

          {/* Scrollable track — 5 cards visible, unique items without duplication */}
          <div
            ref={trackRef}
            onWheel={pauseAutoScroll}
            onTouchStart={pauseAutoScroll}
            className="flex overflow-x-auto category-carousel-track"
            style={{ gap: `${CARD_GAP}px` }}
          >
            {activeItems.map((item) => (
              <ProductCircleCard key={item.id} item={item} />
            ))}
          </div>
        </AnimatedSection>

        {/* Mobile view all */}
        <div className="md:hidden mt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.1em] uppercase font-semibold text-bharati-ash"
          >
            View all Products
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
