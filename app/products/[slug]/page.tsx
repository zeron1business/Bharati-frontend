import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, cookerFeatures } from "@/app/data/products";
import { getProductBySlug } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { AddToCartSection } from "../components/AddToCartSection";
import { ProductGallery } from "../components/ProductGallery";
import { ProductProvider } from "../components/ProductContext";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    images: string[];
    productOwnImages: string[];
    category: string;
    inStock: boolean;
    stockQuantity: number;
    variants: any[];
    warrantyDuration: string;
    features: { title: string; description: string }[];
  } | null = null;

  try {
    const live = await getProductBySlug(slug);
    if (live) {
      const allVariants = live.variants || [];
      const activeVariants = allVariants.filter((v: any) => v.isActive !== false);
      console.log(`[ProductPage] "${slug}" — ${allVariants.length} total variant(s) from API, ${activeVariants.length} active:`,
        JSON.stringify(allVariants.map((v: any) => ({ id: v.id, sku: v.sku, isActive: v.isActive, volumeLitres: v.volumeLitres })), null, 2));

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

      // Product-level photos (uploaded on the product itself), primary first
      const productOwnImages: string[] = Array.from(new Set(
        [...(live.media || [])]
          .filter((m: any) => m?.url && (!m.type || m.type === "IMAGE"))
          .sort((a: any, b: any) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((m: any) => m.url as string)
      ));

      let allImages = [...productOwnImages];
      if (live.variants && live.variants.length > 0) {
        live.variants.forEach((v: any) => {
          if (v.mediaUrls && v.mediaUrls.length > 0) {
            allImages.push(...v.mediaUrls);
          } else if (v.media && v.media.length > 0) {
            allImages.push(...v.media.map((m: any) => m.url));
          }
        });
      }
      allImages = Array.from(new Set(allImages));
      if (allImages.length === 0) {
        allImages = [primaryImg];
      }

        productData = {
        id: live.id,
        title: live.title || live.name || "Product",
        slug: live.slug,
        tagline: live.tagline || "Engineered for everyday Indian cooking",
        description: live.description || "Crafted with highest quality materials.",
        numericPrice: price,
        formattedPrice: `₹ ${price.toLocaleString("en-IN")}`,
        image: primaryImg,
        images: allImages,
        productOwnImages,
        category: "Bharati",
        inStock: isAvailable,
        stockQuantity: stock > 0 ? stock : 50,
        variants: (live.variants || []).filter((v: any) => v.isActive !== false),
        warrantyDuration: live.warrantyDuration || "5-Year Warranty",
        features: live.features || []
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
      images: [staticProd.image],
      productOwnImages: [staticProd.image],
      category: "Bharati",
      inStock: true,
      stockQuantity: 50,
      variants: [],
      warrantyDuration: "5-Year Warranty",
      features: []
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

        <ProductProvider initialImages={productData.images}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image Gallery */}
            <div className="w-full">
              <ProductGallery title={productData.title} />
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
                  productBaseImages={productData.images}
                  productOwnImages={productData.productOwnImages}
                />
              </div>

            {/* Features (Dynamic) */}
            {productData.features && productData.features.length > 0 && (
              <div className="mt-12 pt-10 border-t border-bharati-mist">
                <span className="text-[0.85rem] tracking-[0.15em] text-bharati-mint-dark mb-8 block font-medium uppercase">
                  Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                  {productData.features.map((feature, idx) => (
                    <div key={idx}>
                      <span className="text-xs tracking-[0.2em] text-bharati-mint-dark font-medium bg-bharati-mint/15 px-3 py-1 rounded-full border border-bharati-mint/25 inline-flex items-center justify-center mb-4">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-[1.1rem] font-medium text-bharati-charcoal mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[0.9rem] text-bharati-silver/90 font-light leading-relaxed pr-2">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </ProductProvider>
      </div>
    </div>
  );
}
