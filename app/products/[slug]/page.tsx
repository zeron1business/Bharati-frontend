import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, cookerFeatures } from "@/app/data/products";
import { getProductBySlug } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { AddToCartSection } from "../components/AddToCartSection";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const live = await getProductBySlug(slug);
    if (live) {
      return {
        title: `${live.title || live.name || "Product"} — BHARATI`,
        description: live.description || live.tagline,
      };
    }
  } catch {
    // fallback
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found — BHARATI" };
  return {
    title: `${product.name} — BHARATI`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let productData: {
    id: string;
    title: string;
    slug: string;
    tagline: string;
    description: string;
    numericPrice: number;
    formattedPrice: string;
    image: string;
    category: string;
    inStock: boolean;
    stockQuantity: number;
    variants: any[];
    warrantyDuration: string;
  } | null = null;

  try {
    const live = await getProductBySlug(slug);
    if (live) {
      // Derive price from first variant, or fallback to top-level legacy fields
      const firstVariant = live.variants && live.variants.length > 0 ? live.variants[0] : null;
      const price = firstVariant 
        ? Number(firstVariant.discountedPrice || firstVariant.basePrice || 3499)
        : Number(live.discountedPrice || live.basePrice || 3499);
      const primaryImg =
        live.media && live.media.length > 0
          ? live.media.find((m) => m.isPrimary)?.url || live.media[0].url
          : "/products/cooker_cutout.png";

      const stock = firstVariant 
        ? (firstVariant.stockQuantity ?? 50)
        : (typeof live.stockQuantity === "number" ? live.stockQuantity : 50);
      const isAvailable = stock > 0;

        productData = {
        id: live.id,
        title: live.title || live.name || "Product",
        slug: live.slug,
        tagline: live.tagline || "Engineered for everyday Indian cooking",
        description: live.description || "Crafted with highest quality materials.",
        numericPrice: price,
        formattedPrice: `₹ ${price.toLocaleString("en-IN")}`,
        image: primaryImg,
        category: live.subcategory?.name || live.category?.name || "Cookware",
        inStock: isAvailable,
        stockQuantity: stock > 0 ? stock : 50,
        variants: live.variants || [],
        warrantyDuration: live.warrantyDuration || "5-Year Warranty"
      };
    }
  } catch (error) {
    console.warn("Could not fetch live product detail, using fallback:", error);
  }

  // Fallback to static mock product if not found in live API
  if (!productData) {
    const staticProd = products.find((p) => p.slug === slug);
    if (!staticProd) {
      notFound();
      return; // unreachable but satisfies TS null analysis
    }
    const defaultPrice = 3499;
    productData = {
      id: staticProd.id,
      title: staticProd.name,
      slug: staticProd.slug,
      tagline: staticProd.tagline,
      description: staticProd.description,
      numericPrice: defaultPrice,
      formattedPrice: `₹ ${defaultPrice.toLocaleString("en-IN")}`,
      image: staticProd.image,
      category: staticProd.category.replace("-", " "),
      inStock: true,
      stockQuantity: 50,
      variants: [],
      warrantyDuration: "5-Year Warranty"
    };
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container pt-4 md:pt-6 pb-16 md:pb-24">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.12em] uppercase text-bharati-ash hover:text-bharati-black transition-colors duration-300 mb-4 md:mb-6"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          All Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <div className="relative aspect-square bg-bharati-ivory rounded-2xl overflow-hidden border border-bharati-mist/50">
            <Image
              src={productData.image}
              alt={productData.title}
              fill
              unoptimized={Boolean(productData.image?.startsWith("http"))}
              className="object-contain p-6 lg:p-12"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <span className="text-label text-bharati-mint-dark mb-4 block font-medium capitalize">
              {productData.category}
            </span>
            <h1 className="text-headline text-bharati-black mb-4">
              {productData.title}
            </h1>
            <p className="text-body-large text-bharati-ash mb-3">
              {productData.tagline}
            </p>
            <p className="text-[0.95rem] text-bharati-silver font-light leading-relaxed mb-8 max-w-md">
              {productData.description}
            </p>
            {/* Interactive Price, Variant Selection & Add to Cart */}
            <div className="mb-8">
              <AddToCartSection
                productId={productData.id}
                title={productData.title}
                slug={productData.slug}
                baseNumericPrice={productData.numericPrice}
                imageUrl={productData.image}
                variants={productData.variants}
                fallbackInStock={productData.inStock}
                fallbackStock={productData.stockQuantity}
                productWarranty={productData.warrantyDuration}
              />
            </div>


            {/* Features (show for pressure cooker) */}
            {(productData.slug.includes("cooker") || slug === "pressure-cooker") && (
              <div className="mt-10 pt-10 border-t border-bharati-mist">
                <span className="text-label text-bharati-mint-dark mb-6 block font-medium">
                  Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {cookerFeatures.map((feature) => (
                    <div key={feature.number}>
                      <span className="text-[0.7rem] tracking-[0.2em] text-bharati-mint-dark font-semibold bg-bharati-mint/15 px-3 py-0.5 rounded-full border border-bharati-mint/25 inline-block mb-1.5">
                        {feature.number}
                      </span>
                      <h3 className="text-[0.95rem] font-medium text-bharati-charcoal mt-1 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-[0.8rem] text-bharati-silver font-light leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
