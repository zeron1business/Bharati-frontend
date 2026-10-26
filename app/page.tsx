import { HeroSection } from "./components/hero/HeroSection";
import { ShopByCategory } from "./components/sections/ShopByCategory";
import { BrandStory } from "./components/sections/BrandStory";
import { MasonryCollage } from "./components/sections/MasonryCollage";
import { BenefitsStrip } from "./components/sections/BenefitsStrip";
import { RecipesBanner } from "./components/sections/RecipesBanner";
import { CustomerReviews } from "./components/sections/CustomerReviews";
import { FinalBanner } from "./components/sections/FinalBanner";

import { fetchHeroPromos, fetchProducts, fetchCollectionTiles } from "./lib/api";

export default async function HomePage() {
  const [heroPromos, products, collectionTiles] = await Promise.all([
    fetchHeroPromos(),
    fetchProducts(),
    fetchCollectionTiles(),
  ]);

  return (
    <>
      <HeroSection promos={heroPromos} />
      <ShopByCategory products={products} />
      <BrandStory />
      <MasonryCollage tiles={collectionTiles} />
      <BenefitsStrip />
      <RecipesBanner />
      <CustomerReviews />
      <FinalBanner />
    </>
  );
}
