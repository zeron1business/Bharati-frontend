"use client";

import React, { createContext, useContext, useState } from "react";

interface ProductContextType {
  activeImages: string[];
  setActiveImages: (images: string[]) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({
  children,
  initialImages,
}: {
  children: React.ReactNode;
  initialImages: string[];
}) {
  const [activeImages, setActiveImages] = useState<string[]>(initialImages);

  return (
    <ProductContext.Provider value={{ activeImages, setActiveImages }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductImages() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductImages must be used within a ProductProvider");
  }
  return context;
}
