"use client";

import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import {
  ShieldCheck,
  Award,
  Flame,
  Sparkles,
  Flag,
} from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "ISI Certified",
    description: "For your safety.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Long-lasting performance.",
  },
  {
    icon: Flame,
    title: "Works on All Stoves",
    description: "Gas, induction & more.",
  },
  {
    icon: Sparkles,
    title: "Easy to Clean",
    description: "Hygienic & convenient.",
  },
  {
    icon: Flag,
    title: "Made in India",
    description: "Proudly Indian.",
  },
];

export function BenefitsStrip() {
  return (
    <section
      className="benefits-strip-section bg-bharati-ivory border-y border-bharati-mist/60"
      aria-label="Product Benefits"
    >
      <div className="section-container py-10 md:py-14">
        <AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className={`flex flex-col items-center text-center px-4 ${
                    i !== benefits.length - 1 ? "border-r border-bharati-mist/60" : ""
                  }`}
                >
                  <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-bharati-mint/30 bg-bharati-mint/8 mb-3">
                    <Icon
                      size={20}
                      strokeWidth={1.3}
                      className="text-bharati-mint-dark"
                    />
                  </div>
                  <h3 className="text-[0.8rem] md:text-[0.85rem] font-semibold text-bharati-charcoal tracking-[-0.01em] mb-0.5">
                    {benefit.title}
                  </h3>
                  <p className="text-[0.7rem] md:text-[0.75rem] text-bharati-silver font-light">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
