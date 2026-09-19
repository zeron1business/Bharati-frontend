"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetchProduct, adminUpdateProduct, adminFetchCategories, adminUploadImage } from "@/app/lib/admin-api";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import React from "react";

export default function EditProduct({ params }: { params: { id: string } }) {
  // Using React.use() to unwrap params in Next.js 15+ if needed, or just accessing it
  const unwrappedParams = React.use(params as any) as any;
  const id = unwrappedParams.id;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    tagline: "",
    description: "",
    categoryId: "",
    basePrice: "",
    discountedPrice: "",
    sku: "",
    stockQuantity: "",
    badges: "[]",
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productRes] = await Promise.all([
          adminFetchCategories(),
          adminFetchProduct(id)
        ]);
        
        setCategories(categoriesRes.data);
        
        const p = productRes.data;
        // Map existing media to just urls array for editing simplicity
        const mUrls = (p.media || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((m: any) => m.url);
        setMediaUrls(mUrls);
        
        setFormData({
          title: p.title || "",
          slug: p.slug || "",
          tagline: p.tagline || "",
          description: p.description || "",
          categoryId: p.category?.id || "",
          basePrice: p.basePrice?.toString() || "0",
          discountedPrice: p.discountedPrice?.toString() || "0",
          sku: p.sku || "",
          stockQuantity: p.stockQuantity?.toString() || "0",
          badges: p.badges ? JSON.stringify(p.badges) : "[]",
          isActive: p.isActive,
          isFeatured: p.isFeatured,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setError("");
    try {
        const url = await adminUploadImage(file);
        setMediaUrls(prev => [...prev, url]);
    } catch (err: any) {
        setError(err.message || "Failed to upload image");
    } finally {
        setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
      setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      let parsedBadges: string[] = [];
      try {
          parsedBadges = JSON.parse(formData.badges || "[]");
          if (!Array.isArray(parsedBadges)) parsedBadges = [];
      } catch (e) {
          parsedBadges = [];
      }

      const payload = {
        ...formData,
        badges: parsedBadges,
        mediaUrls: mediaUrls,
        basePrice: parseFloat(formData.basePrice) || 0,
        discountedPrice: parseFloat(formData.discountedPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };

      await adminUpdateProduct(id, payload);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-bharati-charcoal" size={32} />
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-4">
          <div className="flex justify-between items-center border-b border-bharati-mist pb-2">
            <h2 className="text-lg font-medium text-bharati-black">Product Images</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto py-2">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative w-32 h-32 shrink-0 rounded-md border border-bharati-mist overflow-hidden group">
                <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 inset-x-0 bg-bharati-black/80 text-white text-[10px] text-center py-1 font-medium">PRIMARY</div>
                )}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center w-32 h-32 shrink-0 rounded-md border-2 border-dashed border-bharati-mist hover:border-bharati-black hover:bg-bharati-cream transition-colors cursor-pointer text-bharati-ash hover:text-bharati-charcoal">
                {isUploading ? (
                    <span className="text-sm font-medium">Uploading...</span>
                ) : (
                    <>
                        <Upload size={24} className="mb-2" />
                        <span className="text-sm font-medium">Upload</span>
                    </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
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

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Category *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors bg-white">
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Base Price (₹) *</label>
              <input type="number" step="0.01" name="basePrice" value={formData.basePrice} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Discounted Price (₹) *</label>
              <input type="number" step="0.01" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">SKU *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-bharati-charcoal mb-2">Stock Quantity *</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
            </div>
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
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
