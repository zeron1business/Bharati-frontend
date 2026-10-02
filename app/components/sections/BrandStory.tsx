"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function BrandStory() {
  return (
    <section
      className="brand-story-section bg-[#fdfaf5] overflow-hidden"
      aria-label="The Bharati Difference"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] min-h-[500px] lg:min-h-[600px]">
        {/* Text Side */}
        <div className="flex flex-col justify-center px-[var(--spacing-container)] py-16 md:py-20 lg:py-24 lg:pr-16 xl:pr-24 order-2 lg:order-1">
          <AnimatedSection>
            <SectionLabel color="black" className="mb-5 block text-xs tracking-widest text-bharati-ash font-semibold uppercase">
              The Bharati Difference
            </SectionLabel>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-bharati-charcoal mb-6 tracking-tight leading-tight">
              Built for
              <br />
              generations
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-body-large text-bharati-ash max-w-md mb-8 leading-relaxed">
              Timeless design. Uncompromising quality. Cookware that becomes
              a part of your family&apos;s story.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <Link
              href="/about"
              className="btn-primary w-fit group"
            >
              Our Story
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
            src="/home/builtForGeneration.jpeg"
            alt="BHARATI premium cookware — built for generations"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
