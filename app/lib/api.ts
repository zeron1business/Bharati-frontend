import { ApiResponse, PagedResponse, ProductCard, ProductDetail, Category } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch categories');
    const json: ApiResponse<Category[]> = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchProducts(categorySlug?: string): Promise<ProductCard[]> {
  try {
    const url = new URL(`${API_BASE_URL}/products`);
    url.searchParams.append('size', '100'); // Fetch all for now
    if (categorySlug) {
      url.searchParams.append('categorySlug', categorySlug);
    }
    
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch products');
    const json: ApiResponse<PagedResponse<ProductCard>> = await res.json();
    return json.data.content;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch product: ${slug}`);
    const json: ApiResponse<ProductDetail> = await res.json();
    return json.data;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}
