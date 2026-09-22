"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { fetchProducts } from "@/app/lib/api";
import { ProductCard } from "@/app/lib/types";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function ShopProducts() {
  const [products, setProducts] = useState<ProductCard[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
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
    <section
      className="section-spacing bg-bharati-white"
      aria-label="Shop Products"
    >
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <SectionLabel color="black" className="mb-3 block">Shop Products</SectionLabel>
            <h2 className="text-section-title text-bharati-mint-dark">
              The collection
            </h2>
          </div>

          {/* Desktop arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-2.5 border border-bharati-mist hover:border-bharati-mint hover:bg-bharati-mint hover:text-white text-bharati-charcoal transition-all duration-300 disabled:opacity-30 disabled:hover:border-bharati-mist disabled:hover:bg-transparent disabled:hover:text-bharati-charcoal"
              aria-label="Previous product"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-2.5 border border-bharati-mist hover:border-bharati-mint hover:bg-bharati-mint hover:text-white text-bharati-charcoal transition-all duration-300 disabled:opacity-30 disabled:hover:border-bharati-mist disabled:hover:bg-transparent disabled:hover:text-bharati-charcoal"
              aria-label="Next product"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </AnimatedSection>
      </div>

      {/* Carousel */}
      <AnimatedSection delay={0.15}>
        <div
          ref={emblaRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing pl-[var(--spacing-container)]"
        >
          <div className="flex gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[300px] md:w-[360px] lg:w-[400px]"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-bharati-ivory overflow-hidden mb-5 border border-transparent group-hover:border-bharati-mint/30 transition-all duration-500">
                    <Image
                      src={product.primaryImageUrl || "/products/Cooker-front.jpg"}
                      alt={product.title}
                      fill
                      className="object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 300px, (max-width: 1024px) 360px, 400px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-[1.1rem] font-medium tracking-[-0.01em] text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300">
                      {product.title}
                    </h3>
                    <p className="text-[0.85rem] text-bharati-silver font-light leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* CTA */}
                    <span className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.15em] uppercase font-semibold text-bharati-mint-dark group-hover:text-bharati-mint transition-colors duration-300 mt-2">
                      Explore
                      <ArrowRight
                        size={14}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Pagination dots */}
      <div className="section-container">
        <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                selectedIndex === i
                  ? "bg-bharati-mint-dark w-6"
                  : "bg-bharati-mint/30 hover:bg-bharati-mint/60 w-1.5"
              }`}
              aria-label={`Go to product ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
