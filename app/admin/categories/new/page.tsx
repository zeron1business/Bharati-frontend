"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateCategory } from "@/app/lib/admin-api";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useToast, setFlashToast } from "@/app/admin/ToastContext";
import { clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import { CategoryImageUploader } from "../components/CategoryImageUploader";

interface SubcategoryForm {
  tempId: string;
  name: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
}

export default function NewCategory() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
  });

  const [subcategories, setSubcategories] = useState<SubcategoryForm[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const addSubcategory = () => {
    setSubcategories(prev => [...prev, {
      tempId: crypto.randomUUID(),
      name: "",
      slug: "",
      sortOrder: String(prev.length),
      isActive: true,
    }]);
  };

  const removeSubcategory = (tempId: string) => {
    setSubcategories(prev => prev.filter(s => s.tempId !== tempId));
  };

  const handleSubcategoryChange = (tempId: string, field: string, value: string | boolean) => {
    setSubcategories(prev => prev.map(sub => {
      if (sub.tempId !== tempId) return sub;
      if (field === "name") {
        const slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return { ...sub, name: value as string, slug };
      }
      return { ...sub, [field]: value };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate subcategories
    for (const sub of subcategories) {
      if (!sub.name.trim() || !sub.slug.trim()) {
        setError("All subcategories must have a Name and Slug.");
        showToast("All subcategories must have a Name and Slug.", "error");
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0,
        subcategories: subcategories.map(sub => ({
          name: sub.name,
          slug: sub.slug,
          sortOrder: parseInt(sub.sortOrder) || 0,
          isActive: sub.isActive,
        })),
      };

      await adminCreateCategory(payload);
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_CATEGORIES);
      clearSessionCacheByPrefix(CACHE_KEYS.STORE_CATEGORIES);
      setFlashToast("Category created successfully!", "success");
      router.push("/admin/categories");
    } catch (err: any) {
      setError(err.message || "Failed to create category");
      showToast(err.message || "Failed to create category", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 hover:bg-bharati-cream rounded-full transition-colors">
          <ArrowLeft size={20} className="text-bharati-charcoal" />
        </Link>
        <h1 className="text-2xl font-light text-bharati-black tracking-wide">Add New Category</h1>
      </div>

      {/* Floating toasts handle error/success feedback */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Fields */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <h2 className="text-lg font-medium text-bharati-black border-b border-bharati-mist pb-2">Category Details</h2>
        
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Slug *</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors resize-none" />
          </div>

          <CategoryImageUploader
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">Sort Order</label>
            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 accent-bharati-charcoal" />
              <span className="text-sm font-medium text-bharati-charcoal">Active</span>
            </label>
          </div>
        </div>

        {/* Subcategories Section */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
          <div className="flex justify-between items-center border-b border-bharati-mist pb-2">
            <h2 className="text-lg font-medium text-bharati-black">Subcategories</h2>
            <button type="button" onClick={addSubcategory} className="flex items-center gap-2 text-sm text-bharati-gold hover:text-bharati-charcoal font-medium transition-colors">
              <Plus size={16} /> Add Subcategory
            </button>
          </div>

          {subcategories.length === 0 ? (
            <p className="text-sm text-bharati-ash italic">No subcategories added yet. Click &quot;+ Add Subcategory&quot; to add one.</p>
          ) : (
            <div className="space-y-4">
              {subcategories.map((sub, index) => (
                <div key={sub.tempId} className="p-4 border border-bharati-mist rounded-md bg-gray-50/50 relative">
                  <button 
                    type="button" 
                    onClick={() => removeSubcategory(sub.tempId)} 
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                    title="Remove subcategory"
                  >
                    <Trash2 size={16} />
                  </button>

                  <h3 className="text-sm font-medium text-bharati-charcoal mb-3">Subcategory {index + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                      <input 
                        type="text" 
                        value={sub.name} 
                        onChange={(e) => handleSubcategoryChange(sub.tempId, "name", e.target.value)} 
                        required 
                        className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Slug *</label>
                      <input 
                        type="text" 
                        value={sub.slug} 
                        onChange={(e) => handleSubcategoryChange(sub.tempId, "slug", e.target.value)} 
                        required 
                        className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
                      <input 
                        type="number" 
                        value={sub.sortOrder} 
                        onChange={(e) => handleSubcategoryChange(sub.tempId, "sortOrder", e.target.value)} 
                        className="w-full p-2.5 border border-bharati-mist rounded-md focus:border-bharati-black text-sm bg-white transition-colors" 
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={sub.isActive} 
                          onChange={(e) => handleSubcategoryChange(sub.tempId, "isActive", e.target.checked)} 
                          className="w-4 h-4 accent-bharati-charcoal" 
                        />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          <Link href="/admin/categories" className="px-6 py-3 border border-bharati-mist rounded-md text-bharati-charcoal hover:bg-bharati-cream transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
            <Save size={18} /> {isLoading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
