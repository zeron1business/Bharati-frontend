"use client";

import { ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";
import { useEffect, useRef, useState, useCallback } from "react";

const CARD_GAP = 24;
const SCROLL_STEP = 1;

interface Review {
  id: string;
  text: string;
  author: string;
  city: string;
  product: string;
  rating: number;
}

const reviewsData: Review[] = [
  {
    id: "r1",
    text: "Excellent quality and very easy to use. The heat distribution is completely even, cooking biryani and curries to sheer perfection.",
    author: "Priya S.",
    city: "Mumbai",
    product: "Tri-ply Stainless Steel Kadai",
    rating: 5,
  },
  {
    id: "r2",
    text: "Sturdy build and stylish design. The lid locking mechanism and safety pressure valve give total peace of mind. A true kitchen essential!",
    author: "Rohit M.",
    city: "Bengaluru",
    product: "Outer Lid Pressure Cooker",
    rating: 5,
  },
  {
    id: "r3",
    text: "Great product. Very happy with the performance and mirror finish. Cooks with noticeably less oil and cleans up effortlessly.",
    author: "Ananya B.",
    city: "New Delhi",
    product: "Heritage Fry Pan",
    rating: 5,
  },
  {
    id: "r4",
    text: "The best cookware we have owned. Substantial weight, stay-cool handles, and impeccable craftsmanship that will last decades.",
    author: "Meera K.",
    city: "Chennai",
    product: "Tri-ply Saucepan",
    rating: 5,
  },
  {
    id: "r5",
    text: "Fast cooking, beautiful aesthetics and tremendous value. The food stays warm for hours. Truly proud to own Bharati cookware.",
    author: "Arjun P.",
    city: "Pune",
    product: "Signature Biryani Handi",
    rating: 5,
  },
  {
    id: "r6",
    text: "Remarkable heat retention. We make phulkas and dosas every morning and nothing ever sticks. Outstanding heirloom quality.",
    author: "Kavita R.",
    city: "Hyderabad",
    product: "Pre-Seasoned Cast Iron Tawa",
    rating: 5,
  },
  {
    id: "r7",
    text: "Flawless mirror polish and heavy three-layer steel base. Even after months of rigorous daily use, it still looks brand new.",
    author: "Vikram T.",
    city: "Kolkata",
    product: "Tri-ply Dutch Casserole",
    rating: 5,
  },
  {
    id: "r8",
    text: "Such thoughtfully designed cookware. The ergonomic handles and drip-free pouring rim make everyday cooking a joy.",
    author: "Sneha D.",
    city: "Ahmedabad",
    product: "Tri-ply Tea & Milk Pan",
    rating: 5,
  },
];

export function CustomerReviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDirectionRef = useRef<1 | -1>(1);

  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // ── Smooth slow transition to the next review card on arrow click ──────────
  const handleArrowScroll = useCallback(
    (direction: "left" | "right") => {
      pauseAutoScroll();

      const el = trackRef.current;
      if (!el) return;

      if (arrowAnimRef.current) {
        cancelAnimationFrame(arrowAnimRef.current);
        arrowAnimRef.current = null;
      }

      const firstCard = el.querySelector<HTMLElement>(".review-card-item");
      const cardWidth = firstCard ? firstCard.offsetWidth : 380;
      const step = cardWidth + CARD_GAP;
      const maxScroll = el.scrollWidth - el.clientWidth;

      // Calculate next review card aligned target
      const currentScroll = el.scrollLeft;
      const currentIndex = Math.round(currentScroll / step);
      const targetIndex =
        direction === "right" ? currentIndex + 1 : currentIndex - 1;
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
    },
    [pauseAutoScroll, updateScrollBounds]
  );

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

    window.addEventListener("mousemove", handleOutsideInteraction);
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
    if (isPaused) {
      stopScroll();
    } else {
      startScroll();
    }

    return () => {
      stopScroll();
    };
  }, [isPaused, startScroll, stopScroll]);

  return (
    <section
      ref={sectionRef}
      onPointerDown={pauseAutoScroll}
      onMouseLeave={resumeAutoScroll}
      className="py-16 md:py-24 bg-[#faf8f5] transition-colors"
      aria-label="Customer Reviews"
    >
      <div className="section-container max-w-[1920px] mx-auto px-4 md:px-8">
        {/* Header */}
        <AnimatedSection className="mb-10 md:mb-12">
          <div>
            <SectionLabel
              color="black"
              className="mb-2 block text-xs tracking-widest text-bharati-ash font-semibold uppercase"
            >
              Customer Reviews
            </SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif text-[#449188] tracking-tight">
              Loved by home cooks
            </h2>
          </div>
        </AnimatedSection>

        {/* Carousel with Dynamic Boundary Arrows */}
        <AnimatedSection delay={0.15} className="relative group/carousel">
          {/* Left Arrow Button — Appears when list can be scrolled left */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleArrowScroll("left");
            }}
            aria-label="Previous reviews"
            disabled={!canScrollLeft}
            className={`absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 hover:bg-white text-bharati-charcoal shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 border border-[#e7e1d5] hover:border-[#6fa89b] hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm ${
              canScrollLeft
                ? "opacity-100 pointer-events-auto translate-x-0"
                : "opacity-0 pointer-events-none -translate-x-2"
            }`}
          >
            <ChevronLeft size={22} className="stroke-[2.2]" />
          </button>

          {/* Left fade overlay */}
          <div
            className={`pointer-events-none absolute left-0 top-0 h-full w-12 md:w-16 z-10 transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(to right, #faf8f5, transparent)",
            }}
          />

          {/* Right fade overlay */}
          <div
            className={`pointer-events-none absolute right-0 top-0 h-full w-12 md:w-16 z-10 transition-opacity duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(to left, #faf8f5, transparent)",
            }}
          />

          {/* Right Arrow Button — Appears when list can be scrolled right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleArrowScroll("right");
            }}
            aria-label="Next reviews"
            disabled={!canScrollRight}
            className={`absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 hover:bg-white text-bharati-charcoal shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-300 border border-[#e7e1d5] hover:border-[#6fa89b] hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm ${
              canScrollRight
                ? "opacity-100 pointer-events-auto translate-x-0"
                : "opacity-0 pointer-events-none translate-x-2"
            }`}
          >
            <ChevronRight size={22} className="stroke-[2.2]" />
          </button>

          {/* Scrollable track — Luxury Review Cards */}
          <div
            ref={trackRef}
            onWheel={pauseAutoScroll}
            onTouchStart={pauseAutoScroll}
            className="flex overflow-x-auto hide-scrollbar py-3"
            style={{
              gap: `${CARD_GAP}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {reviewsData.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-[300px] sm:w-[350px] md:w-[390px] review-card-item"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-[22px] border border-[#e7e1d5] p-7 md:p-8 h-full flex flex-col justify-between shadow-[0_4px_24px_rgba(27,77,69,0.03)] hover:shadow-[0_12px_32px_rgba(27,77,69,0.08)] hover:-translate-y-1 transition-all duration-300">
                  {/* Top: Star rating & Verified Buyer badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          strokeWidth={0}
                          fill="#6fa89b"
                          className="text-[#6fa89b]"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#6fa89b]/12 text-[#5a8f83] text-[0.68rem] font-semibold tracking-wide">
                      <Check size={11} strokeWidth={2.6} />
                      <span>Verified Buyer</span>
                    </div>
                  </div>

                  {/* Review quote text */}
                  <p className="text-[0.93rem] md:text-[0.98rem] text-bharati-charcoal/90 leading-relaxed font-normal mb-6 flex-1">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Bottom: Author & Cookware details */}
                  <div className="pt-4 border-t border-[#f0ece4] flex items-center justify-between">
                    <div>
                      <h4 className="text-[0.88rem] font-semibold text-bharati-charcoal tracking-tight">
                        {review.author}
                      </h4>
                      <p className="text-[0.75rem] text-bharati-ash font-normal mt-0.5">
                        {review.city} &bull;{" "}
                        <span className="text-[#5a8f83] font-medium">
                          {review.product}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

