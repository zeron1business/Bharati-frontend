import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { products as fallbackProducts } from "@/app/data/products";
import { getProducts } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "All Products — BHARATI",
  description:
    "Explore the complete BHARATI collection. Premium cookware and kitchen essentials designed around the way India cooks.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ProductsPage() {
  let displayProducts: Array<{
    id: string;
    slug: string;
    name: string;
    tagline: string;
    price: string;
    image: string;
    category: string;
  }> = [];

  try {
    const res = await getProducts({ size: 50 });
    if (res && res.content && res.content.length > 0) {
      displayProducts = res.content.map((p) => {
        const rawPrice = p.discountedPrice || p.basePrice;
        const formattedPrice = rawPrice
          ? `₹ ${Number(rawPrice).toLocaleString("en-IN")}`
          : "₹ 3,499";
        return {
          id: p.id,
          slug: p.slug,
          name: p.title,
          tagline: p.tagline || "Engineered for everyday Indian cooking",
          price: formattedPrice,
          image: p.primaryImageUrl || "/products/cooker_cutout.png",
          category: p.categoryName || "Cookware",
        };
      });
    }
  } catch (error) {
    console.warn("Could not fetch live products from API, falling back to local catalog:", error);
  }

  // Fallback to static catalog if API returned no items or backend is offline
  if (displayProducts.length === 0) {
    displayProducts = fallbackProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      price: p.price.startsWith("₹") && !p.price.includes("XXXX") ? p.price : "₹ 3,499",
      image: p.image,
      category: p.category,
    }));
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        {/* Header */}
        <div className="mb-16">
          <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
            All Products
          </span>
          <h1 className="text-headline text-bharati-black">The Collection</h1>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block"
            >
              <div className="relative aspect-square bg-bharati-ivory overflow-hidden mb-5 border border-transparent group-hover:border-bharati-mint/30 transition-all duration-500">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-[1.1rem] font-medium tracking-[-0.01em] text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300">
                  {product.name}
                </h2>
                <p className="text-[0.85rem] text-bharati-silver font-light">
                  {product.tagline}
                </p>
                <p className="text-[1.05rem] text-bharati-mint-dark font-semibold">
                  {product.price}
                </p>
                <span className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.15em] uppercase font-semibold text-bharati-mint-dark group-hover:text-bharati-mint transition-colors duration-300 mt-1">
                  Explore
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
