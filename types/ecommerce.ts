export interface ProductCard {
  id: string;
  title: string;
  name?: string;  // backend sends 'name', frontend historically used 'title'
  slug: string;
  tagline?: string;
  basePrice: number;
  discountedPrice?: number | null;
  minPrice?: number;
  maxPrice?: number;
  primaryImageUrl?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  subcategoryName?: string | null;
  subcategorySlug?: string | null;
  stockQuantity?: number;
  inStock: boolean;
  badges?: string[];
}

export interface ProductMedia {
  id: string;
  type: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  basePrice: number;
  discountedPrice?: number | null;
  stockQuantity: number;
  volumeLitres?: number | null;
  materialType?: string | null;
  inductionCompatible?: boolean;
  isActive?: boolean;
  warrantyOverride?: string | null;
  specifications?: Array<{ specKey: string; specValue: string }>;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: string;
  title: string;  // mapped from backend "name"
  name?: string;
  slug: string;
  tagline?: string;
  description: string;
  badges: string[];
  subcategory?: ProductSubcategory | null;
  category?: ProductCategory | null;
  media: ProductMedia[];
  variants: ProductVariant[];
  warrantyDuration?: string | null;
  warrantyDetails?: string | null;
  specifications?: Array<{ specKey: string; specValue: string }>;
  // Legacy fields for backward compat with fallback data
  basePrice?: number;
  discountedPrice?: number | null;
  sku?: string;
  stockQuantity?: number;
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  maxStock?: number;
}

export interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  phoneVerified: boolean;
  type: string;
  addresses: Address[];
}

export interface AuthResponse {
  token: string;
  customerId: string;
  name: string;
  phone: string;
  isNewCustomer: boolean;
}

export interface OrderItemCreatePayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderCreatePayload {
  items: OrderItemCreatePayload[];
  addressId?: string;
  newAddress?: AddressInput;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: string;
  currency: string;
  keyId?: string;
}

export interface PaymentVerificationPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  titleSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  productSlug?: string;
  productImageUrl?: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingLine1?: string;
  shippingLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  shippingCountry?: string;
  items: OrderItemDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
