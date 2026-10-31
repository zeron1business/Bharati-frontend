"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, Plus, Minus, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useProductImages } from "./ProductContext";

interface ProductSibling {
  id: string;
  slug: string;
  label: string;
  name: string;
  thumbnailUrl?: string;
  minPrice?: number;
  inStock?: boolean;
  current?: boolean;
}

interface ProductGroup {
  id?: string;
  name?: string;
  selectorLabel?: string;
  siblings?: ProductSibling[];
}

interface Variant {
  id: string;
  sku: string;
  basePrice: number;
  discountedPrice: number;
  stockQuantity: number;
  volumeLitres?: number;
  materialType?: string;
  inductionCompatible?: boolean;
  warrantyOverride?: string;
  specifications?: Array<{ specKey: string; specValue: string }>;
  mediaUrls?: string[];
  media?: { url: string }[];
}

interface AddToCartSectionProps {
  productId: string;
  title: string;
  slug: string;
  baseNumericPrice?: number;
  imageUrl: string;
  variants?: Variant[];
  fallbackInStock?: boolean;
  fallbackStock?: number;
  productWarranty?: string;
  productBaseImages?: string[];
  productOwnImages?: string[];
  group?: ProductGroup | null;
}

const EMPTY_IMAGES: string[] = [];

export function AddToCartSection({
  productId,
  title,
  slug,
  baseNumericPrice = 0,
  imageUrl,
  variants = [],
  fallbackInStock = true,
  fallbackStock = 99,
  productWarranty = "5-Year Warranty",
  productBaseImages = EMPTY_IMAGES,
  productOwnImages = EMPTY_IMAGES,
  group = null,
}: AddToCartSectionProps) {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { setActiveImages } = useProductImages();
  
  // 1. Extract unique dimensions
  const hasVariants = variants && variants.length > 0;
  const uniqueInductions = useMemo(() => Array.from(new Set(variants.map(v => v.inductionCompatible).filter(i => i != null))) as boolean[], [variants]);
  const uniqueVolumes = useMemo(() => Array.from(new Set(variants.map(v => v.volumeLitres).filter(v => v != null))).sort((a, b) => a - b) as number[], [variants]);
  const uniqueMaterials = useMemo(() => Array.from(new Set(variants.map(v => v.materialType).filter(m => m != null && m !== ""))) as string[], [variants]);

  // 2. Selection state
  const [selectedInduction, setSelectedInduction] = useState<boolean | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // 2b. Filtered options based on selected induction (hides unavailable volumes/materials)
  const filteredVolumes = useMemo(() => {
    if (selectedInduction === null || uniqueInductions.length === 0) {
      return uniqueVolumes;
    }
    const available = variants
      .filter(v => v.inductionCompatible === selectedInduction)
      .map(v => v.volumeLitres)
      .filter(v => v != null);
    return Array.from(new Set(available)).sort((a, b) => a - b) as number[];
  }, [variants, selectedInduction, uniqueInductions, uniqueVolumes]);

  const filteredMaterials = useMemo(() => {
    if (selectedInduction === null || uniqueInductions.length === 0) {
      return uniqueMaterials;
    }
    const available = variants
      .filter(v => v.inductionCompatible === selectedInduction)
      .map(v => v.materialType)
      .filter(m => m != null && m !== "");
    return Array.from(new Set(available)) as string[];
  }, [variants, selectedInduction, uniqueInductions, uniqueMaterials]);

  // Initialize selection with URL params or first variant if available
  useEffect(() => {
      if (variants && variants.length > 0) {
          const qInduction = searchParams?.get("induction");
          const qVolume = searchParams?.get("volume");

          let targetInduction = selectedInduction;
          if (targetInduction === null) {
              if (qInduction === "true" && uniqueInductions.includes(true)) {
                  targetInduction = true;
              } else if (qInduction === "false" && uniqueInductions.includes(false)) {
                  targetInduction = false;
              } else if (variants[0].inductionCompatible != null) {
                  targetInduction = variants[0].inductionCompatible;
              }
              if (targetInduction !== null) setSelectedInduction(targetInduction);
          }

          let targetVolume = selectedVolume;
          if (targetVolume === null) {
              const parsedVol = qVolume ? parseFloat(qVolume) : NaN;
              if (!isNaN(parsedVol) && uniqueVolumes.includes(parsedVol)) {
                  targetVolume = parsedVol;
              } else if (variants[0].volumeLitres != null) {
                  targetVolume = variants[0].volumeLitres;
              }
              if (targetVolume !== null) setSelectedVolume(targetVolume);
          }

          if (selectedMaterial === null && variants[0].materialType != null) {
              setSelectedMaterial(variants[0].materialType);
          }
      }
  }, [hasVariants, variants, searchParams, uniqueInductions, uniqueVolumes]);

  // Keep browser URL search params in sync smoothly
  useEffect(() => {
      if (typeof window !== "undefined" && (selectedInduction !== null || selectedVolume !== null)) {
          const params = new URLSearchParams(window.location.search);
          if (selectedInduction !== null) params.set("induction", String(selectedInduction));
          if (selectedVolume !== null) params.set("volume", String(selectedVolume));
          const qs = params.toString();
          const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
          window.history.replaceState(null, "", newUrl);
      }
  }, [selectedInduction, selectedVolume]);

  // 3. Find exact matching variant
  const selectedVariant = useMemo(() => {
      if (!hasVariants) return variants[0] || null;
      return variants.find(v => {
          const matchInduction = uniqueInductions.length === 0 || v.inductionCompatible === selectedInduction;
          const matchVolume = uniqueVolumes.length === 0 || v.volumeLitres === selectedVolume;
          const matchMaterial = uniqueMaterials.length === 0 || v.materialType === selectedMaterial;
          return matchInduction && matchVolume && matchMaterial;
      }) || null;
  }, [variants, hasVariants, selectedInduction, selectedVolume, selectedMaterial, uniqueInductions, uniqueVolumes, uniqueMaterials]);

  // Price range calculation when no exact variant is matched
  const priceRange = useMemo(() => {
      if (!hasVariants) return null;
      let min = Infinity, max = -Infinity;
      variants.forEach(v => {
          const price = v.discountedPrice || v.basePrice;
          if (price < min) min = price;
          if (price > max) max = price;
      });
      return { min, max };
  }, [variants, hasVariants]);

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Derive current price and stock
  const currentPrice = selectedVariant 
    ? (selectedVariant.discountedPrice || selectedVariant.basePrice)
    : (hasVariants && priceRange ? priceRange.min : baseNumericPrice);
    
  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : (hasVariants ? 0 : fallbackStock);
    
  const currentInStock = currentStock > 0;

  // Reset quantity when variant changes if it exceeds new stock
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (quantity < 1 && currentStock > 0) {
        setQuantity(1);
    }
    
    // Update the image gallery with variant specific images
    if (selectedVariant) {
        let variantImages: string[] = [];
        if (selectedVariant.mediaUrls && selectedVariant.mediaUrls.length > 0) {
            variantImages = selectedVariant.mediaUrls;
        } else if (selectedVariant.media && selectedVariant.media.length > 0) {
            variantImages = selectedVariant.media.map(m => m.url);
        }
        
        if (variantImages.length > 0) {
            // Only images for that particular variant
            setActiveImages(variantImages);
        } else {
            setActiveImages(productBaseImages);
        }
    } else {
        setActiveImages(productBaseImages);
    }
  }, [selectedVariant, currentStock, productBaseImages, productOwnImages, setActiveImages]);

  const handleAddToCart = () => {
    if (!currentInStock || (hasVariants && !selectedVariant)) return;
    
    // Add variant details to title if applicable for the cart display
    let cartTitle = title;
    if (selectedVariant) {
        const parts = [];
        if (selectedVariant.volumeLitres) parts.push(`${selectedVariant.volumeLitres}L`);
        if (selectedVariant.materialType) parts.push(selectedVariant.materialType);
        if (selectedVariant.inductionCompatible) parts.push("Induction");
        
        if (parts.length > 0) {
            cartTitle = `${title} — ${parts.join(", ")}`;
        }
    }

    addItem({
      productId,
      variantId: selectedVariant?.id,
      title: cartTitle,
      slug,
      price: currentPrice,
      imageUrl,
      quantity,
      maxStock: currentStock,
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2500);
  };

  const increment = () => {
    if (quantity < currentStock) setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Helper to check if a specific combination exists
  const isCombinationAvailable = (induction: boolean | null, volume: number | null, material: string | null) => {
      return variants.some(v => {
          const matchInduction = uniqueInductions.length === 0 || v.inductionCompatible === (induction !== null ? induction : selectedInduction);
          const matchVolume = uniqueVolumes.length === 0 || v.volumeLitres === (volume !== null ? volume : selectedVolume);
          const matchMaterial = uniqueMaterials.length === 0 || v.materialType === (material !== null ? material : selectedMaterial);
          return matchInduction && matchVolume && matchMaterial;
      });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Price Display */}
      <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-4">
            <span className="text-[1.75rem] font-medium text-bharati-mint-dark transition-all">
              {hasVariants && !selectedVariant && priceRange && priceRange.min !== priceRange.max ? (
                  `₹ ${priceRange.min.toLocaleString("en-IN")}`
              ) : (
                  `₹ ${currentPrice.toLocaleString("en-IN")}`
              )}
            </span>
            <span className="text-sm text-bharati-silver font-light">
              (Inclusive of all taxes)
            </span>
          </div>
          {selectedVariant && selectedVariant.basePrice > selectedVariant.discountedPrice && (
              <div className="flex items-center gap-2 text-sm">
                  <span className="line-through text-gray-400">MRP ₹{selectedVariant.basePrice.toLocaleString("en-IN")}</span>
                  <span className="text-green-600 font-medium">
                      {Math.round(((selectedVariant.basePrice - selectedVariant.discountedPrice) / selectedVariant.basePrice) * 100)}% off
                  </span>
              </div>
          )}
      </div>
      
      {/* Grouped Variant Selection */}
      {(Boolean(group?.siblings && group.siblings.length > 1) || uniqueInductions.length > 0 || filteredVolumes.length > 0 || filteredMaterials.length > 0) && (
          <div className="space-y-5 pt-2">
              {/* Product Type / Family Switcher */}
              {group && group.siblings && group.siblings.length > 1 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">
                          {group.selectorLabel || "Type"}
                      </span>
                      <div className="flex flex-wrap gap-3">
                          {group.siblings.map((sibling) => {
                              const isCurrent = sibling.current || sibling.slug === slug;
                              const params = new URLSearchParams();
                              if (selectedInduction !== null) params.set("induction", String(selectedInduction));
                              if (selectedVolume !== null) params.set("volume", String(selectedVolume));
                              const qs = params.toString();
                              const href = `/products/${sibling.slug}${qs ? `?${qs}` : ""}`;

                              if (isCurrent) {
                                  return (
                                      <button
                                          key={sibling.slug}
                                          type="button"
                                          disabled
                                          className="px-4 py-2 text-sm rounded-md border border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm cursor-default"
                                      >
                                          {sibling.label}
                                      </button>
                                  );
                              }

                              return (
                                  <Link
                                      key={sibling.slug}
                                      href={href}
                                      scroll={false}
                                      prefetch
                                      className="px-4 py-2 text-sm rounded-md border border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30 transition-all inline-flex items-center gap-1.5"
                                  >
                                      <span>{sibling.label}</span>
                                      {sibling.inStock === false && (
                                          <span className="text-[10px] text-gray-400 font-light">(Out of stock)</span>
                                      )}
                                  </Link>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* Compatibility */}
              {uniqueInductions.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Compatibility</span>
                      <div className="flex flex-wrap gap-3">
                          {uniqueInductions.map(isInduction => (
                                  <button
                                      key={isInduction ? 'induction' : 'non-induction'}
                                      onClick={() => {
                                          setSelectedInduction(isInduction);
                                          const availableVols = variants
                                              .filter(v => v.inductionCompatible === isInduction)
                                              .map(v => v.volumeLitres)
                                              .filter(v => v != null);
                                          const sortedVols = Array.from(new Set(availableVols)).sort((a, b) => a - b);
                                          let nextVol = selectedVolume;
                                          if (sortedVols.length > 0 && (!selectedVolume || !sortedVols.includes(selectedVolume))) {
                                              nextVol = sortedVols[0];
                                              setSelectedVolume(nextVol);
                                          }
                                          const availableMats = variants
                                              .filter(v => v.inductionCompatible === isInduction && (nextVol == null || v.volumeLitres === nextVol))
                                              .map(v => v.materialType)
                                              .filter(m => m != null && m !== "");
                                          const uniqueMats = Array.from(new Set(availableMats)) as string[];
                                          if (uniqueMats.length > 0 && uniqueMats[0] && (!selectedMaterial || !uniqueMats.includes(selectedMaterial))) {
                                              setSelectedMaterial(uniqueMats[0]);
                                          }
                                      }}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                                          selectedInduction === isInduction
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {isInduction ? 'Induction Base' : 'Non-Induction Base'}
                                  </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* Capacity */}
              {filteredVolumes.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Capacity</span>
                      <div className="flex flex-wrap gap-3">
                          {filteredVolumes.map(vol => (
                                  <button
                                      key={vol}
                                      onClick={() => {
                                          setSelectedVolume(vol);
                                          const exists = variants.some(v => (selectedInduction == null || v.inductionCompatible === selectedInduction) && v.volumeLitres === vol && (selectedMaterial == null || v.materialType === selectedMaterial));
                                          if (!exists) {
                                              const fallback = variants.find(v => (selectedInduction == null || v.inductionCompatible === selectedInduction) && v.volumeLitres === vol);
                                              if (fallback) {
                                                  if (fallback.materialType != null) setSelectedMaterial(fallback.materialType);
                                              }
                                          }
                                      }}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all min-w-[3rem] ${
                                          selectedVolume === vol
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {vol}L
                                  </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* Material Type */}
              {filteredMaterials.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Material Type</span>
                      <div className="flex flex-wrap gap-3">
                          {filteredMaterials.map(mat => (
                                  <button
                                      key={mat}
                                      onClick={() => {
                                          setSelectedMaterial(mat);
                                          const exists = variants.some(v => (selectedInduction == null || v.inductionCompatible === selectedInduction) && (selectedVolume == null || v.volumeLitres === selectedVolume) && v.materialType === mat);
                                          if (!exists) {
                                              const fallback = variants.find(v => (selectedInduction == null || v.inductionCompatible === selectedInduction) && v.materialType === mat);
                                              if (fallback) {
                                                  if (fallback.volumeLitres != null) setSelectedVolume(fallback.volumeLitres);
                                              }
                                          }
                                      }}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                                          selectedMaterial === mat
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {mat}
                                  </button>
                          ))}
                      </div>
                  </div>
              )}
              
              {!selectedVariant && (
                  <div className="text-sm text-red-500 font-medium pt-2">
                      Please select available options.
                  </div>
              )}
          </div>
      )}

      {currentInStock && (!hasVariants || selectedVariant) ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-100 mt-6">
          {/* Quantity Adjuster */}
          <div className="flex items-center border border-bharati-mist rounded-full bg-bharati-ivory px-2 py-1">
            <button
              onClick={decrement}
              disabled={quantity <= 1}
              className="p-1.5 text-bharati-charcoal hover:text-bharati-mint-dark disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-medium text-[0.95rem] text-bharati-charcoal">
              {quantity}
            </span>
            <button
              onClick={increment}
              disabled={quantity >= currentStock}
              className="p-1.5 text-bharati-charcoal hover:text-bharati-mint-dark disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`btn-primary flex items-center justify-center gap-2 transition-all duration-300 min-w-[200px] ${
              justAdded ? "bg-bharati-mint text-white" : ""
            }`}
          >
            {justAdded ? (
              <>
                <Check size={18} />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
          
          {currentStock <= 5 && (
              <span className="text-sm text-amber-600 font-medium ml-2">
                  Only {currentStock} left in stock!
              </span>
          )}
        </div>
      ) : (
        <div className="inline-block mt-4 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
          Currently Out of Stock
        </div>
      )}

      {/* Added Confirmation Banner */}
      {justAdded && (
        <div className="flex items-center gap-3 pt-2 text-sm text-bharati-mint-dark animate-fade-in">
          <span>Item added to your cart.</span>
          <Link
            href="/cart"
            className="underline font-semibold hover:text-bharati-charcoal transition-colors"
          >
            View Cart & Checkout &rarr;
          </Link>
        </div>
      )}

      {/* Value Props */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-bharati-mist/60 text-center mt-8">
        <div className="flex flex-col items-center gap-1.5">
          <Truck size={20} className="text-bharati-mint-dark" />
          <span className="text-xs text-bharati-charcoal font-medium">Free Delivery</span>
          <span className="text-[10px] text-bharati-silver font-light">Across India</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <ShieldCheck size={20} className="text-bharati-mint-dark" />
          <span className="text-xs text-bharati-charcoal font-medium">
            {selectedVariant?.warrantyOverride || productWarranty || "5-Year Warranty"}
          </span>
          <span className="text-[10px] text-bharati-silver font-light">Genuine Bharati</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <CheckCircle2 size={20} className="text-bharati-mint-dark" />
          <span className="text-xs text-bharati-charcoal font-medium">Certified Safe</span>
          <span className="text-[10px] text-bharati-silver font-light">ISI & Food Grade</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-5 flex items-center justify-center">
            <Image
              src="/logo/make_in_india_bharati.png"
              alt="Made in India Lion Emblem"
              width={34}
              height={16}
              className="object-contain"
            />
          </div>
          <span className="text-xs text-bharati-charcoal font-medium">Made in India</span>
          <span className="text-[10px] text-bharati-silver font-light">Engineered at Home</span>
        </div>
      </div>

      {/* Specifications Table */}
      {selectedVariant?.specifications && selectedVariant.specifications.length > 0 && (
        <div className="mt-8">
            <h3 className="text-sm font-medium text-bharati-charcoal mb-4">Specifications</h3>
            <div className="border border-bharati-mist rounded-lg overflow-hidden text-sm">
                {selectedVariant.specifications.map((spec, idx) => (
                    <div key={idx} className={`flex border-b border-bharati-mist last:border-b-0 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <div className="w-1/3 p-3 font-medium text-bharati-charcoal border-r border-bharati-mist bg-gray-50/80">
                            {spec.specKey}
                        </div>
                        <div className="w-2/3 p-3 text-bharati-silver font-light">
                            {spec.specValue}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
