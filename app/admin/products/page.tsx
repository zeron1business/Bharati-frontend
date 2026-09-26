"use client";

import { useEffect, useState } from "react";
import { adminFetchProducts } from "@/app/lib/admin-api";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Edit2 } from "lucide-react";

// We'll map it out from the API response

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetchProducts(page, search);
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light text-bharati-black tracking-wide">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
        <div className="p-4 border-b border-bharati-mist">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bharati-ash" size={18} />
              <input
                type="text"
                placeholder="Search products by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-bharati-mist rounded-md focus:outline-none focus:border-bharati-black transition-colors"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-bharati-charcoal text-white rounded-md hover:bg-bharati-black transition-colors">
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bharati-cream text-bharati-charcoal font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bharati-mist">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                  const variantCount = product.variants ? product.variants.length : 0;
                  const totalStock = product.variants ? product.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) : 0;
                  const displayPrice = firstVariant ? (firstVariant.discountedPrice || firstVariant.basePrice) : null;
                  const displayBasePrice = firstVariant ? firstVariant.basePrice : null;
                  
                  return (
                  <tr key={product.id} className="hover:bg-bharati-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-bharati-cream rounded overflow-hidden relative shrink-0">
                          {product.media && product.media.length > 0 ? (
                            <Image 
                              src={product.media.find((m: any) => m.isPrimary)?.url || product.media[0].url} 
                              alt={product.name} 
                              fill 
                              className="object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-bharati-mist" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-bharati-black">{product.name}</div>
                          <div className="text-xs text-bharati-ash mt-0.5">
                            {variantCount > 0 ? `${variantCount} variant${variantCount > 1 ? 's' : ''}` : 'No variants'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-bharati-charcoal">
                      {product.subcategory?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 text-bharati-charcoal">
                      {displayPrice ? (
                        <>
                          ₹{displayPrice}
                          {displayBasePrice && displayBasePrice > displayPrice && (
                            <span className="text-bharati-ash line-through ml-2 text-xs">₹{displayBasePrice}</span>
                          )}
                          {variantCount > 1 && <span className="text-bharati-ash ml-1 text-xs">+</span>}
                        </>
                      ) : (
                        <span className="text-bharati-ash text-xs">No price set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        totalStock > 10 ? 'bg-green-100 text-green-800' :
                        totalStock > 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {totalStock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 text-bharati-ash hover:text-bharati-black transition-colors p-2"
                      >
                        <Edit2 size={16} />
                      </Link>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-bharati-mist flex items-center justify-between">
            <span className="text-sm text-bharati-ash">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-bharati-mist rounded text-sm disabled:opacity-50 hover:bg-bharati-cream transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-bharati-mist rounded text-sm disabled:opacity-50 hover:bg-bharati-cream transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
