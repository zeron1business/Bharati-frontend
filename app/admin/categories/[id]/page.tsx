"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
  Package,
  Layers,
  AlertCircle,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import {
  adminFetchCategoryDetails,
  adminDeleteCategory,
  adminReactivateCategory,
} from "@/app/lib/admin-api";
import { clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import { useToast } from "@/app/admin/ToastContext";

interface AdminSubcategoryDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

interface AdminCategoryDetails {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  subcategories: AdminSubcategoryDetail[];
  totalProductCount: number;
  activeProductCount: number;
  totalSubcategoryCount: number;
  activeSubcategoryCount: number;
}

export default function AdminCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;

  const { showToast } = useToast();
  const [category, setCategory] = useState<AdminCategoryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Deactivate modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Reactivate modal states
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState("");

  const loadCategoryDetails = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError("");

    try {
      const res = await adminFetchCategoryDetails(categoryId);
      setCategory(res.data);
    } catch (err: any) {
      console.error("Failed to load category details:", err);
      setError(err.message || "Failed to load category details.");
      showToast(err.message || "Failed to load category details.", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadCategoryDetails();
    }
  }, [categoryId]);

  const handleDeactivate = async () => {
    if (!category) return;
    if (deleteConfirmText.trim().toLowerCase() !== "confirm") {
      setDeleteError("Please type 'confirm' to confirm deactivation.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await adminDeleteCategory(category.id);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_CATEGORIES);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_CATEGORIES);

      showToast(
        `Category "${category.name}" deactivated successfully.`,
        "success"
      );

      setShowDeactivateModal(false);
      setDeleteConfirmText("");
      await loadCategoryDetails();
    } catch (err: any) {
      setDeleteError(
        err.message || "Failed to deactivate category. Please try again."
      );
      showToast(
        err.message || "Failed to deactivate category. Please try again.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async () => {
    if (!category) return;

    setIsReactivating(true);
    setReactivateError("");

    try {
      await adminReactivateCategory(category.id);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_CATEGORIES);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_CATEGORIES);

      showToast(
        `Category "${category.name}" reactivated. Review subcategory states if needed.`,
        "success"
      );

      setShowReactivateModal(false);
      await loadCategoryDetails();
    } catch (err: any) {
      setReactivateError(
        err.message || "Failed to reactivate category. Please try again."
      );
      showToast(
        err.message || "Failed to reactivate category. Please try again.",
        "error"
      );
    } finally {
      setIsReactivating(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={26} className="animate-spin text-bharati-mint-dark" />
        <p className="text-xs uppercase tracking-wider text-bharati-ash font-medium">
          Loading category overview...
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !category) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle size={26} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-bharati-black">
            Category Not Found
          </h2>
          <p className="text-sm text-bharati-ash leading-relaxed">
            {error ||
              "The requested category could not be located in the database."}
          </p>
          <p className="text-xs font-mono text-bharati-silver">
            ID: {categoryId}
          </p>
        </div>
        <div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              className="p-2 rounded-md hover:bg-bharati-ivory text-bharati-ash hover:text-bharati-black transition-colors"
              title="Back to Categories list"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide">
              {category.name}
            </h1>
            {category.isActive !== false ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase border bg-gray-100 text-gray-500 border-gray-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Inactive
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-bharati-ash pl-11">
            <span className="inline-flex items-center gap-1.5 font-mono">
              Slug: {category.slug}
            </span>
            <span>•</span>
            <span>Sort Order: {category.sortOrder ?? 0}</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="flex items-center gap-2 px-3.5 py-2 text-sm bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors font-medium"
          >
            <Edit2 size={15} />
            <span>Edit</span>
          </Link>

          {category.isActive !== false ? (
            <button
              onClick={() => {
                setShowDeactivateModal(true);
                setDeleteConfirmText("");
                setDeleteError("");
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Deactivate</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setShowReactivateModal(true);
                setReactivateError("");
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors font-medium"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Reactivate</span>
            </button>
          )}

          <button
            onClick={() => loadCategoryDetails(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors disabled:opacity-50"
            title="Refresh category details"
          >
            <RefreshCw
              size={15}
              className={
                isRefreshing ? "animate-spin text-bharati-mint-dark" : ""
              }
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category Information Card */}
          <div className="bg-white rounded-lg border border-bharati-mist shadow-xs overflow-hidden">
            <div className="p-5 border-b border-bharati-mist bg-bharati-cream/30 flex items-center gap-2.5">
              <Info size={18} className="text-bharati-mint-dark" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal">
                Category Information
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-5">
                {/* Category Image */}
                <div className="relative w-20 h-20 rounded-lg bg-bharati-ivory border border-bharati-mist overflow-hidden shrink-0">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      unoptimized={Boolean(
                        category.imageUrl?.startsWith("http")
                      )}
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-bharati-mist flex items-center justify-center">
                      <Layers
                        size={24}
                        className="text-bharati-ash/40"
                      />
                    </div>
                  )}
                </div>

                {/* Category Fields */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-bharati-ash block text-[11px] uppercase tracking-wider">
                      Name
                    </span>
                    <span className="font-medium text-bharati-black text-sm">
                      {category.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-bharati-ash block text-[11px] uppercase tracking-wider">
                        Slug
                      </span>
                      <span className="text-bharati-charcoal font-mono text-xs">
                        {category.slug}
                      </span>
                    </div>
                    <div>
                      <span className="text-bharati-ash block text-[11px] uppercase tracking-wider">
                        Sort Order
                      </span>
                      <span className="text-bharati-charcoal text-xs">
                        {category.sortOrder ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <div className="pt-2 border-t border-bharati-mist/60">
                  <span className="text-bharati-ash block text-[11px] uppercase tracking-wider mb-1">
                    Description
                  </span>
                  <p className="text-sm text-bharati-charcoal leading-relaxed">
                    {category.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subcategories Card */}
          <div className="bg-white rounded-lg border border-bharati-mist shadow-xs overflow-hidden">
            <div className="p-5 border-b border-bharati-mist bg-bharati-cream/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal">
                  Subcategories ({category.totalSubcategoryCount})
                </h2>
              </div>
              <span className="text-xs text-bharati-ash font-mono">
                {category.activeSubcategoryCount} active
              </span>
            </div>

            {category.subcategories.length === 0 ? (
              <div className="p-8 text-center text-sm text-bharati-ash">
                No subcategories found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bharati-cream/50 text-bharati-charcoal font-medium text-xs">
                    <tr>
                      <th className="px-5 py-3">Subcategory</th>
                      <th className="px-5 py-3">Slug</th>
                      <th className="px-5 py-3">Sort Order</th>
                      <th className="px-5 py-3">Products</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bharati-mist/60">
                    {category.subcategories.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-bharati-cream/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-bharati-cream rounded overflow-hidden relative shrink-0">
                              {sub.imageUrl ? (
                                <Image
                                  src={sub.imageUrl}
                                  alt={sub.name}
                                  fill
                                  unoptimized={Boolean(
                                    sub.imageUrl?.startsWith("http")
                                  )}
                                  className="object-cover"
                                  sizes="32px"
                                />
                              ) : (
                                <div className="w-full h-full bg-bharati-mist" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-bharati-black text-sm">
                                {sub.name}
                              </div>
                              {sub.description && (
                                <div className="text-[11px] text-bharati-ash truncate max-w-xs">
                                  {sub.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-bharati-charcoal font-mono text-xs">
                          {sub.slug}
                        </td>
                        <td className="px-5 py-3.5 text-bharati-charcoal text-xs">
                          {sub.sortOrder ?? 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-bharati-charcoal font-medium">
                            <Package size={13} className="text-bharati-ash" />
                            {sub.productCount}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {sub.isActive !== false ? (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Product Statistics Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-bharati-mist/60 text-bharati-charcoal">
              <Package size={17} className="text-bharati-mint-dark" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Product Statistics
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-bharati-ash">
                  Total Products
                </span>
                <span className="text-lg font-bold text-bharati-black">
                  {category.totalProductCount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-bharati-ash">
                  Active Products
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  {category.activeProductCount}
                </span>
              </div>

              {category.totalProductCount > 0 &&
                category.totalProductCount !== category.activeProductCount && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-bharati-ash">
                      Inactive Products
                    </span>
                    <span className="text-sm font-medium text-bharati-ash">
                      {category.totalProductCount -
                        category.activeProductCount}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Subcategory Statistics Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-bharati-mist/60 text-bharati-charcoal">
              <Layers size={17} className="text-bharati-mint-dark" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Subcategory Statistics
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-bharati-ash">
                  Total Subcategories
                </span>
                <span className="text-lg font-bold text-bharati-black">
                  {category.totalSubcategoryCount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-bharati-ash">
                  Active Subcategories
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  {category.activeSubcategoryCount}
                </span>
              </div>

              {category.totalSubcategoryCount > 0 &&
                category.totalSubcategoryCount !==
                  category.activeSubcategoryCount && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-bharati-ash">
                      Inactive Subcategories
                    </span>
                    <span className="text-sm font-medium text-bharati-ash">
                      {category.totalSubcategoryCount -
                        category.activeSubcategoryCount}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Category Status Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60">
              Category Status
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-bharati-ash">Status</span>
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
              </div>

              <div className="flex justify-between items-center">
                <span className="text-bharati-ash">Image</span>
                <span className="text-bharati-charcoal font-medium">
                  {category.imageUrl ? "Configured" : "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal — reuses exact same pattern as Categories list page */}
      {showDeactivateModal && category && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-bharati-mist space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-bharati-black">
                    Deactivate Category
                  </h3>
                  <p className="text-xs text-bharati-ash">
                    Soft Delete — Catalog Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
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
              <div className="font-semibold text-bharati-black">
                {category.name}
              </div>
              <div className="text-xs text-bharati-ash font-mono">
                Slug: {category.slug}
              </div>
            </div>

            <p className="text-sm text-bharati-charcoal leading-relaxed">
              This will remove the category and its subcategories from active
              catalog listings. Existing products, orders, and historical data
              will remain intact and unaffected.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-bharati-charcoal uppercase tracking-wider">
                Type{" "}
                <span className="font-bold text-red-600 font-mono">
                  confirm
                </span>{" "}
                to execute:
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
                  setShowDeactivateModal(false);
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
                onClick={handleDeactivate}
                disabled={
                  deleteConfirmText.trim().toLowerCase() !== "confirm" ||
                  isDeleting
                }
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

      {/* Reactivate Confirmation Modal — reuses exact same pattern as Categories list page */}
      {showReactivateModal && category && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-bharati-mist space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-bharati-black">
                    Reactivate Category
                  </h3>
                  <p className="text-xs text-bharati-ash">
                    Restore — Catalog Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReactivateModal(false);
                  setReactivateError("");
                }}
                disabled={isReactivating}
                className="text-bharati-ash hover:text-bharati-black p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-bharati-cream/60 p-3 rounded-lg border border-bharati-mist/60 text-sm space-y-1">
              <div className="font-semibold text-bharati-black">
                {category.name}
              </div>
              <div className="text-xs text-bharati-ash font-mono">
                Slug: {category.slug}
              </div>
            </div>

            <p className="text-sm text-bharati-charcoal leading-relaxed">
              This will restore the category to active catalog listings.
              Subcategories will not be automatically reactivated — review their
              states in Edit Category if needed.
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
                  setShowReactivateModal(false);
                  setReactivateError("");
                }}
                disabled={isReactivating}
                className="px-4 py-2 text-sm text-bharati-charcoal hover:bg-bharati-cream border border-bharati-mist rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReactivate}
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
