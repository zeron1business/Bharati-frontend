"use client";

import { usePathname } from "next/navigation";
import { Header } from "../navigation/Header";
import { MobileNav } from "../navigation/MobileNav";
import { Footer } from "../footer/Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <MobileNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
