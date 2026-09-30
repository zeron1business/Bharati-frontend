"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchCategories, adminDeleteCategory, adminReactivateCategory } from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import Link from "next/link";
import { Plus, RefreshCw, Edit2, Trash2, AlertTriangle, X, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/app/admin/ToastContext";

export default function AdminCategories() {
  const { showToast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(() => {
    return getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES) || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
  });
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("syncing");

  // Delete modal states — same pattern as Products page
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Reactivate modal states
  const [categoryToReactivate, setCategoryToReactivate] = useState<any | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState("");

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

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    if (deleteConfirmText.trim().toLowerCase() !== "confirm") {
      setDeleteError("Please type 'confirm' to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await adminDeleteCategory(categoryToDelete.id);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_CATEGORIES);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_CATEGORIES);

      showToast(`Category "${categoryToDelete.name}" deactivated successfully.`, "success");

      setCategoryToDelete(null);
      setDeleteConfirmText("");
      await fetchCategories(true);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to deactivate category. Please try again.");
      showToast(err.message || "Failed to deactivate category. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivateCategory = async () => {
    if (!categoryToReactivate) return;

    setIsReactivating(true);
    setReactivateError("");

    try {
      await adminReactivateCategory(categoryToReactivate.id);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_CATEGORIES);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_CATEGORIES);

      showToast(`Category "${categoryToReactivate.name}" reactivated. Review subcategory states if needed.`, "success");

      setCategoryToReactivate(null);
      await fetchCategories(true);
    } catch (err: any) {
      setReactivateError(err.message || "Failed to reactivate category. Please try again.");
      showToast(err.message || "Failed to reactivate category. Please try again.", "error");
    } finally {
      setIsReactivating(false);
    }
  };

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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bharati-mist">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-bharati-cream/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/categories/${category.id}`)}>
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
                    <td className="px-6 py-4">
                      {category.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="inline-flex items-center text-bharati-ash hover:text-bharati-black transition-colors p-2 rounded hover:bg-bharati-cream"
                            title="Edit category"
                          >
                            <Edit2 size={16} />
                          </Link>
                        </div>
                        {category.isActive !== false ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToDelete(category);
                              setDeleteConfirmText("");
                              setDeleteError("");
                            }}
                            className="inline-flex items-center text-bharati-ash hover:text-red-600 transition-colors p-2 rounded hover:bg-red-50"
                            title="Deactivate category"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToReactivate(category);
                              setReactivateError("");
                            }}
                            className="inline-flex items-center text-bharati-ash hover:text-emerald-600 transition-colors p-2 rounded hover:bg-emerald-50"
                            title="Reactivate category"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal — reuses exact same pattern as Product Delete modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-bharati-mist space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-bharati-black">Deactivate Category</h3>
                  <p className="text-xs text-bharati-ash">Soft Delete — Catalog Action</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="text-bharati-ash hover:text-bharati-black p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-bharati-cream/60 p-3 rounded-lg border border-bharati-mist/60 text-sm space-y-1">
              <div className="font-semibold text-bharati-black">{categoryToDelete.name}</div>
              <div className="text-xs text-bharati-ash font-mono">Slug: {categoryToDelete.slug}</div>
            </div>

            <p className="text-sm text-bharati-charcoal leading-relaxed">
              This will remove the category and its subcategories from active catalog listings. Existing products, orders, and historical data will remain intact and unaffected.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-bharati-charcoal uppercase tracking-wider">
                Type <span className="font-bold text-red-600 font-mono">confirm</span> to execute:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError("");
                }}
                placeholder="confirm"
                disabled={isDeleting}
                className="w-full px-3 py-2 border border-bharati-mist rounded-md font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-colors"
                autoFocus
              />
            </div>

            {deleteError && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-100 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-bharati-charcoal hover:bg-bharati-cream border border-bharati-mist rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleteConfirmText.trim().toLowerCase() !== "confirm" || isDeleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deactivating...</span>
                  </>
                ) : (
                  <span>Deactivate Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {categoryToReactivate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-bharati-mist space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-bharati-black">Reactivate Category</h3>
                  <p className="text-xs text-bharati-ash">Restore — Catalog Action</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCategoryToReactivate(null);
                  setReactivateError("");
                }}
                disabled={isReactivating}
                className="text-bharati-ash hover:text-bharati-black p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-bharati-cream/60 p-3 rounded-lg border border-bharati-mist/60 text-sm space-y-1">
              <div className="font-semibold text-bharati-black">{categoryToReactivate.name}</div>
              <div className="text-xs text-bharati-ash font-mono">Slug: {categoryToReactivate.slug}</div>
            </div>

            <p className="text-sm text-bharati-charcoal leading-relaxed">
              This will restore the category to active catalog listings. Subcategories will not be automatically reactivated — review their states in Edit Category if needed.
            </p>

            {reactivateError && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-100 font-medium">
                {reactivateError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryToReactivate(null);
                  setReactivateError("");
                }}
                disabled={isReactivating}
                className="px-4 py-2 text-sm text-bharati-charcoal hover:bg-bharati-cream border border-bharati-mist rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReactivateCategory}
                disabled={isReactivating}
                className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isReactivating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Reactivating...</span>
                  </>
                ) : (
                  <span>Reactivate Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
