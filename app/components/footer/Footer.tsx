import Link from "next/link";
import Image from "next/image";

import { navLinks } from "@/app/data/products";

export function Footer() {
  return (
    <footer className="bg-bharati-charcoal text-bharati-aluminium">
      <div className="section-container py-16 md:py-24">
        {/* Top — Logo + Tagline */}
        <div className="mb-16 md:mb-20">
          <Link href="/" className="inline-block group" aria-label="BHARATI Home">
            <Image
              src="/logo/LogoWithMoto_clean.png"
              alt="BHARATI — Elevate Your Cooking Game With Bharati"
              width={260}
              height={55}
              className="h-10 md:h-12 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
            />
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-16 md:mb-20">
          {/* Shop */}
          <div>
            <span className="text-label text-bharati-ash mb-5 block">Shop</span>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/products?category=pressure-cookers"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Pressure Cookers
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=tri-ply-products"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Tri-ply Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <span className="text-label text-bharati-ash mb-5 block">
              Products
            </span>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/products/bharati-regular-pressure-cooker"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Regular Cooker
                </Link>
              </li>
              <li>
                <Link
                  href="/products/triply-saucepan"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Saucepan
                </Link>
              </li>
              <li>
                <Link
                  href="/products/triply-kadhai"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Kadai
                </Link>
              </li>
              <li>
                <Link
                  href="/products/triply-casserole"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Casserole
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-[0.9rem] text-bharati-mint hover:text-bharati-mint-light font-medium transition-colors duration-300"
                >
                  See more...
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <span className="text-label text-bharati-ash mb-5 block">
              Support
            </span>
            <ul className="flex flex-col gap-3">
              {navLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <span className="text-label text-bharati-ash mb-5 block">Legal</span>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-[0.9rem] text-bharati-silver hover:text-bharati-white transition-colors duration-300"
                >
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom — Social + Copyright */}
        <div className="pt-8 border-t border-bharati-steel/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Social */}
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bharati-silver hover:text-bharati-white transition-colors duration-300"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bharati-silver hover:text-bharati-white transition-colors duration-300"
              aria-label="Facebook"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bharati-silver hover:text-bharati-white transition-colors duration-300"
              aria-label="YouTube"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <path d="m10 15 5-3-5-3z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[0.75rem] text-bharati-ash tracking-wide">
            © {new Date().getFullYear()} BHARATI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
