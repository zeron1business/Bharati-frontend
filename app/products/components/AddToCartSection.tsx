"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, Plus, Minus } from "lucide-react";

interface AddToCartSectionProps {
  productId: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  inStock?: boolean;
  maxStock?: number;
}

export function AddToCartSection({
  productId,
  title,
  slug,
  price,
  imageUrl,
  inStock = true,
  maxStock = 99,
}: AddToCartSectionProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId,
      title,
      slug,
      price,
      imageUrl,
      quantity,
      maxStock,
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2500);
  };

  const increment = () => {
    if (quantity < maxStock) setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="space-y-4">
      {inStock ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              disabled={quantity >= maxStock}
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
        </div>
      ) : (
        <div className="inline-block px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
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
