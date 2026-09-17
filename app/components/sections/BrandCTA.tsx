"use client";

import Link from "next/link";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";

export function BrandCTA() {
  return (
    <section
      className="relative bg-gradient-to-b from-[#0c1916] via-bharati-black to-bharati-black text-bharati-white overflow-hidden border-t border-bharati-mint/15"
      aria-label="Brand Statement"
    >
      {/* Subtle grain */}
      <div className="absolute inset-0 grain" />

      {/* Atmospheric teal radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-bharati-mint/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative section-container py-24 md:py-36 text-center">
        <AnimatedSection>
          <h2 className="text-headline text-bharati-white mb-6">
            Everyday cooking.
            <br />
            <span className="text-bharati-mint-light">Elevated.</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <p className="text-body-large text-bharati-silver max-w-md mx-auto mb-10">
            Designed to perform. Made to belong. Discover the BHARATI
            collection and experience the difference in every meal.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-10 py-4 text-[0.7rem] tracking-[0.2em] uppercase font-semibold bg-bharati-mint text-white border border-bharati-mint hover:bg-bharati-mint-dark hover:border-bharati-mint-dark shadow-xl shadow-bharati-mint/30 transition-all duration-400 group"
          >
            Shop the Collection
            <svg
              className="w-4 h-4 transition-transform duration-400 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
