"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

const BLOCK_GAP = 24;
const SCROLL_STEP = 0.45; // Slow, serene luxury drift

interface BentoItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
  badge?: string;
}

interface BentoBlock {
  id: string;
  box1: BentoItem; // Top-left (square/medium)
  box2: BentoItem; // Top-middle (square/medium)
  box3: BentoItem; // Bottom-wide (_700_450)
  box4: BentoItem; // Right-tall (_600_800)
}

// Set 1: Uses 550_550, 700_450, and 600_800 images
const BLOCK_SET_1: BentoBlock = {
  id: "block-1",
  box1: {
    id: "saucepan",
    name: "Tri-ply Saucepan",
    tagline: "Everyday meals, perfected.",
    image: "/masonry/SaucePan_550_550.jpeg",
    href: "/products/triply-saucepan",
  },
  box2: {
    id: "handi-pot",
    name: "Tri-ply Handi Pot",
    tagline: "Uniform heat for slow cooking.",
    image: "/masonry/HandiPot_550_550.jpeg",
    href: "/products/triply-handi-pot",
  },
  box3: {
    id: "handi-cooker",
    name: "Handi Pressure Cooker",
    tagline: "Traditional handi contour with modern safety.",
    image: "/masonry/HandiCooker_700_450.jpeg",
    href: "/products/bharati-handi-pressure-cooker",
    badge: "Heritage",
  },
  box4: {
    id: "regular-cooker",
    name: "Regular Pressure Cooker",
    tagline: "Safe. Strong. Timeless Indian cooking.",
    image: "/masonry/RegularCooker_600_800.jpeg",
    href: "/products/bharati-regular-pressure-cooker",
    badge: "Bestseller",
  },
};

// Set 2: Uses 500_650, 700_450, and 600_800 images
const BLOCK_SET_2: BentoBlock = {
  id: "block-2",
  box1: {
    id: "kadai",
    name: "Tri-ply Kadai",
    tagline: "Deep cooking for richer gravies.",
    image: "/masonry/Kadai_500_650.jpeg",
    href: "/products/triply-kadhai",
  },
  box2: {
    id: "belly-cooker",
    name: "Belly Cooking Pot",
    tagline: "Spacious design for celebrations.",
    image: "/masonry/BellyCooker_500_650.jpeg",
    href: "/products/bharati-belly-pressure-cooker",
  },
  box3: {
    id: "casserole",
    name: "Tri-ply Casserole",
    tagline: "Built for slow simmering and elegant serving.",
    image: "/masonry/Casserole_700_450.jpeg",
    href: "/products/triply-casserole",
    badge: "Tri-ply",
  },
  box4: {
    id: "frypan",
    name: "Tri-ply Frypan",
    tagline: "Even heat distribution for effortless searing.",
    image: "/masonry/FryPan_600_800.jpeg",
    href: "/products/triply-frypan",
  },
};

