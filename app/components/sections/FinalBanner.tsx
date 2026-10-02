"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";

export function FinalBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#faf8f5] flex items-center min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[480px]"
      aria-label="Complete your Kitchen with BHARATI"
    >
      {/* Background Image Layer with seamless fade into cream */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Complete Kitchen Cookware Image spanning full width to show the left counter and ingredients */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.58) 18%, rgba(0,0,0,0.85) 40%, black 58%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.58) 18%, rgba(0,0,0,0.85) 40%, black 58%, black 100%)",
          }}
        >
          <Image
            src="/home/completeKitchen.jpeg"
            alt="BHARATI complete kitchen cookware collection"
            fill
            priority
            unoptimized
            className="object-cover object-[78%_center] lg:object-[75%_center]"
            sizes="100vw"
          />
        </div>

        {/* Minimal feather zone with reduced blur */}
        <div
          className="hidden md:block absolute inset-y-0 left-[24%] lg:left-[28%] w-[20%] pointer-events-none"
          style={{
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)",
          }}
        />

        {/* Soft cream gradient overlay letting the left side show clearly */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(250, 248, 245, 0.84) 0%, rgba(250, 248, 245, 0.74) 22%, rgba(250, 248, 245, 0.38) 42%, rgba(250, 248, 245, 0.10) 58%, transparent 70%)",
          }}
        />

        {/* Mobile top-to-bottom gentle gradient overlay for small screens */}
        <div
          className="md:hidden absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(250, 248, 245, 0.94) 45%, rgba(250, 248, 245, 0.70) 75%, rgba(250, 248, 245, 0.25) 100%)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-12 md:py-16 lg:py-20">
        <div className="max-w-md lg:max-w-lg">
          <AnimatedSection>
            <span className="block text-[0.7rem] md:text-xs font-semibold tracking-[0.2em] text-bharati-charcoal uppercase mb-3 md:mb-4">
              Complete your kitchen
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif text-[#449188] tracking-tight leading-[1.1] mb-6 md:mb-8">
              BHARATI
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-[#6fa89b] hover:bg-[#5a8f83] text-white text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              Shop Full Range
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

