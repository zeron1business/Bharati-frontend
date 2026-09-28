"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateCategory } from "@/app/lib/admin-api";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useToast, setFlashToast } from "@/app/admin/ToastContext";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0,
      };

      await adminCreateCategory(payload);
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

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-bharati-mist space-y-6">
        
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

        <div>
          <label className="block text-sm font-medium text-bharati-charcoal mb-2">Image URL</label>
          <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="/products/Cooker-front.jpg" className="w-full p-3 border border-bharati-mist rounded-md focus:border-bharati-black transition-colors" />
        </div>

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

        <div className="flex justify-end gap-4 pt-4 border-t border-bharati-mist">
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
