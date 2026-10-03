"use client";

import { usePathname } from "next/navigation";
import { Header } from "../navigation/Header";
import { MobileNav } from "../navigation/MobileNav";
import { Footer } from "../footer/Footer";
import { PromoBanner } from "../banner/PromoBanner";

import { useEffect, useState } from "react";
import { fetchTopBannerPromos } from "@/app/lib/api";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  promos?: any[];
}

export function ConditionalLayout({ children, promos: initialPromos = [] }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [promos, setPromos] = useState<any[]>(() => {
    return initialPromos && initialPromos.length > 0 ? initialPromos : [{ id: "p1" }, { id: "p2" }];
  });

  useEffect(() => {
    if (initialPromos && initialPromos.length > 0) {
      setPromos(initialPromos);
    }
  }, [initialPromos]);

  useEffect(() => {
    fetchTopBannerPromos()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
        }
      })
      .catch(() => {});
  }, []);

  if (isAdmin) {
    return <main>{children}</main>;
  }

  const hasBanner = promos.length > 0;

  return (
    <>
      <PromoBanner promos={promos} />
      <Header hasBanner={hasBanner} />
      <MobileNav hasBanner={hasBanner} />
      <main
        className={hasBanner ? "pt-[var(--banner-height)]" : ""}
        style={hasBanner ? { paddingTop: "var(--banner-height, 38px)" } : undefined}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
