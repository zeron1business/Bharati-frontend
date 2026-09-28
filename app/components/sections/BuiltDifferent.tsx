"use client";

import Image from "next/image";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function BuiltDifferent() {
  return (
    <section
      className="section-spacing bg-bharati-cream overflow-hidden"
      aria-label="Built Different"
    >
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image — large, editorial */}
          <AnimatedSection direction="left" className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-bharati-ivory overflow-hidden">
              <Image
                src="/products/Cooker-slight-left.jpg"
                alt="BHARATI Pressure Cooker — built different"
                fill
                className="object-contain p-8 lg:p-12"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>

          {/* Copy */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <AnimatedSection>
              <SectionLabel color="black" className="mb-6 block">
                Built Different
              </SectionLabel>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="text-headline text-bharati-black mb-8">
                Designed
                <br />
                around the way
                <br />
                <span className="text-bharati-mint-dark">India cooks.</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-body-large text-bharati-ash max-w-md mb-8">
                Every curve, every handle, every mechanism — engineered for the
                demands of everyday Indian cooking. From the first whistle of the
                morning to the last meal of the day.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex gap-8 lg:gap-12">
                <div>
                  <span className="text-[2rem] md:text-[2.5rem] font-light text-bharati-mint-dark leading-none">
                    25+
                  </span>
                  <span className="text-label text-bharati-silver block mt-2">
                    Years of craft
                  </span>
                </div>
                <div>
                  <span className="text-[2rem] md:text-[2.5rem] font-light text-bharati-mint-dark leading-none">
                    10L+
                  </span>
                  <span className="text-label text-bharati-silver block mt-2">
                    Kitchens served
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
