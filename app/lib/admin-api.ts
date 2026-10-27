const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";
export const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || `${API_BASE}/admin`;

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bharati_admin_token");
  }
  return null;
};

export const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
        let reason = "expired";
        try {
          const body = await response.clone().json();
          if (body?.code === "SESSION_REPLACED") reason = "replaced";
        } catch {
          // non-JSON body
        }
        localStorage.removeItem("bharati_admin_token");
        window.location.href = `/admin/login?reason=${reason}`;
        throw new Error(reason === "replaced" ? "Signed in on another device" : "Session expired");
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }
  return data;
};

export const adminLogin = (credentials: any) => 
  adminFetch("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

export const adminFetchProducts = (page: number = 0, search: string = "") => {
  let url = `/products?page=${page}&size=20`;
  const term = search.trim();
  if (term) url += `&search=${encodeURIComponent(term)}`;
  return adminFetch(url, { cache: "no-store" });
};

export const adminFetchProduct = (id: string) => adminFetch(`/products/${id}`);

export const adminCreateProduct = (data: any) => 
  adminFetch("/products", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateProduct = (id: string, data: any) => 
  adminFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteProduct = (id: string) => 
  adminFetch(`/products/${id}`, { method: "DELETE" });

export const adminUpdateProductSortOrder = (id: string, sortOrder: number) =>
  adminFetch(`/products/${id}/sort-order?sortOrder=${sortOrder}`, { method: "PATCH" });

export const adminCheckSlug = async (slug: string, excludeId?: string): Promise<boolean> => {
  if (!slug || !slug.trim()) return false;
  let url = `/products/check-slug?slug=${encodeURIComponent(slug.trim())}`;
  if (excludeId) url += `&excludeId=${encodeURIComponent(excludeId)}`;
  const res = await adminFetch(url);
  return Boolean(res.data);
};

export const adminCheckSku = async (sku: string, excludeVariantId?: string): Promise<boolean> => {
  if (!sku || !sku.trim()) return false;
  let url = `/products/check-sku?sku=${encodeURIComponent(sku.trim())}`;
  if (excludeVariantId) url += `&excludeVariantId=${encodeURIComponent(excludeVariantId)}`;
  const res = await adminFetch(url);
  return Boolean(res.data);
};

export const adminFetchCategories = () => adminFetch("/categories");

export const adminFetchSubcategories = (categoryId: string) => adminFetch(`/categories/${categoryId}/subcategories`);

export const adminFetchCategory = (id: string) => adminFetch(`/categories/${id}`);

export const adminCreateCategory = (data: any) => 
  adminFetch("/categories", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateCategory = (id: string, data: any) => 
  adminFetch(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteCategory = (id: string) => 
  adminFetch(`/categories/${id}`, { method: "DELETE" });

export const adminReactivateCategory = (id: string) => 
  adminFetch(`/categories/${id}/reactivate`, { method: "POST" });

export const adminFetchCategoryDetails = (id: string) => adminFetch(`/categories/${id}/details`);

export const adminUploadImage = async (file: File): Promise<string> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${ADMIN_API_BASE_URL}/media/upload`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to upload image");
    }
    return data.data; // URL string
};

export const adminUploadImages = async (files: File[]): Promise<string[]> => {
    const token = getAuthToken();
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await fetch(`${ADMIN_API_BASE_URL}/media/upload-multiple`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to upload images");
    }
    return data.data; // Array of URL strings
};

// Dashboard & Orders
export const adminFetchDashboardStats = () => adminFetch("/dashboard/stats");

export const adminFetchRecentOrders = (limit: number = 10) => 
  adminFetch(`/dashboard/recent-orders?limit=${limit}`);

export const adminFetchAllOrders = (status?: string) => {
  let url = "/dashboard/orders";
  if (status) url += `?status=${status}`;
  return adminFetch(url);
};

export const adminUpdateOrderStatus = (orderId: string, status: string) =>
  adminFetch(`/dashboard/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const adminFetchOrderDetails = (orderId: string) =>
  adminFetch(`/dashboard/orders/${orderId}`);

// ==========================================
// PROMO CODES
// ==========================================

export const adminFetchPromos = () => adminFetch("/promos");

export const adminFetchPromo = (id: string) => adminFetch(`/promos/${id}`);

export const adminCreatePromo = (data: any) =>
  adminFetch("/promos", { method: "POST", body: JSON.stringify(data) });

export const adminUpdatePromo = (id: string, data: any) =>
  adminFetch(`/promos/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeletePromo = (id: string) =>
  adminFetch(`/promos/${id}`, { method: "DELETE" });

// ==========================================
// COLLECTION TILES (Bento Block Manager)
// ==========================================

export const adminFetchCollectionTiles = () =>
  adminFetch("/collection");

export const adminFetchCollectionTile = (id: string) =>
  adminFetch(`/collection/${id}`);

export const adminCreateCollectionTile = (data: {
  blockIndex: number;
  slotPosition: "BOX_1" | "BOX_2" | "BOX_3" | "BOX_4";
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive?: boolean;
  sortOrder?: number;
}) => adminFetch("/collection", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateCollectionTile = (
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
) => adminFetch(`/collection/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteCollectionTile = (id: string) =>
  adminFetch(`/collection/${id}`, { method: "DELETE" });

// ==========================================
// CUSTOMERS & USERS MODULE
// ==========================================

export type CustomerSegment = "ALL" | "PROSPECT" | "FIRST_TIME_BUYER" | "REPEAT_BUYER" | "VIP";

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  type: string;
  createdAt: string;
  totalOrders: number;
  qualifyingOrders: number;
  collectedOnlineTotal: number;
  deliveredCodTotal: number;
  inFlightCodTotal: number;
  cancelledOrdersCount: number;
  cancelledOrdersTotal: number;
  totalQualifyingSpend: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  segment: CustomerSegment;
}

export interface AdminCustomerStats {
  totalCustomers: number;
  totalProspects: number;
  totalActiveBuyers: number;
  totalRepeatBuyers: number;
  totalVipCustomers: number;
}

export interface AdminCustomerProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminCustomerFinancialSummary {
  totalOrders: number;
  qualifyingOrders: number;
  cancelledOrders: number;
  collectedOnlineTotal: number;
  deliveredCodTotal: number;
  inFlightCodTotal: number;
  totalQualifyingSpend: number;
  cancelledOrdersTotal: number;
  averageOrderValue: number;
  preferredPaymentMethod: "COD" | "ONLINE_RAZORPAY" | "NONE";
  segment: CustomerSegment;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
  refundNote: string;
}

export interface AdminCustomerAddress {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AdminCustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  paymentMethod: "COD" | "ONLINE_RAZORPAY";
  paymentStatus: string;
  shippingCity: string | null;
  shippingState: string | null;
}

export interface AdminCustomerDetail {
  profile: AdminCustomerProfile;
  financialSummary: AdminCustomerFinancialSummary;
  savedAddresses: AdminCustomerAddress[];
  recentOrders: AdminCustomerOrderSummary[];
}

export interface PagedCustomerResponse {
  content: AdminCustomerSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const adminFetchCustomers = (
  search?: string,
  segment?: string,
  page: number = 0,
  size: number = 20,
  sortBy: string = "createdAt",
  sortDir: string = "desc"
) => {
  let url = `/customers?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  if (segment && segment !== "ALL") {
    url += `&segment=${encodeURIComponent(segment)}`;
  }
  return adminFetch(url, { cache: "no-store" });
};

export const adminFetchCustomerStats = () => {
  return adminFetch("/customers/stats", { cache: "no-store" });
};

export const adminFetchCustomerDetails = (id: string) => {
  return adminFetch(`/customers/${id}`);
};

export const adminFetchCustomerOrders = (id: string) => {
  return adminFetch(`/customers/${id}/orders`);
};


