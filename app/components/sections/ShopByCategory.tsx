"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

// Static fallback categories matching the reference design
const staticCategories = [
  { id: "c1", name: "Pressure Cooker", slug: "pressure-cookers", image: "/products/Cooker-front.jpg" },
  { id: "c2", name: "Kadai", slug: "cookware", image: "/products/Cooker-slight-left.jpg" },
  { id: "c3", name: "Saucepan", slug: "cookware", image: "/products/Cooker-right.jpg" },
  { id: "c4", name: "Fry Pan", slug: "cookware", image: "/products/cooker-left.jpg" },
  { id: "c5", name: "Biryani / Cooking Pot", slug: "cookware", image: "/products/Cooker-slightRight.jpg" },
  { id: "c6", name: "Tawa", slug: "cookware", image: "/products/Cooker-top.jpg" },
  { id: "c7", name: "Thali", slug: "steel-utensils", image: "/products/Cooker-front.jpg" },
  { id: "c8", name: "Poti", slug: "steel-utensils", image: "/products/Cooker-slight-left.jpg" },
  { id: "c9", name: "Glass", slug: "steel-utensils", image: "/products/Cooker-right.jpg" },
  { id: "c10", name: "Racks & Essentials", slug: "kitchen-racks", image: "/products/cooker-left.jpg" },
];

export function ShopByCategory() {
  return (
    <section
      className="shop-by-category-section section-spacing bg-bharati-cream"
      aria-label="Shop by Category"
    >
      <div className="section-container max-w-[1920px] mx-auto">
        {/* Header */}
        <AnimatedSection className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <SectionLabel color="black" className="mb-2 block text-xs tracking-widest text-bharati-ash font-semibold uppercase">
              Shop by Category
            </SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif text-bharati-charcoal tracking-tight">
              Find your essentials
            </h2>
          </div>

          <div className="hidden md:block pb-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.1em] uppercase font-semibold text-bharati-ash hover:text-bharati-mint transition-colors duration-300"
            >
              View all Categories
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </AnimatedSection>

        {/* Categories Grid/Row */}
        <AnimatedSection delay={0.15}>
          <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-between lg:flex-nowrap gap-4 md:gap-2 no-scrollbar">
            {staticCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex-shrink-0 w-[80px] md:w-auto"
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Circular image container */}
                  <div className="relative w-[70px] h-[70px] lg:w-[80px] lg:h-[80px] rounded-full bg-bharati-ivory border border-bharati-mist/60 overflow-hidden mb-3 group-hover:border-bharati-mint/50 group-hover:shadow-md transition-all duration-300">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                      sizes="80px"
                    />
                  </div>

                  {/* Category name */}
                  <span className="text-[0.65rem] md:text-[0.7rem] font-medium text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300 leading-tight max-w-[70px] md:max-w-[80px]">
                    {cat.name}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Mobile "View all" link */}
        <div className="md:hidden mt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.1em] uppercase font-semibold text-bharati-ash"
          >
            View all Categories
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
