"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  Package,
  Layers,
  AlertCircle,
  Tag,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from "lucide-react";
import { adminFetchProduct, adminFetchCategories } from "@/app/lib/admin-api";
import { useToast } from "@/app/admin/ToastContext";
import { getSessionCache, setSessionCache, CACHE_KEYS } from "@/app/lib/cache";

export default function AdminProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { showToast } = useToast();
  const [product, setProduct] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError("");

    try {
      const cachedCategories = getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
      if (cachedCategories && cachedCategories.length > 0) {
        setCategories(cachedCategories);
      }

      const [categoriesRes, productRes] = await Promise.all([
        adminFetchCategories(),
        adminFetchProduct(productId)
      ]);
      
      setCategories(categoriesRes.data);
      setSessionCache(CACHE_KEYS.ADMIN_CATEGORIES, categoriesRes.data);
      setProduct(productRes.data);
    } catch (err: any) {
      console.error("Failed to load product details:", err);
      setError(err.message || "Failed to load product details.");
      showToast(err.message || "Failed to load product details.", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const toggleVariantExpand = (variantId: string) => {
    if (expandedVariant === variantId) {
      setExpandedVariant(null);
    } else {
      setExpandedVariant(variantId);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-bharati-mist" />
            <div className="w-12 h-12 rounded-full border-2 border-bharati-charcoal border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-bharati-charcoal font-medium">Loading product details…</p>
        </div>

        <div className="mt-10 space-y-6">
          <div className="bg-white rounded-lg border border-bharati-mist p-6 animate-pulse h-32" />
          <div className="bg-white rounded-lg border border-bharati-mist p-6 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-sm font-medium text-bharati-black">Failed to load product</p>
          <p className="text-xs text-bharati-ash max-w-sm">{error || "Product not found"}</p>
          <Link href="/admin/products" className="text-sm text-bharati-gold hover:underline mt-2">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  // Get category name
  let categoryName = "Uncategorized";
  if (product.subcategory?.categoryId) {
    const parentCat = categories.find(c => c.id === product.subcategory.categoryId);
    if (parentCat) categoryName = parentCat.name;
  }

  // Find cover image
  const mUrls = (product.media || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const coverImageUrl = mUrls[0]?.url || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-bharati-cream rounded-full transition-colors shrink-0">
            <ArrowLeft size={20} className="text-bharati-charcoal" />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide flex items-center gap-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {product.isActive ? "Active" : "Inactive"}
              </span>
              {product.isFeatured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-bharati-gold/10 text-bharati-gold">
                  Featured
                </span>
              )}
              <span className="text-xs text-bharati-ash flex items-center gap-1">
                <Tag size={12} /> {product.slug}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2 text-bharati-ash hover:text-bharati-charcoal hover:bg-bharati-cream rounded-full transition-colors disabled:opacity-50"
            title="Refresh details"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-bharati-charcoal text-white rounded hover:bg-bharati-black transition-colors text-sm font-medium"
          >
            <Edit2 size={16} /> Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-bharati-mist overflow-hidden">
            <div className="aspect-square bg-bharati-cream relative">
              {coverImageUrl ? (
                <Image src={coverImageUrl} alt={product.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-bharati-ash">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm">No cover image</span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-1">Tagline</h3>
                <p className="text-sm text-bharati-charcoal">{product.tagline || "—"}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-1">Category & Subcategory</h3>
                <div className="flex items-center gap-2 text-sm text-bharati-charcoal">
                  <Layers size={14} className="text-bharati-gold" />
                  {categoryName} <span className="text-bharati-ash">/</span> {product.subcategory?.name || "Uncategorized"}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-1">Sort Order</h3>
                <p className="text-sm text-bharati-charcoal">{product.sortOrder || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-bharati-mist p-5 space-y-4">
            <h3 className="text-sm font-medium text-bharati-black flex items-center gap-2 border-b border-bharati-mist pb-2">
              <ShieldCheck size={16} className="text-bharati-gold" /> Warranty & Badges
            </h3>
            
            <div>
              <h4 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-1">Warranty Duration</h4>
              <p className="text-sm text-bharati-charcoal">{product.warrantyDuration || "No warranty"}</p>
            </div>
            
            {product.warrantyDetails && (
              <div>
                <h4 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-1">Warranty Details</h4>
                <p className="text-sm text-bharati-charcoal">{product.warrantyDetails}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-bharati-ash uppercase tracking-wider mb-2">Badges</h4>
              {product.badges && product.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((badge: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-bharati-cream text-bharati-charcoal text-xs rounded-full border border-bharati-mist">
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-bharati-ash">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Description & Variants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-bharati-mist p-5">
            <h3 className="text-sm font-medium text-bharati-black mb-3">Description</h3>
            {product.description ? (
              <p className="text-sm text-bharati-charcoal whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p className="text-sm text-bharati-ash italic">No description provided.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-bharati-mist overflow-hidden">
            <div className="p-5 border-b border-bharati-mist flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-medium text-bharati-black flex items-center gap-2">
                <Package size={16} className="text-bharati-charcoal" /> 
                Variants ({product.variants?.length || 0})
              </h3>
            </div>
            
            {(!product.variants || product.variants.length === 0) ? (
              <div className="p-8 text-center text-bharati-ash text-sm">
                No variants available for this product.
              </div>
            ) : (
              <div className="divide-y divide-bharati-mist">
                {product.variants.map((variant: any, idx: number) => {
                  const isExpanded = expandedVariant === variant.id;
                  const discountPct = variant.basePrice && variant.discountedPrice && variant.basePrice > 0 
                    ? Math.round(((variant.basePrice - variant.discountedPrice) / variant.basePrice) * 100) 
                    : 0;
                  
                  return (
                    <div key={variant.id || idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <div 
                        className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                        onClick={() => toggleVariantExpand(variant.id)}
                      >
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-bharati-black text-sm">SKU: {variant.sku || "N/A"}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${
                              variant.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {variant.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bharati-ash">
                            {variant.volumeLitres && <span>Vol: <strong className="text-bharati-charcoal font-medium">{variant.volumeLitres}L</strong></span>}
                            {variant.materialType && <span>Material: <strong className="text-bharati-charcoal font-medium">{variant.materialType}</strong></span>}
                            {variant.inductionCompatible !== null && variant.inductionCompatible !== undefined && (
                              <span className="flex items-center gap-1">
                                Induction: 
                                {variant.inductionCompatible ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-right shrink-0">
                          <div>
                            <div className="text-xs text-bharati-ash mb-0.5">Price</div>
                            <div className="font-medium text-bharati-black">
                              ₹{variant.discountedPrice || variant.basePrice}
                              {discountPct > 0 && (
                                <span className="ml-1 text-[10px] text-red-500 font-bold px-1 bg-red-50 rounded">
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                            {discountPct > 0 && (
                              <div className="text-[10px] text-bharati-ash line-through">₹{variant.basePrice}</div>
                            )}
                          </div>
                          <div className="w-16">
                            <div className="text-xs text-bharati-ash mb-0.5">Stock</div>
                            <div className={`font-medium ${
                              (variant.stockQuantity || 0) > 10 ? 'text-green-600' :
                              (variant.stockQuantity || 0) > 0 ? 'text-orange-500' :
                              'text-red-600'
                            }`}>
                              {variant.stockQuantity || 0}
                            </div>
                          </div>
                          <button className="p-1 text-bharati-ash hover:text-bharati-charcoal transition-colors">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-bharati-mist border-dashed bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs font-semibold text-bharati-ash uppercase tracking-wider mb-2">Specifications</h4>
                              {variant.specifications && variant.specifications.length > 0 ? (
                                <div className="border border-bharati-mist rounded-md bg-white overflow-hidden">
                                  <table className="w-full text-xs">
                                    <tbody className="divide-y divide-bharati-mist">
                                      {variant.specifications.map((spec: any, sIdx: number) => (
                                        <tr key={sIdx}>
                                          <td className="px-3 py-2 bg-gray-50/50 font-medium text-bharati-charcoal w-1/3 border-r border-bharati-mist">
                                            {spec.specKey}
                                          </td>
                                          <td className="px-3 py-2 text-bharati-charcoal">
                                            {spec.specValue}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-bharati-ash italic">No specifications added.</p>
                              )}
                              
                              {variant.warrantyOverride && (
                                <div className="mt-4 p-3 bg-bharati-gold/5 border border-bharati-gold/20 rounded-md">
                                  <h4 className="text-[10px] font-bold text-bharati-gold uppercase tracking-wider mb-1">Warranty Override</h4>
                                  <p className="text-xs text-bharati-charcoal">{variant.warrantyOverride}</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-xs font-semibold text-bharati-ash uppercase tracking-wider mb-2">Images</h4>
                              {variant.mediaUrls && variant.mediaUrls.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {variant.mediaUrls.map((url: string, mIdx: number) => (
                                    <div key={mIdx} className="aspect-square relative rounded border border-bharati-mist overflow-hidden bg-white">
                                      <Image src={url} alt={`${variant.sku} image ${mIdx + 1}`} fill unoptimized className="object-cover" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-bharati-ash italic">No images uploaded for this variant.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
