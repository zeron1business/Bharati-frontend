export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  productCount?: number;
}

export interface ProductMedia {
  id: string;
  type: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number;
  stockQuantity: number;
  skuSuffix: string;
}

export interface ProductCard {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  categorySlug: string;
  basePrice: number;
  discountedPrice: number;
  primaryImageUrl: string;
  badges: string[];
  inStock: boolean;
}

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: Category;
  basePrice: number;
  discountedPrice: number;
  sku: string;
  inStock: boolean;
  badges: string[];
  media: ProductMedia[];
  variants: ProductVariant[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
