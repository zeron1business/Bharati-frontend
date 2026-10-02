"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  adminFetchProduct, 
  adminUpdateProduct, 
  adminFetchCategories, 
  adminFetchSubcategories, 
  adminUploadImage, 
  adminUploadImages,
  adminCheckSlug,
  adminCheckSku 
} from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Trash2, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import React from "react";
import { useToast, setFlashToast } from "@/app/admin/ToastContext";

export default function EditProduct({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params as any) as any;
  const id = unwrappedParams.id;
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [currentSubcategoryName, setCurrentSubcategoryName] = useState("");
  
  // Real-time validation states
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [skuErrors, setSkuErrors] = useState<{ [key: number]: string }>({});
  
  // Variant deletion modal state
  const [variantToDeleteIndex, setVariantToDeleteIndex] = useState<number | null>(null);
  const [variantDeleteConfirmText, setVariantDeleteConfirmText] = useState("");
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [warrantyPreset, setWarrantyPreset] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    subcategoryId: "",
    badges: "[]",
    isActive: true,
    isFeatured: false,
    sortOrder: "0",
    warrantyDuration: "",
    warrantyDetails: "",
  });

  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    const loadEditData = async () => {
      try {
        const cachedCategories = getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
        if (cachedCategories && cachedCategories.length > 0) {
          setCategories(cachedCategories);
        }

        const [categoriesRes, productRes] = await Promise.all([
          adminFetchCategories(),
          adminFetchProduct(id)
        ]);
        
        setCategories(categoriesRes.data);
        setSessionCache(CACHE_KEYS.ADMIN_CATEGORIES, categoriesRes.data);
        
        const p = productRes.data;
        const mUrls = (p.media || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        setCoverImageUrl(mUrls[0]?.url || "");
        setCurrentSubcategoryName(p.subcategory?.name || "");

        if (p.subcategory?.categoryId) {
          setSelectedCategory(p.subcategory.categoryId);
        }

        setFormData({
            name: p.name || p.title || "",
            slug: p.slug || "",
            tagline: p.tagline || "",
            description: p.description || "",
            subcategoryId: p.subcategory?.id || "",
            badges: p.badges ? JSON.stringify(p.badges) : "[]",
            isActive: p.isActive,
            isFeatured: p.isFeatured,
            sortOrder: String(p.sortOrder ?? 0),
            warrantyDuration: p.warrantyDuration || "",
            warrantyDetails: p.warrantyDetails || "",
        });
        
        if (p.warrantyDuration) {
            const presets = ["6 months", "1 year", "2 years", "5 years", "Lifetime"];
            if (presets.includes(p.warrantyDuration)) {
                setWarrantyPreset(p.warrantyDuration);
            } else {
                setWarrantyPreset("Custom");
            }
        }

        if (p.variants && p.variants.length > 0) {
            setVariants(p.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku || "",
                basePrice: v.basePrice?.toString() || "0",
                discountedPrice: v.discountedPrice?.toString() || "0",
                stockQuantity: v.stockQuantity?.toString() || "0",
                volumeLitres: v.volumeLitres?.toString() || "",
                materialType: v.materialType || "",
                inductionCompatible: v.inductionCompatible || false,
                warrantyOverride: v.warrantyOverride || "",
                isActive: v.isActive !== undefined ? v.isActive : true,
                mediaUrls: v.mediaUrls || (v.media ? v.media.map((m: any) => m.url) : []),
                specifications: v.specifications || []
            })));
        } else {
            setVariants([{
                sku: p.sku || "",
                basePrice: p.basePrice?.toString() || "0",
                discountedPrice: p.discountedPrice?.toString() || "0",
                stockQuantity: p.stockQuantity?.toString() || "0",
                volumeLitres: "",
                materialType: "",
                inductionCompatible: false,
                warrantyOverride: "",
                isActive: true,
                mediaUrls: [],
                specifications: []
            }]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product details. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) loadEditData();
  }, [id]);


  useEffect(() => {
    if (selectedCategory) {
      const fetchSubs = async () => {
        try {
          const response = await adminFetchSubcategories(selectedCategory);
          setSubcategories(response.data);
        } catch (err) {
          console.error("Failed to load subcategories:", err);
        }
      };
      fetchSubs();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  // Real-time debounce check for slug (excluding current product)
  useEffect(() => {
    const slug = formData.slug?.trim().toLowerCase();
    if (!slug) {
      setSlugError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const exists = await adminCheckSlug(slug, id);
        if (exists) {
          setSlugError("Duplicate value exists: This slug is already in use by another product.");
        } else {
          setSlugError(null);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsCheckingSlug(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [formData.slug, id]);

  // Real-time debounce check for variant SKUs
  useEffect(() => {
    const timer = setTimeout(async () => {
      const newSkuErrors: { [key: number]: string } = {};
      const skuMap = new Map<string, number>();

      for (let i = 0; i < variants.length; i++) {
        const rawSku = variants[i].sku?.trim();
        if (!rawSku) continue;
        const normalizedSku = rawSku.toUpperCase();

        if (skuMap.has(normalizedSku)) {
          newSkuErrors[i] = "Duplicate value exists: SKU is repeated across variants.";
          const firstIdx = skuMap.get(normalizedSku)!;
          newSkuErrors[firstIdx] = "Duplicate value exists: SKU is repeated across variants.";
        } else {
          skuMap.set(normalizedSku, i);
        }
      }

      for (let i = 0; i < variants.length; i++) {
        if (newSkuErrors[i]) continue;
        const sku = variants[i].sku?.trim();
        if (!sku) continue;

        try {
          const exists = await adminCheckSku(sku, variants[i].id);
          if (exists) {
            newSkuErrors[i] = "Duplicate value exists: SKU is already assigned in the catalog.";
          }
        } catch (e) {
          // ignore
        }
      }

      setSkuErrors(newSkuErrors);
    }, 350);

    return () => clearTimeout(timer);
  }, [variants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleWarrantyPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setWarrantyPreset(val);
    if (val !== "Custom") {
      setFormData(prev => ({ ...prev, warrantyDuration: val }));
    } else {
      setFormData(prev => ({ ...prev, warrantyDuration: "" }));
    }
  };

  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newVariants = [...variants];
    if (type === "checkbox") {
      newVariants[index][name] = (e.target as HTMLInputElement).checked;
    } else {
      newVariants[index][name] = value;
    }
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, {
      sku: "",
      basePrice: "",
      discountedPrice: "",
      stockQuantity: "",
      volumeLitres: "",
      materialType: "",
      inductionCompatible: false,
      warrantyOverride: "",
      isActive: true,
      mediaUrls: [],
      specifications: []
    }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleConfirmDeleteVariant = () => {
    if (variantToDeleteIndex !== null && variantDeleteConfirmText.trim().toLowerCase() === "confirm") {
      removeVariant(variantToDeleteIndex);
      setVariantToDeleteIndex(null);
      setVariantDeleteConfirmText("");
      showToast("Successfully deleted variant", "success");
    }
  };

  const handleSpecChange = (variantIndex: number, specIndex: number, field: 'specKey' | 'specValue', value: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex].specifications[specIndex][field] = value;
    setVariants(newVariants);
  };

  const addSpec = (variantIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].specifications.push({ specKey: "", specValue: "", sortOrder: newVariants[variantIndex].specifications.length });
    setVariants(newVariants);
  };

  const removeSpec = (variantIndex: number, specIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].specifications = newVariants[variantIndex].specifications.filter((_: any, i: number) => i !== specIndex);
    newVariants[variantIndex].specifications.forEach((spec: any, i: number) => spec.sortOrder = i);
    setVariants(newVariants);
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setError("");
    try {
        const url = await adminUploadImage(e.target.files[0]);
        setCoverImageUrl(url);
    } catch (err: any) {
        setError(err.message || "Failed to upload image");
    } finally {
        setIsUploading(false);
        e.target.value = "";
    }
  };

  const handleVariantImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setUploadingVariantIndex(variantIndex);
    setError("");
    try {
      const urls = await adminUploadImages(files);
      const newVariants = [...variants];
      const existingUrls = newVariants[variantIndex].mediaUrls || [];
      newVariants[variantIndex].mediaUrls = [...existingUrls, ...urls];
      setVariants(newVariants);
    } catch (err: any) {
      setError(err.message || "Failed to upload variant image(s)");
    } finally {
      setUploadingVariantIndex(null);
      e.target.value = "";
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].mediaUrls = (newVariants[variantIndex].mediaUrls || []).filter((_: any, i: number) => i !== imageIndex);
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (slugError) {
      setError("Cannot save: Duplicate slug value exists. Please enter a unique slug.");
      return;
    }
    const hasSkuErrors = Object.values(skuErrors).some(err => !!err);
    if (hasSkuErrors) {
      setError("Cannot save: Duplicate SKU value exists. Please ensure all variant SKUs are unique.");
      return;
    }

    setIsSaving(true);

    try {
      let parsedBadges: string[] = [];
      try {
          parsedBadges = JSON.parse(formData.badges || "[]");
          if (!Array.isArray(parsedBadges)) parsedBadges = [];
      } catch (e) {
          parsedBadges = [];
      }

      const formattedVariants = variants.map(v => ({
        ...v,
        id: v.id,
        basePrice: parseFloat(v.basePrice) || 0,
        discountedPrice: parseFloat(v.discountedPrice) || 0,
        stockQuantity: parseInt(v.stockQuantity) || 0,
        isActive: v.isActive !== undefined ? v.isActive : true,
        volumeLitres: v.volumeLitres ? parseFloat(v.volumeLitres) : null,
        mediaUrls: v.mediaUrls || []
      }));

      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0,
        subcategoryId: formData.subcategoryId || null,
        badges: parsedBadges,
        mediaUrls: coverImageUrl ? [coverImageUrl] : [],
        variants: formattedVariants
      };

      await adminUpdateProduct(id, payload);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PRODUCTS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PRODUCTS);
      setFlashToast("Product updated successfully!", "success");
      showToast("Product updated successfully!", "success");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
      showToast(err.message || "Failed to update product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-bharati-mist" />
            <div className="w-12 h-12 rounded-full border-2 border-bharati-charcoal border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-bharati-charcoal font-medium">Loading product details…</p>
          <p className="text-xs text-bharati-ash">Fetching variants, images & specifications</p>
        </div>

        {/* Skeleton placeholders for form cards */}
        <div className="mt-10 space-y-6">
          <div className="bg-white rounded-lg border border-bharati-mist p-6 animate-pulse">
            <div className="h-5 bg-bharati-mist/60 rounded w-36 mb-4" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-32 h-32 bg-bharati-mist/40 rounded-md" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-bharati-mist p-6 animate-pulse">
            <div className="h-5 bg-bharati-mist/60 rounded w-44 mb-4" />
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-bharati-mist/40 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-sm font-medium text-bharati-black">Failed to load product</p>
          <p className="text-xs text-bharati-ash max-w-sm">{error}</p>
          <Link href="/admin/products" className="text-sm text-bharati-gold hover:underline mt-2">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-bharati-cream rounded-full transition-colors">
          <ArrowLeft size={20} className="text-bharati-charcoal" />
        </Link>
        <h1 className="text-2xl font-light text-bharati-black tracking-wide">Edit Product</h1>
      </div>

      {/* Floating toasts handle success/error feedback now */}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-4">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Product Cover Image</h2>
          <div className="flex items-start gap-6">
            {coverImageUrl ? (
              <div className="relative w-40 h-40 rounded-lg border border-bharati-mist overflow-hidden group">
                <img src={coverImageUrl} alt="Product cover" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                             opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-40 h-40 rounded-lg
                                 border-2 border-dashed border-bharati-mist hover:border-bharati-charcoal
                                 cursor-pointer transition-colors">
                {isUploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-bharati-charcoal border-t-transparent
                                    rounded-full animate-spin mb-1" />
                    <span className="text-xs text-bharati-charcoal">Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-1" />
                    <span className="text-sm font-medium text-bharati-charcoal">Upload Cover</span>
                    <span className="text-[10px] text-gray-400">Single image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden"
                       onChange={handleCoverImageUpload} disabled={isUploading} />
              </label>
            )}
            {coverImageUrl && (
              <label className="text-sm text-bharati-gold hover:text-bharati-charcoal
                                cursor-pointer font-medium transition-colors mt-2">
                Replace image
                <input type="file" accept="image/*" className="hidden"
                       onChange={handleCoverImageUpload} disabled={isUploading} />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Slug *</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  required 
                  className={`w-full p-3 border rounded-md transition-colors ${
                    slugError 
                      ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
                      : "border-bharati-mist focus:border-bharati-black"
                  }`} 
                />
                {isCheckingSlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-bharati-charcoal border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {slugError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 font-medium animate-fadeIn">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{slugError}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Tagline</label>
            <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Category *</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors bg-white">
                <option value="" disabled>Select a category</option>
                {categories.filter((c: any) => c.isActive !== false).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Subcategory *</label>
              <select name="subcategoryId" value={formData.subcategoryId} onChange={handleChange} required disabled={!selectedCategory || subcategories.length === 0} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="" disabled>Select a subcategory</option>
                {/* Always include current subcategory if it exists */}
                {formData.subcategoryId && !subcategories.find(s => s.id === formData.subcategoryId) && (
                   <option value={formData.subcategoryId}>{currentSubcategoryName || "Loading…"}</option>
                )}
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Warranty</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Duration</label>
              <select value={warrantyPreset} onChange={handleWarrantyPresetChange} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors bg-white">
                <option value="">No warranty (default)</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="5 years">5 years</option>
                <option value="Lifetime">Lifetime</option>
                <option value="Custom">Custom...</option>
              </select>
            </div>
            {warrantyPreset === "Custom" && (
              <div>
                <label className="block text-sm font-medium text-bharati-charcoal mb-2">Custom Duration *</label>
                <input type="text" name="warrantyDuration" value={formData.warrantyDuration} onChange={handleChange} required placeholder="e.g. 18 months" className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Details (Optional)</label>
            <textarea name="warrantyDetails" value={formData.warrantyDetails} onChange={handleChange} rows={2} placeholder="e.g. Covers manufacturing defects. Does not cover physical damage." className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors resize-none" />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <div className="flex justify-between items-center border-b border-bharati-mist pb-2">
            <h2 className="text-lg font-medium text-bharati-black">Product Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm text-bharati-gold hover:text-bharati-charcoal font-medium transition-colors">
              <Plus size={16} /> Add Variant
            </button>
          </div>
          
          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div key={index} className="p-5 border border-bharati-mist rounded-md bg-gray-50/50 relative">
                {variants.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setVariantToDeleteIndex(index);
                      setVariantDeleteConfirmText("");
                    }} 
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                    title="Delete variant"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <h3 className="text-md font-medium text-bharati-charcoal mb-4">Variant {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">SKU *</label>
                    <input 
                      type="text" 
                      name="sku" 
                      value={variant.sku} 
                      onChange={(e) => handleVariantChange(index, e)} 
                      required 
                      className={`w-full p-2.5 border rounded-md text-sm bg-white transition-colors ${
                        skuErrors[index] 
                          ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
                          : "border-bharati-mist focus:border-bharati-black"
                      }`} 
                    />
                    {skuErrors[index] && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1 font-medium animate-fadeIn">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{skuErrors[index]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Base Price (₹) *</label>
                    <input type="number" step="0.01" name="basePrice" value={variant.basePrice} onChange={(e) => handleVariantChange(index, e)} required className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Discounted Price (₹) *</label>
                    <input type="number" step="0.01" name="discountedPrice" value={variant.discountedPrice} onChange={(e) => handleVariantChange(index, e)} required className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity *</label>
                    <input type="number" name="stockQuantity" value={variant.stockQuantity} onChange={(e) => handleVariantChange(index, e)} required className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Volume (Litres)</label>
                    <input type="number" step="0.1" name="volumeLitres" value={variant.volumeLitres} onChange={(e) => handleVariantChange(index, e)} className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" placeholder="e.g. 2.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Material Type</label>
                    <input type="text" name="materialType" value={variant.materialType} onChange={(e) => handleVariantChange(index, e)} className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" placeholder="e.g. Stainless Steel" />
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="inductionCompatible" checked={variant.inductionCompatible} onChange={(e) => handleVariantChange(index, e)} className="w-4 h-4 accent-bharati-charcoal" />
                      <span className="text-sm text-gray-600">Induction Compatible</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="isActive" checked={variant.isActive !== false} onChange={(e) => handleVariantChange(index, e)} className="w-4 h-4 accent-bharati-charcoal" />
                      <span className="text-sm text-gray-600">Available in Store</span>
                    </label>
                  </div>
                  <div className="col-span-1 md:col-span-3 mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Warranty Override (Optional)</label>
                    <input type="text" name="warrantyOverride" value={variant.warrantyOverride} onChange={(e) => handleVariantChange(index, e)} className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" placeholder="e.g. 5 Years (leaves blank to inherit product warranty)" />
                  </div>
                  
                  {/* Specifications */}
                  <div className="col-span-1 md:col-span-3 mt-4 pt-4 border-t border-bharati-mist/50">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-xs font-medium text-bharati-charcoal">Specifications</label>
                        <button type="button" onClick={() => addSpec(index)} className="flex items-center gap-1 text-xs text-bharati-gold hover:text-bharati-charcoal font-medium transition-colors">
                            <Plus size={14} /> Add Spec
                        </button>
                    </div>
                    {variant.specifications && variant.specifications.length > 0 ? (
                        <div className="space-y-3">
                            {variant.specifications.map((spec: any, specIndex: number) => (
                                <div key={specIndex} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <input type="text" value={spec.specKey} onChange={(e) => handleSpecChange(index, specIndex, 'specKey', e.target.value)} placeholder="Name (e.g. Dimensions)" className="w-full p-2 border border-bharati-mist rounded-md focus:border-bharati-black text-xs bg-white" />
                                    </div>
                                    <div className="flex-1">
                                        <input type="text" value={spec.specValue} onChange={(e) => handleSpecChange(index, specIndex, 'specValue', e.target.value)} placeholder="Value (e.g. 10x20 cm)" className="w-full p-2 border border-bharati-mist rounded-md focus:border-bharati-black text-xs bg-white" />
                                    </div>
                                    <button type="button" onClick={() => removeSpec(index, specIndex)} className="p-2 text-red-400 hover:text-red-600 transition-colors mt-0.5">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No specifications added yet.</p>
                    )}
                  </div>

                  {/* Variant Images */}
                  <div className="col-span-1 md:col-span-3 mt-4 pt-4 border-t border-bharati-mist/50">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <label className="block text-xs font-medium text-bharati-charcoal">
                          Variant Images (Specific to this variant)
                        </label>
                        <p className="text-[11px] text-gray-400">
                          Add photos showing this specific size, material, or color
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {variant.mediaUrls && variant.mediaUrls.map((url: string, imgIdx: number) => (
                        <div key={imgIdx} className="relative aspect-square rounded border border-bharati-mist overflow-hidden group bg-white">
                          <img src={url} alt={`Variant ${index + 1} - ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(index, imgIdx)}
                            className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-bharati-mist rounded cursor-pointer hover:bg-gray-100/70 transition-colors">
                        <div className="flex flex-col items-center space-y-1 p-2 text-center">
                          {uploadingVariantIndex === index ? (
                            <>
                              <div className="w-5 h-5 border-2 border-bharati-charcoal border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[10px] text-bharati-charcoal">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} className="text-gray-400" />
                              <span className="text-xs font-medium text-bharati-charcoal">Add Images</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleVariantImageUpload(index, e)}
                          className="hidden"
                          disabled={uploadingVariantIndex === index}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Badges (JSON array of strings)</label>
            <input type="text" name="badges" value={formData.badges} onChange={handleChange} placeholder='e.g. ["ISI Certified", "Make in India"]' className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors font-mono text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-1">Sort Order</label>
            <p className="text-xs text-bharati-ash mb-2">Lower numbers appear first (e.g. 10, 20, 30). Controls sequence in collection scroller and catalog.</p>
            <input 
              type="number" 
              name="sortOrder" 
              value={formData.sortOrder} 
              onChange={handleChange} 
              className="w-32 p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" 
            />
          </div>

          <div className="flex gap-8 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 accent-bharati-charcoal" />
              <span className="text-sm font-medium text-bharati-charcoal">Active (Visible on store)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-bharati-charcoal" />
              <span className="text-sm font-medium text-bharati-charcoal">Featured Product</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" className="px-6 py-3 border border-bharati-mist rounded-md text-bharati-charcoal hover:bg-bharati-cream transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2 bg-bharati-charcoal text-white px-6 py-3 rounded-md hover:bg-black transition-colors disabled:opacity-50">
            <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Variant Delete Confirmation Modal */}
      {variantToDeleteIndex !== null && variants[variantToDeleteIndex] && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-bharati-mist space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-bharati-black">Delete Variant</h3>
                  <p className="text-xs text-bharati-ash">Confirm Variant Removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVariantToDeleteIndex(null);
                  setVariantDeleteConfirmText("");
                }}
                className="text-bharati-ash hover:text-bharati-black p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-bharati-cream/60 p-3 rounded-lg border border-bharati-mist/60 text-sm space-y-1">
              <div className="font-semibold text-bharati-black">
                Variant {variantToDeleteIndex + 1}
                {variants[variantToDeleteIndex].volumeLitres ? ` • ${variants[variantToDeleteIndex].volumeLitres}L` : ""}
                {variants[variantToDeleteIndex].materialType ? ` • ${variants[variantToDeleteIndex].materialType}` : ""}
              </div>
              <div className="text-xs text-bharati-ash font-mono">
                SKU: {variants[variantToDeleteIndex].sku || "Unspecified"}
              </div>
              <div className="text-xs text-bharati-ash">
                Price: ₹{variants[variantToDeleteIndex].discountedPrice || variants[variantToDeleteIndex].basePrice || "0"} | Stock: {variants[variantToDeleteIndex].stockQuantity || "0"}
                {variants[variantToDeleteIndex].mediaUrls && variants[variantToDeleteIndex].mediaUrls.length > 0 ? ` | ${variants[variantToDeleteIndex].mediaUrls.length} image(s)` : ""}
              </div>
            </div>

            <p className="text-sm text-bharati-charcoal leading-relaxed">
              Are you sure you want to delete this variant? When you save changes, this variant and all its specifications and uploaded media will be permanently removed.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-bharati-charcoal uppercase tracking-wider">
                Type <span className="font-bold text-red-600 font-mono">confirm</span> to delete:
              </label>
              <input
                type="text"
                value={variantDeleteConfirmText}
                onChange={(e) => setVariantDeleteConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (variantDeleteConfirmText.trim().toLowerCase() === "confirm") {
                      handleConfirmDeleteVariant();
                    }
                  }
                }}
                placeholder="confirm"
                className="w-full px-3 py-2 border border-bharati-mist rounded-md font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setVariantToDeleteIndex(null);
                  setVariantDeleteConfirmText("");
                }}
                className="px-4 py-2 border border-bharati-mist text-bharati-charcoal rounded-md text-sm hover:bg-bharati-cream transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVariant}
                disabled={variantDeleteConfirmText.trim().toLowerCase() !== "confirm"}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Delete Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
