"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

interface Review {
  id: string;
  text: string;
  author: string;
  rating: number;
  isPlaceholder: boolean;
}

const placeholderReviews: Review[] = [
  {
    id: "r1",
    text: "Excellent quality and very easy to use. Cooks food faster and perfectly.",
    author: "Priya S.",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "r2",
    text: "Sturdy build and stylish design. A must-have for every kitchen!",
    author: "Rohit M.",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "r3",
    text: "Great product. Very happy with the performance and build quality.",
    author: "Ananya B.",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "r4",
    text: "The best pressure cooker we have owned. Superb quality and finish.",
    author: "Meera K.",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "r5",
    text: "Fast cooking, beautiful design and great value. Highly recommended.",
    author: "Arjun P.",
    rating: 5,
    isPlaceholder: true,
  },
];

export function CustomerReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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
    <section
      className="customer-reviews-section section-spacing bg-bharati-white"
      aria-label="Customer Reviews"
    >
      <div className="section-container max-w-[1920px] mx-auto">
        {/* Header */}
        <AnimatedSection className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <SectionLabel color="black" className="mb-3 block text-xs tracking-widest text-bharati-ash font-semibold uppercase">
              Customer Reviews
            </SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif text-bharati-charcoal tracking-tight">
              Loved by home cooks
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
             <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.1em] uppercase font-semibold text-bharati-ash hover:text-bharati-mint transition-colors duration-300 mr-4"
            >
              View All Reviews
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </AnimatedSection>

        {/* Review Cards Carousel */}
        <AnimatedSection delay={0.15}>
          <div
            ref={emblaRef}
            className="overflow-hidden cursor-grab active:cursor-grabbing pb-8"
          >
            <div className="flex gap-5">
              {placeholderReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-full sm:w-[320px] md:w-[380px]"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-bharati-mist/40 p-8 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          strokeWidth={0}
                          fill="#1b4d45"
                          className="text-bharati-mint-dark"
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-[0.95rem] font-medium text-bharati-charcoal leading-relaxed mb-6 flex-1">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    {/* Author */}
                    <p className="text-[0.8rem] font-bold text-bharati-charcoal">
                      {review.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows at bottom right */}
          <div className="flex justify-end gap-3 mt-4 pr-2">
             <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-bharati-mist text-bharati-charcoal hover:bg-bharati-mint-dark hover:border-bharati-mint-dark hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-bharati-mist disabled:hover:text-bharati-charcoal"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bharati-mint-dark text-white border border-bharati-mint-dark hover:bg-bharati-mint hover:border-bharati-mint transition-all duration-300 disabled:opacity-30"
              aria-label="Next reviews"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
