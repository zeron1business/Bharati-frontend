import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/navigation/Header";
import { MobileNav } from "./components/navigation/MobileNav";
import { Footer } from "./components/footer/Footer";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BHARATI — Pressure, Reimagined",
  description:
    "BHARATI is a modern premium cookware brand designed around the way India cooks. Discover pressure cookers, cookware, and kitchen essentials built to elevate your everyday cooking.",
  keywords: [
    "BHARATI",
    "cookware",
    "pressure cooker",
    "premium cookware",
    "Indian kitchen",
    "aluminium pressure cooker",
  ],
  openGraph: {
    title: "BHARATI — Pressure, Reimagined",
    description:
      "Modern premium cookware designed around the way India cooks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <Header />
          <MobileNav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