/** Individual curvy card inside the bento grid */
function BentoCard({
  item,
  isTall = false,
  isWide = false,
}: {
  item: BentoItem;
  isTall?: boolean;
  isWide?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="group relative block w-full h-full rounded-[20px] md:rounded-[24px] lg:rounded-[26px] overflow-hidden bg-bharati-charcoal shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5"
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
      />

      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

      {/* Badge (if any) */}
      {item.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block bg-bharati-mint/90 backdrop-blur-md text-white px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wider uppercase rounded-full shadow-sm">
            {item.badge}
          </span>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 lg:p-6 z-10 flex flex-col justify-end">
        <h3
          className={`font-serif text-white tracking-tight leading-tight mb-1 group-hover:text-bharati-mint-light transition-colors duration-300 ${
            isTall
              ? "text-xl md:text-2xl lg:text-[1.65rem]"
              : isWide
              ? "text-lg md:text-xl lg:text-2xl"
              : "text-base md:text-lg"
          }`}
        >
          {item.name}
        </h3>
        <p className="text-[0.72rem] md:text-xs text-white/75 font-normal line-clamp-1 mb-2.5">
          {item.tagline}
        </p>

        <div className="inline-flex items-center gap-1.5 text-[0.68rem] md:text-xs font-semibold uppercase tracking-wider text-white group-hover:text-bharati-mint-light transition-colors duration-300">
          <span>Explore</span>
          <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-bharati-mint-light group-hover:text-bharati-charcoal flex items-center justify-center transition-all duration-300">
            <ArrowRight size={10} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MasonryCollage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Circular queue: 2 sets duplicated so it loops seamlessly
  const loopedBlocks = useMemo(() => {
    return [BLOCK_SET_1, BLOCK_SET_2, BLOCK_SET_1, BLOCK_SET_2];
  }, []);

  // ── Auto-scroll (Circular Queue) ──────────────────────────────────────────
  const scroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    // Reset when reached the halfway mark (after Set 1 + Set 2)
    if (el.scrollLeft >= el.scrollWidth / 2) {
      el.scrollLeft = 0;
    } else {
      el.scrollLeft += SCROLL_STEP;
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

  // Pause on manual user interaction (touch, drag, wheel, click)
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    stopScroll();
  }, [stopScroll]);

  // Resume auto-scroll
  const resumeAutoScroll = useCallback(() => {
    setIsPaused(false);
    startScroll();
  }, [startScroll]);

  // Resume when mouse moves outside the section area
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

  // Start/stop based on isPaused state
  useEffect(() => {
    if (isPaused) {
      stopScroll();
    } else {
      startScroll();
    }
    return () => stopScroll();
  }, [isPaused, startScroll, stopScroll]);

  return (
    <section
      ref={sectionRef}
      onPointerDown={pauseAutoScroll}
      onMouseLeave={resumeAutoScroll}
      className="py-12 md:py-16 bg-bharati-cream overflow-hidden"
      aria-label="The Collection"
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8 px-2">
          <div>
            <span className="mb-2 block text-xs tracking-widest text-bharati-ash font-semibold uppercase">
              The Collection
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-bharati-charcoal tracking-tight">
              Cookware crafted for life
            </h2>
          </div>
          <div className="hidden md:block pb-1">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-bharati-ash hover:text-bharati-mint transition-colors duration-300"
            >
              View all Products
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Carousel Track: 4-Card Bento Blocks in a Circular Queue */}
        <div className="relative">
          {/* Subtle Left Fade */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-10 md:w-16 z-20"
            style={{
              background:
                "linear-gradient(to right, var(--color-bharati-cream), transparent)",
            }}
          />
          {/* Subtle Right Fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-10 md:w-16 z-20"
            style={{
              background:
                "linear-gradient(to left, var(--color-bharati-cream), transparent)",
            }}
          />

          {/* Scrollable Track */}
          <div
            ref={trackRef}
            onWheel={pauseAutoScroll}
            onTouchStart={pauseAutoScroll}
            className="flex overflow-x-auto no-scrollbar py-2"
            style={{
              gap: `${BLOCK_GAP}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              cursor: "grab",
            }}
          >
            {loopedBlocks.map((block, idx) => (
              <div
                key={`${block.id}-${idx}`}
                className="flex-shrink-0 w-[88vw] sm:w-[80vw] md:w-[760px] lg:w-[880px] xl:w-[980px] h-[390px] sm:h-[420px] md:h-[450px] lg:h-[470px] grid grid-cols-[63%_37%] gap-3 md:gap-4"
                aria-hidden={idx >= 2 ? "true" : undefined}
              >
                {/* Left Side: 2 Rows (Top: Box 1 & Box 2, Bottom: Wide Box 3) */}
                <div className="flex flex-col gap-3 md:gap-4 h-full">
                  {/* Top Row: Box 1 & Box 2 */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 h-[47%]">
                    <BentoCard item={block.box1} />
                    <BentoCard item={block.box2} />
                  </div>

                  {/* Bottom Row: Wide Box 3 */}
                  <div className="h-[53%]">
                    <BentoCard item={block.box3} isWide />
                  </div>
                </div>

                {/* Right Side: Tall Box 4 */}
                <div className="h-full">
                  <BentoCard item={block.box4} isTall />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
