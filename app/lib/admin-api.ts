export const ADMIN_API_BASE_URL = "http://localhost:8081/api/v1/admin";

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
        localStorage.removeItem("bharati_admin_token");
        window.location.href = "/admin/login";
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
    if (search) url += `&search=${search}`;
    return adminFetch(url);
};

export const adminFetchProduct = (id: string) => adminFetch(`/products/${id}`);

export const adminCreateProduct = (data: any) => 
  adminFetch("/products", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateProduct = (id: string, data: any) => 
  adminFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminDeleteProduct = (id: string) => 
  adminFetch(`/products/${id}`, { method: "DELETE" });

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

