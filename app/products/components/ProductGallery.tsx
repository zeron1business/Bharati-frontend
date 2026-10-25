"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useProductImages } from "./ProductContext";

interface ProductGalleryProps {
  title: string;
}

import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ title }: ProductGalleryProps) {
  const { activeImages } = useProductImages();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Reset active index when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [activeImages]);

  let images = activeImages;

  // Fallback if no images
  if (!images || images.length === 0) {
    images = ["/products/Cooker-front.jpg"];
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4 max-w-[500px] mx-auto lg:mx-0">
      {/* Main Image */}
      <div className="relative aspect-square bg-bharati-ivory rounded-2xl overflow-hidden border border-bharati-mist/50 group shadow-xs">
        <Image
          src={images[activeIndex]}
          alt={`${title} - View ${activeIndex + 1}`}
          fill
          unoptimized={Boolean(images[activeIndex]?.startsWith("http"))}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 90vw, 500px"
          priority
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-bharati-charcoal rounded-full shadow-sm border border-bharati-mist/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-bharati-charcoal rounded-full shadow-sm border border-bharati-mist/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-16 lg:w-[70px] lg:h-[70px] rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-bharati-mint-dark ring-2 ring-bharati-mint-dark/20"
                  : "border-transparent hover:border-bharati-mist"
              } bg-bharati-ivory cursor-pointer`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                unoptimized={Boolean(img?.startsWith("http"))}
                className="object-cover"
                sizes="70px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
