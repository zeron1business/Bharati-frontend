"use client";

import Image from "next/image";
import { AnimatedSection } from "@/app/components/ui/AnimatedSection";
import { SectionLabel } from "@/app/components/ui/SectionLabel";

const meals = [
  {
    name: "Rice",
    image: "/collage/CookerWithRice_1.png",
    alt: "Fragrant steaming rice in BHARATI Pressure Cooker",
    color: "bg-[#f8f6f2]",
  },
  {
    name: "Dal",
    image: "/collage/Casserole_with_veg_biryani_2.png",
    alt: "Slow-cooked delicacy in BHARATI Casserole",
    color: "bg-[#f5f0e8]",
  },
  {
    name: "Curries",
    image: "/collage/FryPan_with_Veggies_3.png",
    alt: "Crisp vegetables sautéed in BHARATI Fry Pan",
    color: "bg-[#f3efe6]",
  },
  {
    name: "Biryani",
    image: "/collage/Kadai_with_paneer_4.png",
    alt: "Rich paneer curry simmered in BHARATI Kadai",
    color: "bg-[#f0ece3]",
  },
  {
    name: "Chicken",
    image: "/collage/Handi_With_biryani_5.png",
    alt: "Aromatic chicken biryani in BHARATI Handi",
    color: "bg-[#f5f2ed]",
  },
  {
    name: "Vegetables",
    image: "/collage/Saucepan_with_tomato_soup_6.png",
    alt: "Fresh tomato soup and vegetables in BHARATI Saucepan",
    color: "bg-[#f2f0ea]",
  },
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
                className={`group relative ${meal.color} overflow-hidden rounded-sm transition-all duration-500 hover:shadow-lg ${
                  i === 0 || i === 3
                    ? "aspect-square md:aspect-[3/4]"
                    : i === 2 || i === 5
                    ? "aspect-square md:aspect-[3/4]"
                    : "aspect-square"
                }`}
              >
                {/* Food photography image */}
                <Image
                  src={meal.image}
                  alt={meal.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Subtle gradient overlay for clean typography contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                {/* Label */}
                <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 z-10">
                  <span className="text-white text-[0.95rem] md:text-[1.1rem] font-medium tracking-[-0.01em] drop-shadow-sm">
                    {meal.name}
                  </span>
                </div>

                {/* Subtle border */}
                <div className="absolute inset-0 border border-white/10 pointer-events-none" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
