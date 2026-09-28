"use client";

import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

const meals = [
  { name: "Rice", emoji: "🍚", color: "bg-[#f8f6f2]" },
  { name: "Dal", emoji: "🫘", color: "bg-[#f5f0e8]" },
  { name: "Curries", emoji: "🍛", color: "bg-[#f3efe6]" },
  { name: "Biryani", emoji: "🍚", color: "bg-[#f0ece3]" },
  { name: "Chicken", emoji: "🍗", color: "bg-[#f5f2ed]" },
  { name: "Vegetables", emoji: "🥘", color: "bg-[#f2f0ea]" },
];

export function LifestyleSection() {
  return (
    <section
      className="section-spacing bg-bharati-white overflow-hidden"
      aria-label="From Morning to Dinner"
    >
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="text-center mb-14 md:mb-20">
          <SectionLabel color="black" className="mb-4 block">
            From Morning to Dinner
          </SectionLabel>
          <h2 className="text-section-title text-bharati-mint-dark max-w-lg mx-auto mb-5">
            One cooker.
            <br />
            Every meal.
          </h2>
          <p className="text-body-large text-bharati-ash max-w-md mx-auto">
            From the first chai of the morning to a slow-cooked Sunday biryani.
            BHARATI is built for everything in between.
          </p>
        </AnimatedSection>

        {/* Meal grid — editorial, magazine-style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {meals.map((meal, i) => (
            <AnimatedSection key={meal.name} delay={i * 0.08}>
              <div
                className={`group relative ${meal.color} overflow-hidden transition-all duration-500 hover:shadow-sm ${
                  i === 0 || i === 3
                    ? "aspect-square md:aspect-[3/4]"
                    : i === 2 || i === 5
                    ? "aspect-square md:aspect-[3/4]"
                    : "aspect-square"
                }`}
              >
                {/* Large emoji as visual placeholder — to be replaced with actual food photography */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-[4rem] md:text-[5rem] opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                    role="img"
                    aria-label={meal.name}
                  >
                    {meal.emoji}
                  </span>
                </div>

                {/* Label */}
                <div className="absolute bottom-5 left-5">
                  <span className="text-[0.95rem] font-medium text-bharati-charcoal tracking-[-0.01em]">
                    {meal.name}
                  </span>
                </div>

                {/* Subtle border */}
                <div className="absolute inset-0 border border-bharati-mist/50" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
