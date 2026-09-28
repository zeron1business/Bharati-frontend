"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Tags, ClipboardList, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bharati_admin_token");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (token && pathname === "/admin/login") {
      router.push("/admin/products");
    } else {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem("bharati_admin_token");
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ClipboardList },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
  ];

  return (
    <div className="min-h-screen flex bg-bharati-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-bharati-mist flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-bharati-mist">
          <Link href="/admin/products" className="text-xl font-bold tracking-widest text-bharati-black">
            BHARATI<span className="text-bharati-ash font-light ml-2">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? "bg-bharati-black text-white" 
                    : "text-bharati-ash hover:bg-bharati-ivory hover:text-bharati-charcoal"
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-bharati-mist">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
