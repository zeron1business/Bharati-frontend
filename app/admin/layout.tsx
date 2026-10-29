"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  LogOut,
  Ticket,
  LayoutGrid,
  Users,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { ToastProvider } from "./ToastContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Authentication & preferences sync after mount (hydration safe)
  useEffect(() => {
    const token = localStorage.getItem("bharati_admin_token");
    const savedCollapsed = localStorage.getItem("bharati_admin_sidebar_collapsed");

    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (token && pathname === "/admin/login") {
      router.push("/admin/products");
    } else {
      queueMicrotask(() => {
        setIsAuthenticated(!!token);
        if (savedCollapsed !== null) {
          setIsCollapsed(savedCollapsed === "true");
        }
        setIsLoading(false);
      });
    }
  }, [pathname, router]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Auto-close mobile drawer when window resizes to desktop breakpoint (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    queueMicrotask(() => {
      setIsMobileDrawerOpen(false);
    });
  }, [pathname]);

  const toggleDesktopSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bharati_admin_sidebar_collapsed", String(next));
      } catch (err) {
        console.error("Failed to persist sidebar state:", err);
      }
      return next;
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bharati_admin_token");
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push("/admin/login");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ClipboardList },
    { label: "Customers", href: "/admin/users", icon: Users },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Promos", href: "/admin/promos", icon: Ticket },
    { label: "Collection", href: "/admin/collection", icon: LayoutGrid },
    { label: "Promotional SMS", href: "/admin/promotional-sms", icon: MessageSquare },
  ];

  const currentNavItem = navItems.find((item) =>
    pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin")
  );

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-bharati-cream">
        {/* ── 1. Desktop Sidebar (hidden on mobile/tablet < 1024px) ───────────── */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-bharati-mist transition-all duration-300 ease-in-out shrink-0 select-none ${
            isCollapsed ? "w-20" : "w-72"
          }`}
          aria-label="Admin desktop navigation"
        >
          {/* Sidebar Header: Brand + Toggle */}
          <div
            className={`h-16 flex items-center border-b border-bharati-mist ${
              isCollapsed ? "justify-center px-2" : "justify-between px-5 sm:px-6"
            }`}
          >
            {isCollapsed ? (
              <Link
                href="/admin"
                className="text-lg font-bold tracking-widest text-bharati-black hover:opacity-80 transition-opacity"
                title="Bharati Admin"
                aria-label="Bharati Admin Home"
              >
                B<span className="text-bharati-mint font-light">.</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="text-xl font-bold tracking-widest text-bharati-black hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                BHARATI<span className="text-bharati-ash font-light ml-2">ADMIN</span>
              </Link>
            )}

            <button
              onClick={toggleDesktopSidebar}
              className={`shrink-0 p-1.5 rounded-md text-bharati-ash hover:text-bharati-black hover:bg-bharati-ivory transition-colors ${
                isCollapsed ? "mt-1" : ""
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={18} strokeWidth={1.5} />
              ) : (
                <PanelLeftClose size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/admin");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={`flex items-center rounded-lg transition-all group relative ${
                    isCollapsed
                      ? "justify-center p-3"
                      : "gap-3 px-3.5 py-3"
                  } ${
                    isActive
                      ? "bg-bharati-black text-white shadow-xs font-medium"
                      : "text-bharati-ash hover:bg-bharati-ivory hover:text-bharati-charcoal"
                  }`}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="shrink-0"
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Accessible tooltip when collapsed */}
                  {isCollapsed && (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-bharati-mist">
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : undefined}
              aria-label="Logout"
              className={`flex items-center rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
                isCollapsed ? "justify-center p-3 w-full" : "gap-3 px-3.5 py-3 w-full"
              }`}
            >
              <LogOut size={20} strokeWidth={1.5} className="shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── 2. Mobile Drawer Navigation (< 1024px) ─────────────────────────── */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <aside
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation drawer"
            >
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-bharati-mist">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-xl font-bold tracking-widest text-bharati-black"
                >
                  BHARATI<span className="text-bharati-ash font-light ml-2">ADMIN</span>
                </Link>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-md text-bharati-ash hover:text-bharati-black hover:bg-bharati-ivory transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href) && item.href !== "/admin");

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-bharati-black text-white shadow-xs"
                          : "text-bharati-ash hover:bg-bharati-ivory hover:text-bharati-charcoal"
                      }`}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-bharati-mist">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                >
                  <LogOut size={20} strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── 3. Main Application Content Area ──────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          {/* Universal Admin Top Header */}
          <header className="h-16 bg-white border-b border-bharati-mist px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
            {/* Left: Mobile Menu Toggle / Desktop Section Name */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-bharati-ash hover:text-bharati-black hover:bg-bharati-ivory transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={isMobileDrawerOpen}
              >
                <Menu size={22} strokeWidth={1.75} />
              </button>

              {/* Breadcrumb / Page Label */}
              <div className="flex items-center gap-2">
                <span className="lg:hidden text-sm font-bold tracking-wider text-bharati-black">
                  BHARATI
                </span>
                <span className="lg:hidden text-bharati-silver">/</span>
                <span className="text-sm font-medium text-bharati-charcoal truncate">
                  {currentNavItem ? currentNavItem.label : "Admin"}
                </span>
              </div>
            </div>

            {/* Right: Quick actions or indicator */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bharati-cream text-bharati-ash border border-bharati-mist">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Store Admin
              </span>
            </div>
          </header>

          {/* Page Content Body */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
