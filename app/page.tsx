import { HeroSection } from "./components/hero/HeroSection";
import { ShopCategory } from "./components/carousel/ShopCategory";
import { ShopProducts } from "./components/carousel/ShopProducts";
import { BuiltDifferent } from "./components/sections/BuiltDifferent";
import { ProductDetail } from "./components/sections/ProductDetail";
import { DetailsSection } from "./components/sections/DetailsSection";
import { LifestyleSection } from "./components/sections/LifestyleSection";
import { BrandCTA } from "./components/sections/BrandCTA";

import { fetchHeroPromos } from "./lib/api";

export default async function HomePage() {
  const heroPromos = await fetchHeroPromos();

  return (
    <>
      <HeroSection promos={heroPromos} />
      <ShopCategory />
      <ShopProducts />
      <BuiltDifferent />
      <ProductDetail />
      <DetailsSection />
      <LifestyleSection />
      <BrandCTA />
    </>
  );
}
