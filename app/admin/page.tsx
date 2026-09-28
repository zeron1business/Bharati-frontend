"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  adminFetchDashboardStats,
  adminFetchRecentOrders,
} from "@/app/lib/admin-api";

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  createdAt: string;
  shippingCity: string;
  shippingState: string;
}

const statusColor: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  PAYMENT_PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminFetchDashboardStats(),
        adminFetchRecentOrders(8),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={24} className="text-bharati-ash animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "—",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const orderPipeline = [
    {
      label: "Pending",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedOrders ?? 0,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Shipped",
      value: stats?.shippedOrders ?? 0,
      icon: Truck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Delivered",
      value: stats?.deliveredOrders ?? 0,
      icon: PackageCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-bharati-black tracking-wide">
            Dashboard
          </h1>
          <p className="text-sm text-bharati-ash mt-1">
            Overview of your store performance
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-bharati-mist p-5 flex items-start gap-4"
          >
            <div className={`p-2.5 rounded-lg ${card.bg}`}>
              <card.icon size={20} className={card.color} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-bharati-ash font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-xl font-semibold text-bharati-black mt-1">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Order Pipeline
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-bharati-mint-dark hover:text-bharati-black transition-colors flex items-center gap-1"
          >
            Manage Orders <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {orderPipeline.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-lg border border-bharati-mist p-5 flex items-center gap-4"
            >
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon size={18} className={item.color} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-bharati-black">
                  {item.value}
                </p>
                <p className="text-xs text-bharati-ash">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-bharati-mint-dark hover:text-bharati-black transition-colors flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bharati-cream text-bharati-charcoal font-medium">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bharati-mist">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-bharati-ash"
                    >
                      No orders yet. When customers place orders, they will
                      appear here.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-bharati-cream/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <span className="font-medium text-bharati-black">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-bharati-ash block">
                          {order.itemCount} item
                          {order.itemCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-bharati-charcoal block">
                          {order.customerName || "—"}
                        </span>
                        <span className="text-xs text-bharati-ash">
                          {order.customerPhone}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-bharati-charcoal text-xs">
                        {[order.shippingCity, order.shippingState]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-6 py-3 font-medium text-bharati-black">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                            statusColor[order.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-bharati-ash">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
