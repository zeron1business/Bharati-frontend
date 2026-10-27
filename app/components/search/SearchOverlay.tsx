"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchCatalog } from "@/lib/api";
import { SearchResult } from "@/types/ecommerce";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "Cooker",
  "Pressure Cookers",
  "Tri-ply",
  "Kadhai",
  "Handi",
  "Belly",
  "Saucepan",
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryCache = useRef<Map<string, SearchResult>>(new Map());
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Auto-focus input and pre-warm category cache in background on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";

      // Pre-warm category cache in background (takes only ~15KB)
      if (!queryCache.current.has("cooker")) {
        searchCatalog("cooker").then((res) => {
          if (res) {
            queryCache.current.set("cooker", res);
            queryCache.current.set("cookers", res);
            queryCache.current.set("pressure cooker", res);
            queryCache.current.set("pressure cookers", res);
          }
        }).catch(() => {});
      }
      if (!queryCache.current.has("triply")) {
        searchCatalog("triply").then((res) => {
          if (res) {
            queryCache.current.set("triply", res);
            queryCache.current.set("tri-ply", res);
            queryCache.current.set("tri ply", res);
          }
        }).catch(() => {});
      }
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fast Hybrid search: 0ms on cache hit, debounced network fetch on new terms
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      return;
    }

    // 1. Instant cache hit (0ms, 0 network requests)
    if (queryCache.current.has(trimmed)) {
      setResults(queryCache.current.get(trimmed)!);
      setLoading(false);
      return;
    }

    // 2. Debounced fetch for uncached queries
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchCatalog(trimmed);
        if (data) {
          queryCache.current.set(trimmed, data);
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 240);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleNavigateToResult = (url: string) => {
    onClose();
    router.push(url);
  };

  const formatPrice = (p: { minPrice?: number; maxPrice?: number; discountedPrice?: number | null; basePrice?: number }) => {
    if (p.minPrice != null && p.maxPrice != null && p.minPrice > 0) {
      if (p.minPrice === p.maxPrice) {
        return `₹ ${Number(p.minPrice).toLocaleString("en-IN")}`;
      }
      return `₹ ${Number(p.minPrice).toLocaleString("en-IN")} – ₹ ${Number(p.maxPrice).toLocaleString("en-IN")}`;
    }
    const price = p.discountedPrice || p.basePrice || 0;
    return `₹ ${Number(price).toLocaleString("en-IN")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-start items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-bharati-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl mt-4 sm:mt-12 mx-auto px-4"
          >
            <div className="bg-bharati-cream rounded-3xl border border-bharati-mist/60 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
              {/* Top Search Input Bar */}
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center gap-3 px-5 py-4 border-b border-bharati-mist/40 bg-white"
              >
                <Search size={22} className="text-bharati-mint shrink-0" strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cookers, kadhai, tri-ply..."
                  className="w-full text-base sm:text-lg bg-transparent text-bharati-black placeholder:text-bharati-silver/70 focus:outline-hidden font-medium"
                />

                {loading ? (
                  <Loader2 size={18} className="animate-spin text-bharati-mint shrink-0" />
                ) : query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults(null);
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 rounded-full hover:bg-bharati-ivory text-bharati-charcoal/60 hover:text-bharati-black transition-colors"
                  >
                    <X size={17} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-bharati-ivory text-bharati-charcoal/60 hover:text-bharati-black transition-colors ml-1"
                  aria-label="Close search"
                >
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-bharati-ivory border border-bharati-mist/60 hidden sm:inline-block">
                    ESC
                  </span>
                  <X size={18} className="sm:hidden" />
                </button>
              </form>

              {/* Suggestions Chips */}
              <div className="px-5 py-3 bg-bharati-ivory/60 border-b border-bharati-mist/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-bharati-charcoal/50 shrink-0 flex items-center gap-1">
                  <Sparkles size={11} className="text-bharati-mint" /> Popular:
                </span>
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-bharati-mint/10 text-bharati-charcoal hover:text-bharati-mint border border-bharati-mist/50 hover:border-bharati-mint/40 transition-colors shrink-0 shadow-2xs"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Results Body */}
              <div className="overflow-y-auto px-5 py-5 space-y-6">
                {/* 1. Category Spotlight (if category match) */}
                {results?.categoryMatch && (
                  <div className="bg-white rounded-2xl border border-bharati-mint/30 p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-bharati-mist/30">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-bharati-ivory shrink-0 border border-bharati-mist/40">
                          <Image
                            src={results.categoryMatch.imageUrl || results.categoryMatch.categoryImageUrl || "/products/Cooker-front.jpg"}
                            alt={results.categoryMatch.categoryName}
                            fill
                            unoptimized={Boolean(
                              results.categoryMatch.imageUrl?.startsWith("http") ||
                              results.categoryMatch.categoryImageUrl?.startsWith("http")
                            )}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-bharati-mint-dark">
                            Category Match
                          </span>
                          <h3 className="text-lg font-bold text-bharati-black">
                            {results.categoryMatch.categoryName}
                          </h3>
                          {results.categoryMatch.description && (
                            <p className="text-xs text-bharati-charcoal/70 line-clamp-1">
                              {results.categoryMatch.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleNavigateToResult(`/search?q=${encodeURIComponent(query)}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-bharati-mint-dark hover:text-bharati-mint transition-colors self-end sm:self-center"
                      >
                        Explore Category <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Subcategories Row */}
                    {results.categoryMatch.subcategories && results.categoryMatch.subcategories.length > 0 && (
                      <div className="pt-3">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-bharati-charcoal/50 block mb-2.5">
                          Subcategories:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {results.categoryMatch.subcategories.map((sub) => (
                            <button
                              key={sub.slug}
                              onClick={() => handleNavigateToResult(`/search?q=${encodeURIComponent(sub.name)}`)}
                              className="group flex items-center gap-2.5 p-2 rounded-xl bg-bharati-ivory/70 hover:bg-bharati-mint/10 border border-bharati-mist/40 hover:border-bharati-mint/40 transition-all text-left"
                            >
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-bharati-mist/40">
                                {sub.imageUrl ? (
                                  <Image
                                    src={sub.imageUrl}
                                    alt={sub.name}
                                    fill
                                    unoptimized={sub.imageUrl.startsWith("http")}
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-bharati-mint/10" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-bharati-black block truncate group-hover:text-bharati-mint-dark">
                                  {sub.name}
                                </span>
                                <span className="text-[10px] text-bharati-charcoal/60">
                                  {sub.productCount} {sub.productCount === 1 ? "product" : "products"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Products List */}
                {results && results.products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-bharati-charcoal/70">
                        {results.categoryMatch ? "Matching Products" : "Search Results"} ({results.products.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.products.slice(0, 6).map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => handleNavigateToResult(`/products/${prod.slug}`)}
                          className="group flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-bharati-mint/5 border border-bharati-mist/40 hover:border-bharati-mint/40 transition-all text-left shadow-2xs"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bharati-ivory shrink-0 border border-bharati-mist/30">
                            {prod.primaryImageUrl ? (
                              <Image
                                src={prod.primaryImageUrl}
                                alt={prod.name || prod.title || "Product"}
                                fill
                                unoptimized={prod.primaryImageUrl.startsWith("http")}
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-bharati-mint/10" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-bharati-black block truncate group-hover:text-bharati-mint-dark transition-colors">
                              {prod.name || prod.title}
                            </span>
                            <span className="text-[11px] text-bharati-charcoal/60 block truncate">
                              {prod.subcategoryName || prod.categoryName || "Cookware"}
                            </span>
                            <span className="text-xs font-bold text-bharati-mint-dark block mt-1">
                              {formatPrice(prod)}
                            </span>
                          </div>
                          <ArrowRight
                            size={15}
                            className="text-bharati-silver group-hover:text-bharati-mint group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Empty State (no results found) */}
                {query.trim() && !loading && results && results.products.length === 0 && !results.categoryMatch && (
                  <div className="text-center py-10 px-4">
                    <p className="text-sm font-semibold text-bharati-charcoal mb-1">
                      No exact matches found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-bharati-silver">
                      Try searching with broader terms like &ldquo;cooker&rdquo;, &ldquo;kadhai&rdquo;, or &ldquo;tri-ply&rdquo;.
                    </p>
                  </div>
                )}

                {/* 4. Initial Prompt state */}
                {!query.trim() && (
                  <div className="text-center py-8 text-bharati-silver">
                    <p className="text-xs font-medium">
                      Type anything to start searching across categories and cookware.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Footer Action */}
              {results && (results.products.length > 0 || results.categoryMatch) && (
                <div className="p-3.5 bg-white border-t border-bharati-mist/40 flex items-center justify-between">
                  <span className="text-xs text-bharati-charcoal/70">
                    Found {results.totalProductResults} {results.totalProductResults === 1 ? "result" : "results"}
                  </span>
                  <button
                    onClick={() => handleNavigateToResult(`/search?q=${encodeURIComponent(query)}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bharati-mint hover:bg-bharati-mint-dark text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    View Full Results Page <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
