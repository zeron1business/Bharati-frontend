"use client";

import Image from "next/image";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

const details = [
  {
    image: "/products/Cooker-front.jpg",
    label: "Front Profile",
    description: "Clean lines. Confident proportions.",
  },
  {
    image: "/products/Cooker-right.jpg",
    label: "Handle Detail",
    description: "Ergonomic grip. Heat-resistant construction.",
  },
  {
    image: "/products/cooker-left.jpg",
    label: "Side View",
    description: "Precision-machined aluminium body.",
  },
  {
    image: "/products/Cooker-slightRight.jpg",
    label: "Angled View",
    description: "Every angle, considered.",
  },
];

export function DetailsSection() {
  return (
    <section
      className="section-spacing bg-bharati-cream overflow-hidden"
      aria-label="The Details Matter"
    >
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="mb-12 md:mb-16">
          <SectionLabel color="black" className="mb-4 block">
            The Details Matter
          </SectionLabel>
          <h2 className="text-section-title text-bharati-mint-dark max-w-md">
            Crafted with
            <br />
            precision.
          </h2>
        </AnimatedSection>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {details.map((detail, i) => (
            <AnimatedSection key={detail.label} delay={i * 0.1}>
              <div className="group relative bg-bharati-ivory overflow-hidden aspect-[4/3]">
                <Image
                  src={detail.image}
                  alt={detail.label}
                  fill
                  className="object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bharati-ivory/95 to-transparent">
                  <span className="text-[0.7rem] tracking-[0.15em] uppercase font-medium text-bharati-ash">
                    {detail.label}
                  </span>
                  <p className="text-[0.85rem] text-bharati-charcoal font-light mt-1">
                    {detail.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
