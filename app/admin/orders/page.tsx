"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  adminFetchAllOrders,
  adminUpdateOrderStatus,
} from "@/app/lib/admin-api";

interface AdminOrder {
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
  shippingPincode: string;
}

const ORDER_STATUSES = [
  "CREATED",
  "PAYMENT_PENDING",
  "PAID",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminFetchAllOrders(statusFilter || undefined);
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-md hover:bg-bharati-ivory text-bharati-ash hover:text-bharati-black transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide">
              Orders
            </h1>
            <p className="text-sm text-bharati-ash mt-0.5">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
              {statusFilter ? ` · ${statusFilter.replace(/_/g, " ")}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 text-sm border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none"
            />
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bharati-cream text-bharati-charcoal font-medium">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bharati-mist">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-bharati-ash"
                  >
                    <RefreshCw
                      size={20}
                      className="animate-spin inline-block mr-2"
                    />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-bharati-ash"
                  >
                    No orders found
                    {statusFilter ? ` with status "${statusFilter.replace(/_/g, " ")}"` : ""}.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-bharati-cream/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-bharati-black">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-bharati-charcoal block">
                        {order.customerName || "—"}
                      </span>
                      <span className="text-xs text-bharati-ash">
                        {order.customerPhone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-bharati-charcoal">
                      <span className="block">
                        {order.shippingCity || "—"}
                      </span>
                      <span className="text-bharati-ash">
                        {[order.shippingState, order.shippingPincode]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-bharati-charcoal">
                      {order.itemCount}
                    </td>
                    <td className="px-6 py-4 font-medium text-bharati-black">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                          statusColor[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-bharati-ash whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updatingId === order.id}
                          className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none"
                        />
                      </div>
                    </td>
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
