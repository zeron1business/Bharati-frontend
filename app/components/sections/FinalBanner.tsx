"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";

export function FinalBanner() {
  return (
    <section
      className="final-banner-section bg-bharati-charcoal overflow-hidden"
      aria-label="Complete your Kitchen with BHARATI"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[450px] lg:min-h-[550px]">
        {/* Text Side */}
        <div className="flex flex-col justify-center px-[var(--spacing-container)] py-14 md:py-20 lg:py-24 lg:pr-16 xl:pr-24 order-2 lg:order-1">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-bharati-white mb-8 tracking-tight leading-tight">
              Complete your
              <br />
              Kitchen with
              <br />
              <span className="text-bharati-white">BHARATI</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <Link
              href="/products"
              className="btn-primary w-fit group"
            >
              Shop Full Range
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
          className="relative min-h-[300px] sm:min-h-[350px] lg:min-h-0 order-1 lg:order-2"
        >
          <Image
            src="/home/completeKitchen.jpeg"
            alt="BHARATI complete kitchen cookware collection"
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
