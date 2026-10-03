"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Link from "next/link";
import { Tag } from "lucide-react";

interface HeroSectionProps {
  promos?: any[];
}

export function HeroSection({ promos = [] }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[550px] max-h-[1200px] overflow-hidden bg-bharati-dark"
      style={{ height: "100dvh" }}
      aria-label="Hero"
    >
      {/* Background — Video Layer */}
      <div className="absolute inset-0">
        {/* Hero Video with separate optimized mobile portrait & desktop cinematic streams */}
        <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
          {/* Mobile Video (9:16 Portrait — Smart Per-Scene Focal Framing on Bharati Cooker) */}
          <video
            src="/hero/Hero_video_mobile.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="md:hidden block w-full h-full object-cover object-center"
          />

          {/* Desktop Video (16:9 Landscape Cinematic) */}
          <video
            src="/hero/Hero_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="hidden md:block w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 vignette" />

        {/* Grain */}
        <div className="absolute inset-0 grain overflow-hidden" />

        {/* Bottom gradient for text readability - tuned so cooker & whistle stay vibrant */}
        <div className="absolute inset-x-0 bottom-0 h-[48%] md:h-[55%] bg-gradient-to-t from-bharati-black/90 via-bharati-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-end pb-8 sm:pb-12 md:pb-20 px-5 sm:px-6 text-center"
        style={{
          opacity: contentOpacity,
          y: contentY,
          scale: contentScale,
        }}
      >
        {/* Headline */}
        <motion.h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-display text-bharati-white mb-3 sm:mb-4 md:mb-5 tracking-tight leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block">PRESSURE</span>
          <span className="block">REIMAGINED</span>
        </motion.h1>

        {/* Subline */}
        <motion.p
          className="text-xs sm:text-sm md:text-body-large text-bharati-aluminium max-w-xs sm:max-w-md mb-6 sm:mb-8 md:mb-10 font-normal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Built for everyday Indian cooking.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <Link
            href="/products/pressure-cooker"
            className="inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 text-[0.68rem] sm:text-[0.7rem] tracking-[0.2em] uppercase font-semibold bg-bharati-mint text-white hover:bg-bharati-mint-dark shadow-lg shadow-bharati-mint/25 transition-all duration-400 group rounded-none"
          >
            Explore the Cooker
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-400 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - hidden on small mobile to avoid crowding the CTA */}
      <motion.div
        className="hidden sm:block absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-[2px] h-6 md:h-8 bg-gradient-to-b from-bharati-mint to-transparent mx-auto rounded-full"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
