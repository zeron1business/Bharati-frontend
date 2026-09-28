"use client";

import Image from "next/image";
import { cookerFeatures } from "@/app/data/products";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

export function ProductDetail() {
  return (
    <section
      className="section-spacing bg-bharati-white overflow-hidden"
      aria-label="Product Engineering"
    >
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="text-center mb-10 md:mb-24">
          <SectionLabel color="black" className="mb-4 block">
            Engineered for Everyday
          </SectionLabel>
          <h2 className="text-section-title text-bharati-mint-dark max-w-lg mx-auto">
            Every detail,
            <br />
            intentional.
          </h2>
        </AnimatedSection>

        {/* Product + Features layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* Left features */}
          <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-10 order-2 lg:order-1">
            {cookerFeatures.slice(0, 2).map((feature, i) => (
              <AnimatedSection
                key={feature.number}
                direction="right"
                delay={i * 0.15}
              >
                <div className="lg:text-right">
                  <span className="text-[0.7rem] tracking-[0.2em] uppercase text-bharati-mint-dark font-semibold bg-bharati-mint/15 px-3 py-1 rounded-full border border-bharati-mint/25 inline-block mb-2">
                    {feature.number}
                  </span>
                  <h3 className="text-[1.1rem] font-medium text-bharati-charcoal mt-1.5 mb-2 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-[0.85rem] text-bharati-silver font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Center product image */}
          <AnimatedSection
            direction="none"
            className="lg:col-span-6 order-1 lg:order-2"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-bharati-mint/15 to-transparent blur-3xl pointer-events-none" />
              <Image
                src="/products/Cooker-top.jpg"
                alt="BHARATI Pressure Cooker — engineering details"
                fill
                className="object-contain relative z-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>

          {/* Right features */}
          <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-10 order-3">
            {cookerFeatures.slice(2, 4).map((feature, i) => (
              <AnimatedSection
                key={feature.number}
                direction="left"
                delay={i * 0.15}
              >
                <div>
                  <span className="text-[0.7rem] tracking-[0.2em] uppercase text-bharati-mint-dark font-semibold bg-bharati-mint/15 px-3 py-1 rounded-full border border-bharati-mint/25 inline-block mb-2">
                    {feature.number}
                  </span>
                  <h3 className="text-[1.1rem] font-medium text-bharati-charcoal mt-1.5 mb-2 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-[0.85rem] text-bharati-silver font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
