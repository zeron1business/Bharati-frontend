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
    description: "For absolute kitchen safety",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Built for lifetime performance",
  },
  {
    icon: Flame,
    title: "Works on All Stoves",
    description: "Gas, induction & ceramic",
  },
  {
    icon: Sparkles,
    title: "Easy to Clean",
    description: "Hygienic mirror-finish steel",
  },
  {
    icon: Flag,
    title: "Made in India",
    description: "Proudly engineered at home",
  },
];

export function BenefitsStrip() {
  return (
    <section
      className="benefits-strip-section bg-bharati-cream relative z-10"
      aria-label="Product Benefits"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-12 py-10 md:py-14">
        <AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 md:gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Luxury Floating Icon Pill */}
                  <div className="w-12 h-12 md:w-13 md:h-13 rounded-2xl bg-white shadow-sm border border-bharati-mist/60 flex items-center justify-center mb-3.5 text-[#6fa89b] group-hover:scale-105 group-hover:shadow-md group-hover:border-[#6fa89b]/50 group-hover:bg-[#6fa89b] group-hover:text-white transition-all duration-300">
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="transition-colors duration-300"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-[0.82rem] md:text-[0.88rem] font-semibold text-bharati-charcoal tracking-normal mb-1 group-hover:text-[#5a8f83] transition-colors duration-300">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[0.68rem] sm:text-xs text-bharati-ash font-normal leading-relaxed max-w-[140px] sm:max-w-[160px]">
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
