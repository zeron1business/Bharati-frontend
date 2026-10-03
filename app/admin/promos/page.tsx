"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  adminFetchPromos, 
  adminCreatePromo, 
  adminUpdatePromo, 
  adminDeletePromo 
} from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import { Ticket, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, RefreshCw, X, Copy } from "lucide-react";
import { useToast } from "@/app/admin/ToastContext";

export default function AdminPromosPage() {
  const { showToast } = useToast();
  
  const [promos, setPromos] = useState<any[]>(() => {
    return getSessionCache<any[]>(CACHE_KEYS.ADMIN_PROMOS) || [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !getSessionCache<any[]>(CACHE_KEYS.ADMIN_PROMOS);
  });
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("syncing");
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountCap: "",
    usageLimit: "",
    expiryDate: "",
    isActive: true,
    displayInHero: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const loadPromos = async (forceRefresh = false) => {
    if (!forceRefresh && promos.length === 0) {
      const cached = getSessionCache<any[]>(CACHE_KEYS.ADMIN_PROMOS);
      if (cached) {
        setPromos(cached);
        setLoading(false);
      }
    }

    setSyncStatus("syncing");
    if (promos.length === 0 && !getSessionCache(CACHE_KEYS.ADMIN_PROMOS)) {
      setLoading(true);
    }

    try {
      const res = await adminFetchPromos();
      setPromos(res.data);
      setSessionCache(CACHE_KEYS.ADMIN_PROMOS, res.data);
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("Failed to load promos:", err);
      showToast(err.message || "Failed to load promos", "error");
      setSyncStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos(true);
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedPromo(null);
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderValue: "",
      maxDiscountCap: "",
      usageLimit: "",
      expiryDate: "",
      isActive: true,
      displayInHero: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (promo: any) => {
    setModalMode("edit");
    setSelectedPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || "",
      discountType: promo.discountType,
      discountValue: promo.discountValue?.toString() || "",
      minOrderValue: promo.minOrderValue?.toString() || "",
      maxDiscountCap: promo.maxDiscountCap?.toString() || "",
      usageLimit: promo.usageLimit?.toString() || "",
      expiryDate: promo.expiryDate ? promo.expiryDate.substring(0, 16) : "",
      isActive: promo.isActive,
      displayInHero: promo.displayInHero
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up empty strings to null for backend
    const payload: any = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discountValue: parseFloat(formData.discountValue),
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      maxDiscountCap: formData.maxDiscountCap ? parseFloat(formData.maxDiscountCap) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
    };

    try {
      if (modalMode === "create") {
        await adminCreatePromo(payload);
        showToast("Promo code created successfully", "success");
      } else {
        await adminUpdatePromo(selectedPromo.id, payload);
        showToast("Promo code updated successfully", "success");
      }
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PROMOS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PROMOS);
      setShowModal(false);
      await loadPromos(true);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      const updated = promos.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p);
      setPromos(updated);
      setSessionCache(CACHE_KEYS.ADMIN_PROMOS, updated);

      await adminUpdatePromo(id, { isActive: !currentStatus });
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PROMOS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PROMOS);
      showToast(`Promo ${!currentStatus ? 'activated' : 'deactivated'}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to toggle status", "error");
      await loadPromos(true);
    }
  };

  const handleToggleHero = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      const updated = promos.map(p => p.id === id ? { ...p, displayInHero: !currentStatus } : p);
      setPromos(updated);
      setSessionCache(CACHE_KEYS.ADMIN_PROMOS, updated);

      await adminUpdatePromo(id, { displayInHero: !currentStatus });
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PROMOS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PROMOS);
      showToast(`Top banner display ${!currentStatus ? 'enabled' : 'disabled'}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to toggle top banner display", "error");
      await loadPromos(true);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText.trim() !== selectedPromo.code) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await adminDeletePromo(selectedPromo.id);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PROMOS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PROMOS);
      showToast("Promo code deleted", "success");
      setShowDeleteModal(false);
      await loadPromos(true);
    } catch (err: any) {
      showToast(err.message || "Failed to delete promo", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide flex items-center gap-3">
              <Ticket className="text-bharati-charcoal" />
              Promo Codes
            </h1>
            <p className="text-bharati-ash text-sm mt-1">Manage discount vouchers and top scrolling promos.</p>
          </div>
          {syncStatus === "syncing" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Syncing...
            </span>
          )}
          {syncStatus === "synced" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 transition-all duration-300 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synced
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPromos(true)}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-bharati-mist text-bharati-charcoal hover:bg-bharati-cream transition-colors text-sm font-medium disabled:opacity-50"
            title="Refresh promos list"
          >
            <RefreshCw size={16} className={syncStatus === "syncing" ? "animate-spin text-bharati-mint-dark" : "text-bharati-charcoal"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-bharati-charcoal text-white rounded-md hover:bg-bharati-black transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> Add Promo
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-bharati-mist flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bharati-ash" size={18} />
          <input
            type="text"
            placeholder="Search promos by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-bharati-mist rounded-md focus:outline-none focus:border-bharati-black transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bharati-cream text-bharati-charcoal font-medium">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Top Banner</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bharati-mist">
              {loading && promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    Loading promo codes...
                  </td>
                </tr>
              ) : filteredPromos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-bharati-ash">
                    No promo codes found.
                  </td>
                </tr>
              ) : (
                filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-bharati-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-bharati-black tracking-wider">{promo.code}</div>
                      {promo.description && <div className="text-xs text-bharati-ash mt-0.5 truncate max-w-[200px]">{promo.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-bharati-charcoal">
                        {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                      </div>
                      <div className="text-[10px] text-bharati-ash mt-1 space-y-0.5">
                        {promo.minOrderValue && <div>Min: ₹{promo.minOrderValue}</div>}
                        {promo.maxDiscountCap && promo.discountType === 'PERCENTAGE' && <div>Cap: ₹{promo.maxDiscountCap}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-bharati-charcoal">
                        {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : 'uses'}
                      </div>
                      {promo.expiryDate && (
                        <div className={`text-[10px] mt-1 ${new Date(promo.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-bharati-ash'}`}>
                          Exp: {new Date(promo.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={promo.isActive}
                          onChange={() => handleToggleActive(promo.id, promo.isActive)}
                        />
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bharati-charcoal"></div>
                        <span className="ms-3 text-xs font-medium text-bharati-charcoal">
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={promo.displayInHero}
                          onChange={() => handleToggleHero(promo.id, promo.displayInHero)}
                        />
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bharati-charcoal"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(promo)}
                          className="p-2 text-bharati-ash hover:text-bharati-black transition-colors rounded hover:bg-bharati-cream"
                          title="Edit promo"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPromo(promo);
                            setDeleteConfirmText("");
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-bharati-ash hover:text-red-600 transition-colors rounded hover:bg-red-50"
                          title="Delete promo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bharati-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-bharati-mist flex justify-between items-center bg-bharati-cream/30 rounded-t-xl">
              <h2 className="text-lg font-medium text-bharati-black">
                {modalMode === "create" ? "Create Promo Code" : "Edit Promo Code"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-bharati-ash hover:text-bharati-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="promoForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">Promo Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="e.g. SUMMER2026"
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black uppercase font-bold tracking-wider"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">
                      Banner Announcement Text / Headline
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="e.g. FLAT 25% OFF ON ALL PRESSURE COOKERS, or FLAT ₹200 OFF ON ORDERS ABOVE ₹1500"
                      rows={2}
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black"
                    />
                    <p className="text-xs text-bharati-ash mt-1">
                      This headline text is displayed on the top scrolling announcement banner.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black bg-white"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">
                      Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                      max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      placeholder={formData.discountType === 'PERCENTAGE' ? "e.g. 15" : "e.g. 500"}
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">Min Order Value (₹) (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                      placeholder="e.g. 2000"
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">
                      Max Discount Cap (₹) {formData.discountType === 'FIXED' ? '(N/A)' : '(Optional)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={formData.discountType === 'FIXED'}
                      value={formData.discountType === 'FIXED' ? "" : formData.maxDiscountCap}
                      onChange={(e) => setFormData({...formData, maxDiscountCap: e.target.value})}
                      placeholder="e.g. 1000"
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">Usage Limit (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      placeholder="e.g. 100 (Total allowed uses)"
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bharati-charcoal mb-1">Expiry Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-bharati-mist space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-bharati-charcoal border-gray-300 rounded focus:ring-bharati-charcoal"
                      />
                      <div>
                        <span className="block text-sm font-medium text-bharati-black">Active</span>
                        <span className="block text-xs text-bharati-ash">Can this promo code be used at checkout?</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.displayInHero}
                        onChange={(e) => setFormData({...formData, displayInHero: e.target.checked})}
                        className="w-4 h-4 text-bharati-charcoal border-gray-300 rounded focus:ring-bharati-charcoal"
                      />
                      <div>
                        <span className="block text-sm font-medium text-bharati-black">Display in Top Banner</span>
                        <span className="block text-xs text-bharati-ash">Should this promo scroll across the top of the website?</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-bharati-mist flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-bharati-mist rounded-md text-bharati-charcoal hover:bg-bharati-cream transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="promoForm"
                disabled={isSubmitting}
                className="px-6 py-2 bg-bharati-charcoal text-white rounded-md hover:bg-bharati-black transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {modalMode === "create" ? "Create Promo" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPromo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bharati-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-medium text-bharati-black">Delete Promo Code?</h3>
            <p className="text-sm text-bharati-ash">
              This action cannot be undone. To confirm deletion, type the promo code <strong className="text-bharati-black">{selectedPromo.code}</strong> below.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={selectedPromo.code}
              className="w-full p-3 border border-bharati-mist rounded-md text-center font-bold uppercase tracking-wider focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-bharati-mist rounded-md text-bharati-charcoal hover:bg-bharati-cream transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || deleteConfirmText.trim() !== selectedPromo.code}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
