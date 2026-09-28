"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCategories } from "@/app/lib/api";
import { Category } from "@/app/lib/types";
import { getSessionCache, setSessionCache, CACHE_KEYS } from "@/app/lib/cache";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function ShopCategory() {
  const [categories, setCategories] = useState<Category[]>(() => {
    return getSessionCache<Category[]>(CACHE_KEYS.STORE_CATEGORIES) || [];
  });

  useEffect(() => {
    fetchCategories().then((data) => {
      if (data && data.length > 0) {
        setCategories(data);
        setSessionCache(CACHE_KEYS.STORE_CATEGORIES, data);
      }
    });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
    },
    [AutoScroll({ playOnInit: true, speed: 0.8, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="section-spacing bg-bharati-cream" aria-label="Shop by Category">
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <SectionLabel color="black" className="mb-3 block">Shop by Category</SectionLabel>
            <h2 className="text-section-title text-bharati-mint-dark">
              Find your essentials
            </h2>
          </div>

          {/* Desktop arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-2.5 border border-bharati-mist hover:border-bharati-mint hover:bg-bharati-mint hover:text-white text-bharati-charcoal transition-all duration-300 disabled:opacity-30 disabled:hover:border-bharati-mist disabled:hover:bg-transparent disabled:hover:text-bharati-charcoal"
              aria-label="Previous category"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-2.5 border border-bharati-mist hover:border-bharati-mint hover:bg-bharati-mint hover:text-white text-bharati-charcoal transition-all duration-300 disabled:opacity-30 disabled:hover:border-bharati-mist disabled:hover:bg-transparent disabled:hover:text-bharati-charcoal"
              aria-label="Next category"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </AnimatedSection>
      </div>

      {/* Carousel */}
      <AnimatedSection delay={0.15}>
        <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing pl-[var(--spacing-container)]">
          <div className="flex gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex-shrink-0 w-[240px] md:w-[340px] lg:w-[380px]"
              >
                <Link href={`/products?category=${cat.slug}`} className="group block">
                  <div className="relative aspect-[4/5] md:aspect-[3/4] bg-bharati-ivory overflow-hidden mb-4 border border-transparent group-hover:border-bharati-mint/30 transition-all duration-500">
                    <Image
                      src={cat.imageUrl || "/products/Cooker-front.jpg"}
                      alt={cat.name}
                      fill
                      className="object-contain p-6 md:p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 240px, (max-width: 1024px) 340px, 380px"
                    />
                    {/* Subtle bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bharati-ivory/90 to-transparent" />

                    {/* Category label on card */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="text-label text-bharati-mint-dark mb-1 block text-[0.65rem] font-medium">
                        {cat.description}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-[1rem] font-medium tracking-[-0.01em] text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300">
                    {cat.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Pagination dots */}
      <div className="section-container">
        <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                selectedIndex === i
                  ? "bg-bharati-mint-dark w-6"
                  : "bg-bharati-mint/30 hover:bg-bharati-mint/60 w-1.5"
              }`}
              aria-label={`Go to category ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
