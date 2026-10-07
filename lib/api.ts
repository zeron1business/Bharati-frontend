import {
  ApiResponse,
  PagedResponse,
  ProductCard,
  ProductDetail,
  ProductCategory,
  AuthResponse,
  CustomerProfile,
  Address,
  AddressInput,
  OrderCreatePayload,
  OrderResponse,
  PaymentVerificationPayload,
  OrderDetail,
} from "@/types/ecommerce";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bharati_token");
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isGet = !options.method || options.method === "GET";
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    ...(isGet && !(options as any).next && !options.cache ? { next: { revalidate: 60 } } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  let json: ApiResponse<T> | null = null;

  try {
    const text = await response.text();
    if (text) {
      json = JSON.parse(text);
    }
  } catch {
    // Non-JSON response (e.g. HTML error page from Spring Security)
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    const errorMsg = json?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (json && !json.success) {
    throw new Error(json.message || "Operation failed");
  }

  return json?.data as T;
}

// ==========================================
// Catalog API
// ==========================================

export async function getProducts(params?: {
  page?: number;
  size?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<PagedResponse<ProductCard>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", params.page.toString());
  if (params?.size !== undefined) query.set("size", params.size.toString());
  if (params?.category) {
    query.set("category", params.category);
    query.set("categorySlug", params.category);
  }
  if (params?.search) query.set("search", params.search);
  if (params?.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
  if (params?.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
  if (params?.sort) query.set("sort", params.sort);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return fetchApi<PagedResponse<ProductCard>>(`/products${qs}`, { cache: "no-store" });
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  // Cache-bust with timestamp to bypass CDN / reverse-proxy caches
  const cacheBuster = `_t=${Date.now()}`;
  const sep = slug.includes("?") ? "&" : "?";
  return fetchApi<ProductDetail>(`/products/${slug}${sep}${cacheBuster}`, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  } as any);
}

export async function getCategories(): Promise<ProductCategory[]> {
  return fetchApi<ProductCategory[]>("/categories");
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return fetchApi<ProductCard[]>("/products/featured");
}

export async function getBestSellers(): Promise<ProductCard[]> {
  return fetchApi<ProductCard[]>("/products/best-sellers");
}

// ==========================================
// Auth & OTP API
// ==========================================

export async function sendOtp(phone: string): Promise<void> {
  await fetchApi<void>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
  name?: string
): Promise<AuthResponse> {
  return fetchApi<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp, name }),
  });
}

// ==========================================
// Customer Profile & Address API
// ==========================================

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return fetchApi<CustomerProfile>("/customers/me");
}

export async function updateCustomerProfile(payload: {
  name: string;
  email?: string;
}): Promise<CustomerProfile> {
  return fetchApi<CustomerProfile>("/customers/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getCustomerAddresses(): Promise<Address[]> {
  return fetchApi<Address[]>("/customers/me/addresses");
}

export async function createAddress(address: AddressInput): Promise<Address> {
  return fetchApi<Address>("/customers/me/addresses", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function updateAddress(
  id: string,
  address: AddressInput
): Promise<Address> {
  return fetchApi<Address>(`/customers/me/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(address),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await fetchApi<void>(`/customers/me/addresses/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// Orders & Payment API
// ==========================================

export async function createOrder(
  payload: OrderCreatePayload
): Promise<OrderResponse> {
  return fetchApi<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(
  payload: PaymentVerificationPayload
): Promise<boolean> {
  return fetchApi<boolean>("/orders/verify-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(): Promise<OrderDetail[]> {
  return fetchApi<OrderDetail[]>("/orders/me");
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderDetail> {
  return fetchApi<OrderDetail>(`/orders/${orderNumber}`);
}
