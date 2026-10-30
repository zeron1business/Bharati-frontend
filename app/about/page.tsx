import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — BHARATI",
  description:
    "Learn about BHARATI — a modern premium cookware brand designed around the way India cooks.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story Content */}
          <div className="max-w-xl">
            {/* Mobile Logo Panel */}
            <div className="lg:hidden flex items-center justify-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-2xl p-8 mb-8 border border-bharati-mist/60 shadow-xs">
              <Image
                src="/logo/bharati_wordmark_high_quality.png"
                alt="BHARATI Logo"
                width={260}
                height={70}
                className="w-[200px] h-auto object-contain opacity-90"
                priority
              />
            </div>

            <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
              Our Story
            </span>
            <h1 className="text-headline text-bharati-black mb-8">About BHARATI</h1>
            <p className="text-body-large text-bharati-ash mb-6">
              BHARATI is a modern Indian cookware brand that believes everyday
              cooking deserves extraordinary tools. We combine decades of
              manufacturing expertise with contemporary design to create products
              that perform beautifully and belong in every Indian kitchen.
            </p>
            <p className="text-body-large text-bharati-ash mb-12">
              From our flagship pressure cooker to our complete range of kitchen
              essentials, every product is designed around the way India
              cooks — with care, with tradition, and with pride.
            </p>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>

          {/* Right Column: Visual Brand Panel (Desktop) */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-3xl p-16 min-h-[500px] border border-bharati-mist/60 shadow-xs">
            <Image
              src="/logo/bharati_wordmark_high_quality.png"
              alt="BHARATI"
              width={400}
              height={108}
              className="w-full max-w-[340px] h-auto object-contain opacity-90 transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
