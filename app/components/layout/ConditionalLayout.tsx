"use client";

import { usePathname } from "next/navigation";
import { Header } from "../navigation/Header";
import { MobileNav } from "../navigation/MobileNav";
import { Footer } from "../footer/Footer";
import { PromoBanner } from "../banner/PromoBanner";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  promos?: any[];
}

export function ConditionalLayout({ children, promos = [] }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  const hasBanner = promos.length > 0;

  return (
    <>
      <PromoBanner promos={promos} />
      <Header hasBanner={hasBanner} />
      <MobileNav hasBanner={hasBanner} />
      <main className={hasBanner ? "pt-[var(--banner-height)]" : ""}>
        {children}
      </main>
      <Footer />
    </>
  );
}
