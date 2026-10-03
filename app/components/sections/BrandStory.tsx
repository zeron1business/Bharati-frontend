"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";

export function BrandStory() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#faf8f5]"
      aria-label="The Bharati Difference"
    >
      {/* ── Mobile Layout (< md): Clean Stacked (Crisp Photo on Top, Content Below) ── */}
      <div className="md:hidden flex flex-col">
        {/* Crisp Cookware Photo with ZERO milky overlay */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-[#f0ece6]">
          <Image
            src="/home/builtForGeneration.jpeg"
            alt="BHARATI premium cookware — built for generations"
            fill
            priority
            unoptimized
            className="object-cover object-[center_right]"
            sizes="100vw"
          />
          {/* Subtle bottom fade to blend with cream text section */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#faf8f5] to-transparent pointer-events-none" />
        </div>

        {/* Clean Content Block Below Photo */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <AnimatedSection>
            <span className="block text-[0.7rem] font-semibold tracking-[0.2em] text-bharati-ash uppercase mb-2.5">
              The Bharati Difference
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#449188] tracking-tight leading-[1.15] mb-3">
              Built for generations
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-sm text-bharati-ash leading-relaxed mb-6 font-normal max-w-lg">
              Timeless design. Uncompromising quality. Cookware that becomes a
              part of your family&apos;s story.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <Link
              href="/about"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-[#6fa89b] hover:bg-[#5a8f83] text-white text-xs font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              Our Story
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>
      </div>

      {/* ── Desktop Layout (md+): Horizontal Panoramic with Mask Layer ── */}
      <div className="hidden md:flex relative items-center min-h-[440px] lg:min-h-[480px]">
        {/* Background Image Layer with seamless fade into cream */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Cookware Image pinned to the right with gradient alpha mask */}
          <div
            className="absolute inset-y-0 right-0 w-[75%] lg:w-[68%] xl:w-[64%]"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.65) 35%, black 58%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.65) 35%, black 58%, black 100%)",
            }}
          >
            <Image
              src="/home/builtForGeneration.jpeg"
              alt="BHARATI premium cookware — built for generations"
              fill
              priority
              unoptimized
              className="object-cover object-[center_right] lg:object-right"
              sizes="70vw"
            />
          </div>

          {/* Soft optical blur feather transition zone */}
          <div
            className="absolute inset-y-0 left-[22%] lg:left-[28%] xl:left-[32%] w-[24%] pointer-events-none"
            style={{
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)",
            }}
          />

          {/* Seamless cream gradient overlay matching canvas */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #faf8f5 0%, #faf8f5 24%, rgba(250, 248, 245, 0.94) 35%, rgba(250, 248, 245, 0.45) 48%, transparent 66%)",
            }}
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-10 md:px-14 lg:px-20 py-16 lg:py-20">
          <div className="max-w-md lg:max-w-lg">
            <AnimatedSection>
              <span className="block text-xs font-semibold tracking-[0.2em] text-bharati-ash uppercase mb-3 md:mb-4">
                The Bharati Difference
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-serif text-[#449188] tracking-tight leading-[1.1] mb-4 md:mb-5">
                Built for
                <br />
                generations
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-base text-bharati-ash leading-relaxed max-w-md mb-6 md:mb-8 font-normal">
                Timeless design. Uncompromising quality. Cookware that becomes a
                part of your family&apos;s story.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-[#6fa89b] hover:bg-[#5a8f83] text-white text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                Our Story
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
