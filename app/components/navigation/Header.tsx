"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  hasBanner?: boolean;
}

export function Header({ hasBanner = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { scrollY } = useScroll();
  const { itemCount, isHydrated } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const isHeroMode = isHomePage && !isScrolled;

  // Sync menu state with MobileNav via custom event
  useEffect(() => {
    const handleMenuClose = () => setMenuOpen(false);
    window.addEventListener("bharati-menu-close", handleMenuClose);
    return () =>
      window.removeEventListener("bharati-menu-close", handleMenuClose);
  }, []);

  const toggleMenu = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);
    window.dispatchEvent(
      new CustomEvent("bharati-menu-toggle", { detail: { open: newState } })
    );
  };

  return (
    <motion.header
      className={`fixed left-0 right-0 z-50 transition-all duration-400 ${
        isHeroMode
          ? "bg-transparent border-b border-transparent"
          : "bg-bharati-cream/85 backdrop-blur-xl border-b border-bharati-mist/60 shadow-xs"
      }`}
      style={{
        top: hasBanner ? 'var(--banner-height)' : '0'
      }}
    >
      <div className="flex items-center justify-between h-[var(--header-height)] px-6 md:px-10 max-w-[var(--container-max)] mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 flex items-center group py-1"
          aria-label="BHARATI Home"
        >
          <div className="relative h-9 w-9 transition-transform duration-300 group-hover:scale-105">
            <Image
              src={isHeroMode ? "/logo/BLOGO_white.png" : "/logo/BLOGO_clean.png"}
              alt="BHARATI"
              width={40}
              height={40}
              className="h-full w-auto object-contain transition-opacity duration-300"
              priority
            />
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/products"
            className={`p-3 sm:p-2.5 rounded-full transition-colors duration-300 ${
              isHeroMode
                ? "hover:bg-white/15 text-white"
                : "hover:bg-bharati-black/5 text-bharati-charcoal"
            }`}
            aria-label="Search Products"
          >
            <Search
              size={19}
              strokeWidth={1.5}
            />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/account"
              className={`p-3 sm:p-2.5 rounded-full transition-colors duration-300 flex ${
                isHeroMode
                  ? "hover:bg-white/15 text-white"
                  : "hover:bg-bharati-black/5 text-bharati-charcoal"
              }`}
              aria-label="Account"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>
          ) : (
            <button
              onClick={openAuthModal}
              className={`p-3 sm:p-2.5 rounded-full transition-colors duration-300 flex ${
                isHeroMode
                  ? "hover:bg-white/15 text-white"
                  : "hover:bg-bharati-black/5 text-bharati-charcoal"
              }`}
              aria-label="Sign In"
            >
              <User size={19} strokeWidth={1.5} />
            </button>
          )}

          <Link
            href="/cart"
            className={`relative p-3 sm:p-2.5 rounded-full transition-colors duration-300 ${
              isHeroMode
                ? "hover:bg-white/15 text-white"
                : "hover:bg-bharati-black/5 text-bharati-charcoal"
            }`}
            aria-label={`Cart (${isHydrated ? itemCount : 0} items)`}
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.5}
            />
            {isHydrated && itemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-bharati-mint text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleMenu}
            className={`p-3 sm:p-2.5 rounded-full transition-colors duration-300 ml-1 sm:ml-2 ${
              isHeroMode
                ? "hover:bg-white/15 text-white"
                : "hover:bg-bharati-black/5 text-bharati-charcoal"
            }`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Menu
              size={20}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
