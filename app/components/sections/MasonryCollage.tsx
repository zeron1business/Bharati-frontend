"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MasonryProduct {
  id: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
  gridClass: string;
  isHero?: boolean;
}

const masonryProducts: MasonryProduct[] = [
  {
    id: "pressure-cooker-hero",
    name: "Pressure Cooker",
    tagline: "Safe. Strong. Timeless.",
    image: "/masonry/RegularCooker_600_800.jpeg",
    href: "/products/pressure-cooker",
    gridClass: "masonry-tile--hero",
    isHero: true,
  },
  {
    id: "kadai",
    name: "Kadai",
    tagline: "For richer flavours.",
    image: "/masonry/Kadai_500_650.jpeg",
    href: "/products/kadhai",
    gridClass: "masonry-tile--kadai",
  },
  {
    id: "frypan",
    name: "Frypan",
    tagline: "Everyday cooking. Elevated.",
    image: "/masonry/FryPan_600_800.jpeg",
    href: "/products/frypan",
    gridClass: "masonry-tile--frypan",
  },
  {
    id: "pressure-cooker-small",
    name: "Pressure Cooker",
    tagline: "Safe. Strong. Timeless.",
    image: "/products/Cooker-front.jpg", // Using a different image for the smaller tile to avoid duplicate
    href: "/products/pressure-cooker",
    gridClass: "masonry-tile--cooker",
  },
  {
    id: "saucepan",
    name: "Saucepan",
    tagline: "Perfect for everyday meals.",
    image: "/masonry/SaucePan_550_550.jpeg",
    href: "/products/saucepan",
    gridClass: "masonry-tile--saucepan",
  },
  {
    id: "biryani-pot",
    name: "Biryani / Cooking Pot",
    tagline: "For special moments.",
    image: "/masonry/BellyCooker_500_650.jpeg",
    href: "/products/biryani-pot",
    gridClass: "masonry-tile--biryani",
  },
];

export function MasonryCollage() {
  return (
    <section
      className="masonry-collage-section bg-bharati-ivory pb-0" // Removing padding so it blends with the sections
      aria-label="The Collection"
    >
      <div className="masonry-grid-container w-full max-w-[1920px] mx-auto px-0 md:px-0">
        {masonryProducts.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className={`group relative overflow-hidden bg-bharati-charcoal ${product.gridClass} h-[280px] md:h-full w-full`}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            <div className={`masonry-tile-content ${product.isHero ? 'masonry-tile-hero-content' : ''}`}>
              {product.isHero && (
                <div className="mb-4">
                  <span className="inline-block bg-bharati-mint/20 text-white px-3 py-1 text-xs font-semibold tracking-wider rounded-sm border border-bharati-mint/30 backdrop-blur-sm">
                    BHARATI
                  </span>
                </div>
              )}
              <h3 className={`masonry-tile-title ${product.isHero ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                {product.name}
              </h3>
              <p className={`masonry-tile-tagline ${product.isHero ? 'text-base md:text-lg max-w-sm mb-6' : 'text-sm'}`}>
                {product.tagline}
              </p>
              
              <div className="masonry-tile-explore mt-auto self-start">
                {!product.isHero && (
                  <span className="text-xs uppercase tracking-wider pl-3 font-medium">Explore</span>
                )}
                {product.isHero && (
                  <span className="text-xs uppercase tracking-wider pl-3 font-medium">Explore The Cooker</span>
                )}
                <div className="masonry-tile-explore-icon">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
