import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — BHARATI",
  description:
    "Learn about BHARATI — a modern premium cookware brand designed around the way India cooks.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="max-w-2xl">
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
      </div>
    </div>
  );
}
