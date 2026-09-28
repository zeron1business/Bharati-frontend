"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminCreateProduct, adminFetchCategories, adminFetchSubcategories, adminUploadImage, adminUploadImages } from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Plus, Trash2, CheckCircle } from "lucide-react";

export default function NewProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
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
    warrantyDuration: "",
    warrantyDetails: "",
  });

  const [variants, setVariants] = useState<any[]>([
    {
      sku: "",
      basePrice: "",
      discountedPrice: "",
      stockQuantity: "",
      volumeLitres: "",
      materialType: "",
      inductionCompatible: false,
      warrantyOverride: "",
      isActive: true,
      specifications: []
    }
  ]);

  useEffect(() => {
    const cached = getSessionCache<any[]>(CACHE_KEYS.ADMIN_CATEGORIES);
    if (cached && cached.length > 0) {
      setCategories(cached);
    }

    const fetchCategories = async () => {
      try {
        const response = await adminFetchCategories();
        setCategories(response.data);
        setSessionCache(CACHE_KEYS.ADMIN_CATEGORIES, response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubs = async () => {
        try {
          const response = await adminFetchSubcategories(selectedCategory);
          setSubcategories(response.data);
          setFormData(prev => ({ ...prev, subcategoryId: "" }));
        } catch (err) {
          console.error("Failed to load subcategories:", err);
        }
      };
      fetchSubs();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "name") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, [name]: value, slug }));
    } else if (type === "checkbox") {
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
      specifications: []
    }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
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
    // update sort order
    newVariants[variantIndex].specifications.forEach((spec: any, i: number) => spec.sortOrder = i);
    setVariants(newVariants);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setIsUploading(true);
    setError("");
    try {
        const urls = await adminUploadImages(files);
        setMediaUrls(prev => [...prev, ...urls]);
    } catch (err: any) {
        setError(err.message || "Failed to upload image(s)");
    } finally {
        setIsUploading(false);
        e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
      setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
        basePrice: parseFloat(v.basePrice) || 0,
        discountedPrice: parseFloat(v.discountedPrice) || 0,
        stockQuantity: parseInt(v.stockQuantity) || 0,
        isActive: v.isActive !== undefined ? v.isActive : true,
        volumeLitres: v.volumeLitres ? parseFloat(v.volumeLitres) : null
      }));

      const payload = {
        ...formData,
        subcategoryId: formData.subcategoryId || null,
        badges: parsedBadges,
        mediaUrls: mediaUrls,
        variants: formattedVariants
      };

      await adminCreateProduct(payload);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_PRODUCTS);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_PRODUCTS);
      setSuccessMessage("Product added successfully!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-bharati-cream rounded-full transition-colors">
          <ArrowLeft size={20} className="text-bharati-charcoal" />
        </Link>
        <h1 className="text-2xl font-light text-bharati-black tracking-wide">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-bharati-mint-muted border border-bharati-mint/30 text-bharati-charcoal p-4 rounded-md text-sm flex items-center gap-3 shadow-sm transition-all duration-300">
          <CheckCircle size={20} className="text-bharati-mint-dark shrink-0" />
          <span className="font-medium text-bharati-charcoal">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
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
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Subcategory *</label>
              <select name="subcategoryId" value={formData.subcategoryId} onChange={handleChange} required disabled={!selectedCategory || subcategories.length === 0} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="" disabled>Select a subcategory</option>
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
            <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-bharati-mist group">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={16} />
                  </button>
                  {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-bharati-charcoal text-white text-xs text-center py-1 bg-opacity-90">Primary</span>
                  )}
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-bharati-mist rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center space-y-2 p-2 text-center">
                  {isUploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-bharati-charcoal border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-bharati-charcoal">Uploading...</span>
                      </>
                  ) : (
                      <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm font-medium text-bharati-charcoal">Upload Images</span>
                        <span className="text-[11px] text-gray-400">Select one or multiple</span>
                      </>
                  )}
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
              </label>
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
                  <button type="button" onClick={() => removeVariant(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
                <h3 className="text-md font-medium text-bharati-charcoal mb-4">Variant {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">SKU *</label>
                    <input type="text" name="sku" value={variant.sku} onChange={(e) => handleVariantChange(index, e)} required className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white" />
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
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2 bg-bharati-charcoal text-white px-6 py-3 rounded-md hover:bg-black transition-colors disabled:opacity-50">
            <Save size={18} /> {isLoading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
