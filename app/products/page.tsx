import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { products as fallbackProducts } from "@/app/data/products";
import { getProducts } from "@/lib/api";
import { ArrowRight } from "lucide-react";

interface ProductsPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
  }>;
}

export async function generateMetadata(
  props: ProductsPageProps
): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const category = searchParams?.category;

  if (category === "pressure-cookers") {
    return {
      title: "Pressure Cookers — BHARATI",
      description:
        "Engineered for everyday Indian cooking. Explore our range of durable, precision-engineered pressure cookers.",
    };
  }
  if (category === "tri-ply-products") {
    return {
      title: "Tri-ply Products — BHARATI",
      description:
        "Premium tri-ply stainless steel cookware built for even heat distribution and effortless Indian cooking.",
    };
  }
  return {
    title: "All Products — BHARATI",
    description:
      "Explore the complete BHARATI collection. Premium cookware and kitchen essentials designed around the way India cooks.",
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const categoryFilter = searchParams?.category;
  const searchQuery = searchParams?.search;

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
    const res = await getProducts({
      size: 50,
      category: categoryFilter,
      search: searchQuery,
    });
    if (res && res.content && res.content.length > 0) {
      displayProducts = res.content.map((p) => {
        let formattedPrice = "₹ 3,499"; // Fallback
        
        if (p.minPrice != null && p.maxPrice != null && p.minPrice > 0) {
            if (p.minPrice === p.maxPrice) {
                formattedPrice = `₹ ${Number(p.minPrice).toLocaleString("en-IN")}`;
            } else {
                formattedPrice = `₹ ${Number(p.minPrice).toLocaleString("en-IN")}`;
            }
        } else if (p.discountedPrice || p.basePrice) {
            const rawPrice = p.discountedPrice || p.basePrice;
            formattedPrice = `₹ ${Number(rawPrice).toLocaleString("en-IN")}`;
        }
        
        return {
          id: p.id,
          slug: p.slug,
          name: p.title || p.name || "Product",
          tagline: p.tagline || "Engineered for everyday Indian cooking",
          price: formattedPrice,
          image: p.primaryImageUrl || "/products/cooker_cutout.png",
          category: p.subcategoryName || p.categoryName || "Cookware",
        };
      });
    }
  } catch (error) {
    console.warn("Could not fetch live products from API, falling back to local catalog:", error);
  }

  // Fallback to static catalog if API returned no items or backend is offline
  if (displayProducts.length === 0) {
    let fallback = fallbackProducts;
    if (categoryFilter) {
      fallback = fallbackProducts.filter(
        (p) =>
          p.category.toLowerCase() === categoryFilter.toLowerCase() ||
          p.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
      if (fallback.length === 0) fallback = fallbackProducts;
    }
    displayProducts = fallback.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      price: p.price.startsWith("₹") && !p.price.includes("XXXX") ? p.price : "₹ 3,499",
      image: p.image,
      category: p.category,
    }));
  }

  let headingText = "The Collection";
  let eyebrowText = "All Products";

  if (categoryFilter === "pressure-cookers") {
    headingText = "Pressure Cookers";
    eyebrowText = "Shop / Pressure Cookers";
  } else if (categoryFilter === "tri-ply-products") {
    headingText = "Tri-ply Products";
    eyebrowText = "Shop / Tri-ply Products";
  } else if (categoryFilter) {
    const formatted = categoryFilter
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    headingText = formatted;
    eyebrowText = `Shop / ${formatted}`;
  }

  const categoryTabs = [
    { label: "All Products", href: "/products", active: !categoryFilter },
    {
      label: "Pressure Cookers",
      href: "/products?category=pressure-cookers",
      active: categoryFilter === "pressure-cookers",
    },
    {
      label: "Tri-ply Products",
      href: "/products?category=tri-ply-products",
      active: categoryFilter === "tri-ply-products",
    },
  ];

  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
            {eyebrowText}
          </span>
          <h1 className="text-headline text-bharati-black">{headingText}</h1>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-10 pb-5 border-b border-bharati-mist/40">
          {categoryTabs.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide transition-all duration-300 ${
                cat.active
                  ? "bg-bharati-mint text-white shadow-sm"
                  : "bg-bharati-ivory text-bharati-charcoal/80 hover:bg-bharati-mist/60 hover:text-bharati-black"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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
                  unoptimized={Boolean(product.image?.startsWith("http"))}
                  className="object-contain p-5 md:p-10 transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
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
