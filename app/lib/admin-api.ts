export const ADMIN_API_BASE_URL = "http://localhost:8080/api/v1/admin";

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

export const adminFetchCategories = () => adminFetch("/categories");

export const adminCreateCategory = (data: any) => 
  adminFetch("/categories", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateCategory = (id: string, data: any) => 
  adminFetch(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const adminUploadImage = async (file: File) => {
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

    if (!response.ok) {
        throw new Error("Failed to upload image");
    }
    const data = await response.json();
    return data.data; // URL string
};
