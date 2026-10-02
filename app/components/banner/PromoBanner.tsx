"use client";

import React, { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import Link from "next/link";

interface PromoBannerProps {
  promos: any[];
}

export function PromoBanner({ promos }: PromoBannerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !promos || promos.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[var(--banner-height)] bg-bharati-black z-[60] flex items-center overflow-hidden border-b border-white/10 pointer-events-none">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {/* We duplicate the items several times to ensure a smooth endless scroll */}
        {[...Array(15)].map((_, arrayIndex) => (
          <div key={`group-${arrayIndex}`} className="flex items-center shrink-0 px-4">
            {promos.map((promo, i) => (
              <div key={`${arrayIndex}-${promo.id}`} className="flex items-center gap-3 mx-8">
                <Tag size={14} className="text-bharati-gold" />
                <span className="text-white text-xs md:text-sm font-medium tracking-wide">
                  USE CODE <strong className="text-bharati-gold uppercase">{promo.code}</strong> FOR{" "}
                  {promo.discountType === "PERCENTAGE"
                    ? `${promo.discountValue}% OFF`
                    : `₹${promo.discountValue} OFF`}
                  {promo.minOrderValue && ` ON ORDERS OVER ₹${promo.minOrderValue}`}
                </span>
                {promo.description && (
                  <span className="text-white/60 text-xs hidden md:inline ml-2 border-l border-white/20 pl-2">
                    {promo.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
