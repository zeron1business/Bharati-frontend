import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { searchCatalog } from "@/lib/api";
import { ArrowRight, Search as SearchIcon, Sparkles } from "lucide-react";
import { SearchResult, ProductCard } from "@/types/ecommerce";

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata(
  props: SearchPageProps
): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const q = searchParams?.q || "";
  return {
    title: q ? `Search for "${q}" — BHARATI` : "Search Products — BHARATI",
    description: `Search results for cookware, pressure cookers, and kitchen essentials at BHARATI.`,
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatProductPrice(p: ProductCard): string {
  if (p.minPrice != null && p.maxPrice != null && p.minPrice > 0) {
    if (p.minPrice === p.maxPrice) {
      return `₹ ${Number(p.minPrice).toLocaleString("en-IN")}`;
    }
    return `₹ ${Number(p.minPrice).toLocaleString("en-IN")} – ₹ ${Number(p.maxPrice).toLocaleString("en-IN")}`;
  }
  const rawPrice = p.discountedPrice || p.basePrice || 0;
  return `₹ ${Number(rawPrice).toLocaleString("en-IN")}`;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const query = (searchParams?.q || "").trim();

  let searchData: SearchResult | null = null;
  let hasError = false;

  if (query) {
    try {
      searchData = await searchCatalog(query);
    } catch (err) {
      console.warn("Search catalog fetch error:", err);
      hasError = true;
    }
  }

  const categoryMatch = searchData?.categoryMatch;
  const categoryProducts = categoryMatch?.categoryProducts || [];
  const otherProducts = searchData?.otherProducts || [];
  const fallbackProducts = !categoryMatch ? (searchData?.products || []) : [];
  const totalResults = searchData?.totalProductResults || (categoryProducts.length + otherProducts.length + fallbackProducts.length);

  return (
    <div className="min-h-screen pt-[var(--header-height)] pb-20 bg-bharati-cream/40">
      <div className="section-container section-spacing">
        {/* Breadcrumb / Eyebrow */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-label text-bharati-mint-dark block font-semibold mb-2">
              Catalog Search
            </span>
            <h1 className="text-headline text-bharati-black">
              {query ? (
                <>
                  Results for <span className="text-bharati-mint">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                "Search Cookware"
              )}
            </h1>
          </div>

          {query && totalResults > 0 && (
            <span className="px-3.5 py-1.5 rounded-full bg-bharati-ivory border border-bharati-mist/60 text-xs font-semibold text-bharati-charcoal/80">
              {totalResults} {totalResults === 1 ? "Product Found" : "Products Found"}
            </span>
          )}
        </div>

        {/* Inline Search Bar on Results Page */}
        <form
          action="/search"
          method="GET"
          className="relative max-w-xl mb-10"
        >
          <div className="relative flex items-center">
            <SearchIcon
              size={18}
              className="absolute left-4 text-bharati-mint pointer-events-none"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search cookers, kadhai, tri-ply products..."
              className="w-full pl-11 pr-24 py-3 rounded-full bg-white border border-bharati-mist/60 text-sm font-medium text-bharati-black placeholder:text-bharati-silver/70 focus:outline-hidden focus:border-bharati-mint focus:ring-2 focus:ring-bharati-mint/20 shadow-2xs transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-bharati-mint hover:bg-bharati-mint-dark text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* 1. CATEGORY SPOTLIGHT SECTION (When query matches a category like "cooker" -> Pressure Cooker) */}
        {categoryMatch && (
          <section className="mb-14">
            {/* Bigger Category Showcase Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-bharati-charcoal text-white border border-bharati-mist/30 shadow-xl mb-10">
              <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                {/* Text Content */}
                <div className="p-8 md:p-12 md:col-span-7 z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bharati-mint/20 border border-bharati-mint/40 text-[11px] uppercase tracking-wider font-bold text-bharati-mint">
                    <Sparkles size={12} />
                    Primary Category Match
                  </div>

                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
                    {categoryMatch.categoryName}
                  </h2>

                  {categoryMatch.description && (
                    <p className="text-sm md:text-base text-bharati-ivory/80 font-light leading-relaxed max-w-xl">
                      {categoryMatch.description}
                    </p>
                  )}

                  <div className="pt-2">
                    <Link
                      href={`/products?category=${categoryMatch.categorySlug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bharati-mint hover:bg-bharati-mint-dark text-white text-xs md:text-sm font-semibold transition-all hover:gap-3 shadow-md"
                    >
                      Browse Entire {categoryMatch.categoryName} Collection
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>

                {/* Big Category Image */}
                <div className="relative h-64 md:h-80 md:col-span-5 w-full bg-bharati-black/30">
                  <Image
                    src={categoryMatch.imageUrl || categoryMatch.categoryImageUrl || "/products/Cooker-front.jpg"}
                    alt={categoryMatch.categoryName}
                    fill
                    priority
                    unoptimized={Boolean(
                      categoryMatch.imageUrl?.startsWith("http") ||
                      categoryMatch.categoryImageUrl?.startsWith("http")
                    )}
                    className="object-cover md:object-contain p-4 md:p-6"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bharati-charcoal via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Subcategories Row with single representative images */}
            {categoryMatch.subcategories && categoryMatch.subcategories.length > 0 && (
              <div className="mb-12">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-bharati-black">
                      Subcategories in {categoryMatch.categoryName}
                    </h3>
                    <p className="text-xs text-bharati-charcoal/60 mt-0.5">
                      Explore specific variants and shapes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryMatch.subcategories.map((sub) => (
                    <div
                      key={sub.slug}
                      className="group p-4 rounded-2xl bg-white border border-bharati-mist/50 hover:border-bharati-mint/50 transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-4"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-bharati-ivory shrink-0 border border-bharati-mist/30">
                        {sub.imageUrl ? (
                          <Image
                            src={sub.imageUrl}
                            alt={sub.name}
                            fill
                            unoptimized={sub.imageUrl.startsWith("http")}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-bharati-mint/10" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-bharati-mint-dark block">
                          {categoryMatch.categoryName}
                        </span>
                        <h4 className="text-base font-bold text-bharati-black group-hover:text-bharati-mint-dark transition-colors truncate">
                          {sub.name}
                        </h4>
                        <span className="text-xs text-bharati-charcoal/60 block mt-0.5">
                          {sub.productCount} {sub.productCount === 1 ? "Product" : "Products"}
                        </span>
                        <Link
                          href={`/search?q=${encodeURIComponent(sub.name)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-bharati-mint-dark hover:text-bharati-mint transition-colors mt-2"
                        >
                          View products <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Products Grid */}
            {categoryProducts.length > 0 && (
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-bharati-mist/40 pb-3">
                  <h3 className="text-xl font-bold text-bharati-black">
                    {categoryMatch.categoryName} Products ({categoryProducts.length})
                  </h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {categoryProducts.map((product) => (
                    <ProductGridCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 2. OTHER MATCHING PRODUCTS SECTION */}
        {otherProducts.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 border-b border-bharati-mist/40 pb-3">
              <h3 className="text-xl font-bold text-bharati-black">
                Other Matching Products ({otherProducts.length})
              </h3>
              <p className="text-xs text-bharati-charcoal/60 mt-0.5">
                Additional items relevant to your search
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {otherProducts.map((product) => (
                <ProductGridCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 3. NON-CATEGORY MATCH FALLBACK GRID */}
        {!categoryMatch && fallbackProducts.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 border-b border-bharati-mist/40 pb-3">
              <h3 className="text-xl font-bold text-bharati-black">
                Products ({fallbackProducts.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {fallbackProducts.map((product) => (
                <ProductGridCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 4. EMPTY / NO RESULTS STATE */}
        {query && totalResults === 0 && (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-bharati-mist/40 shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-bharati-ivory border border-bharati-mist/60 flex items-center justify-center mx-auto mb-4 text-bharati-mint">
              <SearchIcon size={26} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-bharati-black mb-2">
              No results found for &ldquo;{query}&rdquo;
            </h2>
            <p className="text-sm text-bharati-charcoal/70 max-w-md mx-auto mb-6">
              We couldn&apos;t find any cookware or categories matching your query. Check your spelling or try another term.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Cooker", "Tri-ply", "Kadhai", "Handi", "Belly Bottom", "Saucepan"].map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-bharati-ivory hover:bg-bharati-mint/10 text-bharati-charcoal hover:text-bharati-mint border border-bharati-mist/50 transition-colors"
                >
                  {suggestion}
                </Link>
              ))}
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-bharati-mint hover:bg-bharati-mint-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Browse All Products <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* 5. INITIAL STATE (No query provided) */}
        {!query && (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-bharati-mist/40 shadow-xs max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-bharati-black mb-3">
              Explore the BHARATI Collection
            </h2>
            <p className="text-sm text-bharati-charcoal/70 mb-6">
              Search by product name, category (e.g. &ldquo;cooker&rdquo;, &ldquo;tri-ply&rdquo;), or shape.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Pressure Cookers", "Tri-ply", "Kadhai", "Handi", "Belly", "Saucepan"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-bharati-ivory hover:bg-bharati-mint/10 text-bharati-charcoal hover:text-bharati-mint border border-bharati-mist/50 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGridCard({ product }: { product: ProductCard }) {
  const imageUrl = product.primaryImageUrl || "/products/Cooker-front.jpg";
  const formattedPrice = formatProductPrice(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-square bg-bharati-ivory overflow-hidden mb-5 rounded-2xl border border-bharati-mist/50 group-hover:border-bharati-mint/40 transition-all duration-500 shadow-xs">
        <Image
          src={imageUrl}
          alt={product.name || product.title || "Product"}
          fill
          unoptimized={imageUrl.startsWith("http")}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[1.05rem] font-medium tracking-[-0.01em] text-bharati-charcoal group-hover:text-bharati-mint-dark transition-colors duration-300">
          {product.name || product.title}
        </h3>
        {product.tagline && (
          <p className="text-[0.85rem] text-bharati-silver font-light line-clamp-1">
            {product.tagline}
          </p>
        )}
        <p className="text-[1.05rem] text-bharati-mint-dark font-semibold">
          {formattedPrice}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] tracking-[0.15em] uppercase font-semibold text-bharati-mint-dark group-hover:text-bharati-mint transition-colors duration-300 mt-1">
          Explore Product
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
