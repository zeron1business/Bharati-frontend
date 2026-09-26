"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, Plus, Minus } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  basePrice: number;
  discountedPrice: number;
  stockQuantity: number;
  volumeLitres?: number;
  materialType?: string;
  inductionCompatible?: boolean;
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
}

export function AddToCartSection({
  productId,
  title,
  slug,
  baseNumericPrice = 0,
  imageUrl,
  variants = [],
  fallbackInStock = true,
  fallbackStock = 99,
}: AddToCartSectionProps) {
  const { addItem } = useCart();
  
  // 1. Extract unique dimensions
  const hasVariants = variants && variants.length > 1;
  const uniqueInductions = useMemo(() => Array.from(new Set(variants.map(v => v.inductionCompatible).filter(i => i != null))) as boolean[], [variants]);
  const uniqueVolumes = useMemo(() => Array.from(new Set(variants.map(v => v.volumeLitres).filter(v => v != null))).sort((a, b) => a - b) as number[], [variants]);
  const uniqueMaterials = useMemo(() => Array.from(new Set(variants.map(v => v.materialType).filter(m => m != null && m !== ""))) as string[], [variants]);

  // 2. Selection state
  const [selectedInduction, setSelectedInduction] = useState<boolean | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // Initialize selection with first variant if available
  useEffect(() => {
      if (variants && variants.length > 0 && variants[0]) {
          if (selectedInduction === null && variants[0].inductionCompatible != null) setSelectedInduction(variants[0].inductionCompatible);
          if (selectedVolume === null && variants[0].volumeLitres != null) setSelectedVolume(variants[0].volumeLitres);
          if (selectedMaterial === null && variants[0].materialType != null) setSelectedMaterial(variants[0].materialType);
      }
  }, [hasVariants, variants]);

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
  }, [selectedVariant, currentStock]);

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
                  `₹ ${priceRange.min.toLocaleString("en-IN")} – ₹ ${priceRange.max.toLocaleString("en-IN")}`
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
      {(uniqueInductions.length > 0 || uniqueVolumes.length > 0 || uniqueMaterials.length > 0) && (
          <div className="space-y-5 pt-2">
              {/* Compatibility */}
              {uniqueInductions.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Compatibility</span>
                      <div className="flex flex-wrap gap-3">
                          {uniqueInductions.map(isInduction => {
                              const isAvailable = isCombinationAvailable(isInduction, null, null);
                              return (
                                  <button
                                      key={isInduction ? 'induction' : 'non-induction'}
                                      onClick={() => setSelectedInduction(isInduction)}
                                      disabled={!isAvailable}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                                          selectedInduction === isInduction
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : !isAvailable 
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
                                            : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {isInduction ? 'Induction Base' : 'Non-Induction Base'}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* Capacity */}
              {uniqueVolumes.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Capacity</span>
                      <div className="flex flex-wrap gap-3">
                          {uniqueVolumes.map(vol => {
                              const isAvailable = isCombinationAvailable(null, vol, null);
                              return (
                                  <button
                                      key={vol}
                                      onClick={() => setSelectedVolume(vol)}
                                      disabled={!isAvailable}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all min-w-[3rem] ${
                                          selectedVolume === vol
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : !isAvailable 
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
                                            : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {vol}L
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* Material Type */}
              {uniqueMaterials.length > 0 && (
                  <div className="space-y-3">
                      <span className="text-sm font-medium text-bharati-charcoal">Material Type</span>
                      <div className="flex flex-wrap gap-3">
                          {uniqueMaterials.map(mat => {
                              const isAvailable = isCombinationAvailable(null, null, mat);
                              return (
                                  <button
                                      key={mat}
                                      onClick={() => setSelectedMaterial(mat)}
                                      disabled={!isAvailable}
                                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                                          selectedMaterial === mat
                                          ? 'border-bharati-mint-dark bg-bharati-mint/10 text-bharati-mint-dark font-medium shadow-sm' 
                                          : !isAvailable 
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
                                            : 'border-bharati-mist text-bharati-ash hover:border-bharati-charcoal/30'
                                      }`}
                                  >
                                      {mat}
                                  </button>
                              );
                          })}
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
    </div>
  );
}
