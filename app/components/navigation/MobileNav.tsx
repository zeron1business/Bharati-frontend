"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/app/data/products";
import { fetchCategories } from "@/app/lib/api";
import { Category } from "@/app/lib/types";
import { useAuth } from "@/context/AuthContext";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOutQuart = [0.76, 0, 0.24, 1] as [number, number, number, number];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease, delay: 0.1 },
  },
};

const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: "0%",
    transition: { duration: 0.5, ease: easeOutExpo },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.4, ease: easeInOutQuart },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.05,
      duration: 0.5,
      ease,
    },
  }),
};

interface MobileNavProps {
  hasBanner?: boolean;
}

export function MobileNav({ hasBanner = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isLoggedIn, logout, openAuthModal } = useAuth();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(detail.open);
    };
    window.addEventListener("bharati-menu-toggle", handleToggle);
    return () =>
      window.removeEventListener("bharati-menu-toggle", handleToggle);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setProductsExpanded(false);
    window.dispatchEvent(new CustomEvent("bharati-menu-close"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-bharati-black/40"
            onClick={closeMenu}
            style={{ top: hasBanner ? 'var(--banner-height, 38px)' : 0 }}
          />

          {/* Panel */}
          <motion.nav
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 bottom-0 z-[70] w-full md:w-[520px] bg-bharati-cream overflow-y-auto"
            aria-label="Main navigation"
            style={{ top: hasBanner ? 'var(--banner-height, 38px)' : 0 }}
          >
            <div className="flex flex-col min-h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 md:px-10 h-[var(--header-height)] shrink-0">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center group py-1"
                >
                  <Image
                    src="/logo/BHARATILOGO_clean.png"
                    alt="BHARATI"
                    width={140}
                    height={30}
                    className="h-6 md:h-7 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
                    priority
                  />
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2.5 rounded-full hover:bg-bharati-black/5 transition-colors duration-300"
                  aria-label="Close menu"
                >
                  <X
                    size={22}
                    strokeWidth={1.5}
                    className="text-bharati-charcoal"
                  />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 px-6 md:px-10 pb-10">
                {/* Shop by Category */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="mb-10"
                >
                  <span className="text-label text-bharati-silver mb-5 block">
                    Shop by Category
                  </span>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        onClick={closeMenu}
                        className="shrink-0 group"
                      >
                        <div className="relative w-[120px] h-[140px] md:w-[130px] md:h-[150px] bg-bharati-ivory overflow-hidden rounded-sm">
                          <Image
                            src={cat.imageUrl || "/products/Cooker-front.jpg"}
                            alt={cat.name}
                            fill
                            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                            sizes="130px"
                          />
                        </div>
                        <span className="text-[0.7rem] tracking-[0.08em] uppercase font-medium text-bharati-charcoal mt-2.5 block">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Shop by Products */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="mb-8"
                >
                  <button
                    onClick={() => setProductsExpanded(!productsExpanded)}
                    className="flex items-center justify-between w-full group"
                  >
                    <span className="text-[1.5rem] md:text-[1.75rem] font-light tracking-[-0.02em] text-bharati-black">
                      Shop by Products
                    </span>
                    <motion.span
                      animate={{ rotate: productsExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        size={22}
                        strokeWidth={1.5}
                        className="text-bharati-ash"
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {productsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pl-1 flex flex-col gap-3">
                          {navLinks.products.map((product) => (
                            <Link
                              key={product.name}
                              href={product.href}
                              onClick={closeMenu}
                              className="text-[1rem] text-bharati-ash hover:text-bharati-black transition-colors duration-300 link-underline w-fit"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Divider */}
                <div className="w-full h-px bg-bharati-mist mb-8" />

                {/* Support Links */}
                <div className="flex flex-col gap-4 mb-10">
                  {navLinks.support.map((link, i) => (
                    <motion.div
                      key={link.name}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={4 + i}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="text-[1.15rem] font-light text-bharati-charcoal hover:text-bharati-black transition-colors duration-300 link-underline"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Login / Account */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={9}
                  className="mb-12"
                >
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-4">
                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className="text-[1.15rem] font-light text-bharati-charcoal hover:text-bharati-black transition-colors duration-300 link-underline w-fit"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        onClick={closeMenu}
                        className="text-[1.15rem] font-light text-bharati-charcoal hover:text-bharati-black transition-colors duration-300 link-underline w-fit"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); closeMenu(); }}
                        className="text-[1.15rem] font-light text-red-500 hover:text-red-700 transition-colors duration-300 link-underline w-fit text-left"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { openAuthModal(); closeMenu(); }}
                      className="btn-secondary inline-flex"
                    >
                      Login / Sign Up
                    </button>
                  )}
                </motion.div>
              </div>

              {/* Footer Social */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={10}
                className="px-6 md:px-10 py-6 border-t border-bharati-mist mt-auto"
              >
                <div className="flex items-center gap-5">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bharati-ash hover:text-bharati-charcoal transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bharati-ash hover:text-bharati-charcoal transition-colors duration-300"
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
                    className="text-bharati-ash hover:text-bharati-charcoal transition-colors duration-300"
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
              </motion.div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
