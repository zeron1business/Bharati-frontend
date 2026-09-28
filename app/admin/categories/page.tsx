"use client";

import { useEffect, useState } from "react";
import { adminFetchCategories } from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, CACHE_KEYS } from "@/app/lib/cache";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>(() => {
    return getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES) || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
  });
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("syncing");

  const fetchCategories = async (forceRefresh = false) => {
    if (!forceRefresh && categories.length === 0) {
      const cached = getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
      if (cached) {
        setCategories(cached);
        setIsLoading(false);
      }
    }

    setSyncStatus("syncing");
    if (categories.length === 0 && !getSessionCache(CACHE_KEYS.ADMIN_CATEGORIES)) {
      setIsLoading(true);
    }

    try {
      const response = await adminFetchCategories();
      setCategories(response.data);
      setSessionCache(CACHE_KEYS.ADMIN_CATEGORIES, response.data);
      setSyncStatus("synced");
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setSyncStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light text-bharati-black tracking-wide">Categories</h1>
          {syncStatus === "syncing" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Syncing...
            </span>
          )}
          {syncStatus === "synced" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synced
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCategories(true)}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-bharati-mist text-bharati-charcoal hover:bg-bharati-cream transition-colors text-sm font-medium disabled:opacity-50"
            title="Refresh categories list"
          >
            <RefreshCw size={16} className={syncStatus === "syncing" ? "animate-spin text-bharati-mint-dark" : "text-bharati-charcoal"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link href="/admin/categories/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Category
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bharati-cream text-bharati-charcoal font-medium">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Sort Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bharati-mist">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-bharati-ash">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-bharati-ash">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-bharati-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-bharati-cream rounded overflow-hidden relative shrink-0">
                          {category.imageUrl ? (
                            <Image 
                              src={category.imageUrl} 
                              alt={category.name} 
                              fill 
                              unoptimized
                              className="object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-bharati-mist" />
                          )}
                        </div>
                        <div className="font-medium text-bharati-black">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-bharati-charcoal">{category.slug}</td>
                    <td className="px-6 py-4 text-bharati-charcoal max-w-xs truncate">{category.description}</td>
                    <td className="px-6 py-4 text-bharati-charcoal">{category.sortOrder}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
