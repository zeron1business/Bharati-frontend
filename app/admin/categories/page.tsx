"use client";

import { useEffect, useState } from "react";
import { adminFetchCategories } from "@/app/lib/admin-api";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await adminFetchCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light text-bharati-black tracking-wide">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </Link>
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
