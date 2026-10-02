"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function RecipesBanner() {
  return (
    <section
      className="recipes-banner-section bg-bharati-cream overflow-hidden"
      aria-label="Recipes for real life"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
        {/* Text Side */}
        <div className="flex flex-col justify-center px-[var(--spacing-container)] py-16 md:py-20 lg:py-24 lg:pr-16 xl:pr-24 order-2 lg:order-1">
          <AnimatedSection>
            <SectionLabel color="black" className="mb-5 block text-xs tracking-widest text-bharati-ash font-semibold uppercase">
              Cook More, Do More
            </SectionLabel>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-serif italic text-bharati-charcoal mb-6 tracking-tight leading-tight">
              Recipes for
              <br />
              real life
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-body-large text-bharati-ash max-w-md mb-8 leading-relaxed">
              From everyday meals to festive feasts, explore simple and delicious
              recipes made with BHARATI cookware.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <Link
              href="/about"
              className="btn-primary w-fit group"
            >
              Explore Recipes
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>

        {/* Image Side */}
        <AnimatedSection
          direction="left"
          className="relative min-h-[350px] sm:min-h-[400px] lg:min-h-0 order-1 lg:order-2"
        >
          <Image
            src="/home/recepiesforlife.jpeg"
            alt="Delicious home-cooked meal with BHARATI cookware"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
