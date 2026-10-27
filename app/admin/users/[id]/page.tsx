"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  User,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import {
  adminFetchCustomerDetails,
  adminFetchCustomerOrders,
  AdminCustomerDetail,
  AdminCustomerOrderSummary,
  CustomerSegment,
} from "@/app/lib/admin-api";
import { useToast } from "@/app/admin/ToastContext";

// Segment badge styling
const segmentBadges: Record<
  CustomerSegment,
  { label: string; bg: string; text: string; border: string }
> = {
  ALL: { label: "All Customers", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  PROSPECT: { label: "Prospect", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  FIRST_TIME_BUYER: {
    label: "First-Time Buyer",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  REPEAT_BUYER: { label: "Repeat Buyer", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  VIP: { label: "VIP Customer", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
};

// Order status badge styling matching admin orders convention
const statusBadgeStyles: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700 border-gray-200",
  PAYMENT_PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-800 border-emerald-200",
  CONFIRMED: "bg-blue-50 text-blue-800 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-800 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-800 border-green-200",
  CANCELLED: "bg-red-50 text-red-800 border-red-200",
  PAYMENT_FAILED: "bg-rose-50 text-rose-800 border-rose-200",
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminCustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;
  const isInvalidUuid = !UUID_REGEX.test(customerId);

  const { showToast } = useToast();

  // Primary customer profile and orders data
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [orders, setOrders] = useState<AdminCustomerOrderSummary[]>([]);
  const [currentId, setCurrentId] = useState<string>(customerId);

  // UI state
  const [loading, setLoading] = useState<boolean>(!isInvalidUuid);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side pagination for order history table
  const [orderPage, setOrderPage] = useState<number>(0);
  const ordersPerPage = 10;

  // Reset state if navigating between different customer IDs
  if (currentId !== customerId) {
    setCurrentId(customerId);
    setCustomer(null);
    setOrders([]);
    setLoading(!isInvalidUuid);
    setError(null);
    setOrderPage(0);
  }

  // Load customer profile and orders
  useEffect(() => {
    if (isInvalidUuid) return;

    let ignore = false;

    Promise.all([
      adminFetchCustomerDetails(customerId),
      adminFetchCustomerOrders(customerId),
    ])
      .then(([detailRes, ordersRes]) => {
        if (!ignore) {
          if (detailRes?.data) {
            setCustomer(detailRes.data);
          }
          if (ordersRes?.data && Array.isArray(ordersRes.data)) {
            setOrders(ordersRes.data);
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Failed to load customer profile.";
          console.error("Failed to load customer profile:", err);
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [customerId, isInvalidUuid]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [detailRes, ordersRes] = await Promise.all([
        adminFetchCustomerDetails(customerId),
        adminFetchCustomerOrders(customerId),
      ]);
      if (detailRes?.data) setCustomer(detailRes.data);
      if (ordersRes?.data && Array.isArray(ordersRes.data)) setOrders(ordersRes.data);
      showToast("Customer profile refreshed", "info");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refresh customer.";
      console.error("Failed to refresh:", err);
      showToast(msg, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Invalid UUID Format View
  if (isInvalidUuid) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-2xs">
          <AlertCircle size={26} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-medium text-bharati-black">Invalid Customer ID</h2>
          <p className="text-sm text-bharati-ash leading-relaxed">
            The requested customer ID is not in a valid UUID format.
          </p>
          <p className="text-xs font-mono text-bharati-silver">ID: {customerId}</p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors font-medium shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Customers Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={26} className="animate-spin text-bharati-mint-dark" />
        <p className="text-xs uppercase tracking-wider text-bharati-ash font-medium">
          Loading customer profile...
        </p>
      </div>
    );
  }

  // Not Found / Error View
  if (error || !customer) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-2xs">
          <AlertCircle size={26} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-medium text-bharati-black">Customer Not Found</h2>
          <p className="text-sm text-bharati-ash leading-relaxed">
            {error || "The customer record could not be found or has been removed."}
          </p>
          <p className="text-xs font-mono text-bharati-silver">ID: {customerId}</p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors font-medium shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Customers Directory</span>
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-bharati-mist rounded-md text-bharati-charcoal hover:bg-bharati-cream transition-colors"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const { profile, financialSummary, savedAddresses } = customer;

  const segmentConfig =
    segmentBadges[financialSummary?.segment || "PROSPECT"] || segmentBadges.PROSPECT;

  // Format dates
  const formattedRegistrationDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const formattedRegistrationDateTime = profile.createdAt
    ? new Date(profile.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const formattedUpdatedAt = profile.updatedAt
    ? new Date(profile.updatedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Order history pagination calculations
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const currentOrdersSlice = orders.slice(
    orderPage * ordersPerPage,
    (orderPage + 1) * ordersPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/users"
              className="p-2 rounded-md hover:bg-bharati-ivory text-bharati-ash hover:text-bharati-black transition-colors"
              title="Back to Customers Directory"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide">
              {profile.name || "Customer Profile"}
            </h1>

            {/* Segment Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${segmentConfig.bg} ${segmentConfig.text} ${segmentConfig.border}`}
            >
              {financialSummary?.segment === "VIP" && <Sparkles size={12} />}
              {segmentConfig.label}
            </span>

            {/* Verification Status */}
            {profile.phoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Verified Mobile</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <span>Unverified</span>
              </span>
            )}
          </div>

          {/* Subtitle Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-bharati-ash pl-11">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-bharati-silver" />
              Customer since {formattedRegistrationDate}
            </span>
            {formattedUpdatedAt && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-bharati-silver" />
                  Profile updated on {formattedUpdatedAt}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Header Actions: Refresh Button */}
        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors disabled:opacity-50"
            title="Refresh customer profile"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin text-bharati-mint-dark" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Financial KPI + Order History) & Right Column (Profile Details + Saved Addresses) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Financial Breakdown KPI Cards */}
          <div className="bg-white rounded-lg border border-bharati-mist p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-bharati-mist/60">
              <div className="flex items-center gap-2 text-bharati-charcoal">
                <CreditCard size={17} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Authoritative Financial Summary
                </h2>
              </div>
              <span className="text-xs text-bharati-ash">
                {financialSummary.totalOrders} total order{financialSummary.totalOrders !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Top 4 Financial Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Verified Online Payments */}
              <div className="p-3.5 rounded-lg border border-bharati-mist/80 bg-emerald-50/40 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Verified Online Payments
                </span>
                <p className="text-lg font-bold text-bharati-black">
                  ₹{Number(financialSummary.collectedOnlineTotal || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">Captured via Razorpay</p>
              </div>

              {/* Delivered COD Value */}
              <div className="p-3.5 rounded-lg border border-bharati-mist/80 bg-blue-50/40 space-y-1">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                  Delivered COD Value
                </span>
                <p className="text-lg font-bold text-bharati-black">
                  ₹{Number(financialSummary.deliveredCodTotal || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-blue-700 font-medium">Delivered (cash unverified)</p>
              </div>

              {/* In-Flight COD */}
              <div className="p-3.5 rounded-lg border border-bharati-mist/80 bg-amber-50/40 space-y-1">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  COD Awaiting Delivery
                </span>
                <p className="text-lg font-bold text-bharati-black">
                  ₹{Number(financialSummary.inFlightCodTotal || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-amber-700 font-medium">In-transit pending collection</p>
              </div>

              {/* Total Qualifying Spend */}
              <div className="p-3.5 rounded-lg border border-bharati-mist/80 bg-purple-50/40 space-y-1">
                <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
                  Total Qualifying Spend
                </span>
                <p className="text-lg font-bold text-purple-950">
                  ₹{Number(financialSummary.totalQualifyingSpend || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-purple-700 font-medium">
                  {financialSummary.qualifyingOrders} qualifying purchase{financialSummary.qualifyingOrders !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Secondary Financial Metrics Bar */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="border-t border-bharati-mist/60 pt-2.5">
                <span className="text-bharati-ash block text-[11px]">Average Order Value (AOV)</span>
                <span className="font-semibold text-bharati-charcoal text-sm mt-0.5 block">
                  ₹{Number(financialSummary.averageOrderValue || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-bharati-silver">Per qualifying order</span>
              </div>

              <div className="border-t border-bharati-mist/60 pt-2.5">
                <span className="text-bharati-ash block text-[11px]">Cancelled Orders</span>
                <span className="font-semibold text-red-700 text-sm mt-0.5 block">
                  {financialSummary.cancelledOrders}
                </span>
                <span className="text-[10px] text-bharati-silver">
                  ₹{Number(financialSummary.cancelledOrdersTotal || 0).toLocaleString("en-IN")} value
                </span>
              </div>

              <div className="border-t border-bharati-mist/60 pt-2.5">
                <span className="text-bharati-ash block text-[11px]">Preferred Payment Method</span>
                <span className="font-semibold text-bharati-charcoal text-sm mt-0.5 block">
                  {financialSummary.preferredPaymentMethod === "ONLINE_RAZORPAY"
                    ? "Online (Razorpay)"
                    : financialSummary.preferredPaymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "None / No Orders"}
                </span>
              </div>

              <div className="border-t border-bharati-mist/60 pt-2.5">
                <span className="text-bharati-ash block text-[11px]">First / Last Order</span>
                <span className="font-medium text-bharati-charcoal text-xs mt-0.5 block">
                  {financialSummary.firstOrderDate
                    ? new Date(financialSummary.firstOrderDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                  {" / "}
                  {financialSummary.lastOrderDate
                    ? new Date(financialSummary.lastOrderDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                <span className="text-[10px] text-bharati-silver">Order history range</span>
              </div>
            </div>
          </div>

          {/* Complete Customer Order History Card */}
          <div className="bg-white rounded-lg border border-bharati-mist shadow-xs overflow-hidden">
            <div className="p-5 border-b border-bharati-mist bg-bharati-cream/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={18} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal">
                  Complete Order History ({orders.length})
                </h2>
              </div>
              <span className="text-xs text-bharati-ash font-medium">
                {orders.length} historical record{orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-bharati-ash space-y-2">
                <ShoppingBag size={32} className="mx-auto text-bharati-silver stroke-1 mb-1" />
                <p className="font-medium text-bharati-charcoal text-sm">No orders placed yet</p>
                <p className="text-xs text-bharati-silver max-w-sm mx-auto">
                  This customer has registered and verified their mobile number, but has not completed any purchases yet.
                </p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bharati-cream/50 text-bharati-charcoal font-medium border-b border-bharati-mist text-xs">
                      <tr>
                        <th className="px-5 py-3">Order #</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Items</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Payment</th>
                        <th className="px-5 py-3">Destination</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bharati-mist/60 text-xs">
                      {currentOrdersSlice.map((o) => {
                        const formattedDate = o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—";

                        return (
                          <tr
                            key={o.id}
                            className="hover:bg-bharati-cream/20 transition-colors"
                          >
                            {/* Order Number */}
                            <td className="px-5 py-3.5 font-medium text-bharati-black font-mono">
                              <Link
                                href={`/admin/orders/${o.id}`}
                                className="text-bharati-mint-dark hover:underline flex items-center gap-1"
                              >
                                <span>#{o.orderNumber}</span>
                                <ExternalLink size={11} className="opacity-70" />
                              </Link>
                            </td>

                            {/* Order Date */}
                            <td className="px-5 py-3.5 text-bharati-charcoal whitespace-nowrap">
                              {formattedDate}
                            </td>

                            {/* Items Count */}
                            <td className="px-5 py-3.5 text-bharati-ash">
                              {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                            </td>

                            {/* Order Total */}
                            <td className="px-5 py-3.5 font-semibold text-bharati-black whitespace-nowrap">
                              ₹{Number(o.total || 0).toLocaleString("en-IN")}
                            </td>

                            {/* Order Status Badge */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                                  statusBadgeStyles[o.status] ||
                                  "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {o.status.replace(/_/g, " ")}
                              </span>
                            </td>

                            {/* Payment Method & Status */}
                            <td className="px-5 py-3.5 whitespace-nowrap space-y-0.5">
                              <div className="font-medium text-bharati-charcoal text-[11px]">
                                {o.paymentMethod === "ONLINE_RAZORPAY"
                                  ? "Online (Razorpay)"
                                  : o.paymentMethod || "COD"}
                              </div>
                              <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-medium uppercase ${
                                  o.paymentStatus === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : o.paymentStatus === "PENDING"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {o.paymentStatus ? o.paymentStatus.replace(/_/g, " ") : "UNPAID"}
                              </span>
                            </td>

                            {/* Destination */}
                            <td className="px-5 py-3.5 text-bharati-ash">
                              {o.shippingCity || o.shippingState ? (
                                <span className="inline-flex items-center gap-1 text-[11px]">
                                  <MapPin size={11} className="text-bharati-silver shrink-0" />
                                  <span>
                                    {[o.shippingCity, o.shippingState].filter(Boolean).join(", ")}
                                  </span>
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>

                            {/* Action to Order Detail */}
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <Link
                                href={`/admin/orders/${o.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-bharati-black border border-bharati-mist rounded hover:bg-bharati-cream transition-colors"
                              >
                                <span>View</span>
                                <ExternalLink size={11} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Order Table Pagination Controls */}
                {totalOrderPages > 1 && (
                  <div className="p-4 border-t border-bharati-mist/60 bg-bharati-cream/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-bharati-ash">
                    <div>
                      Showing {orderPage * ordersPerPage + 1} to{" "}
                      {Math.min((orderPage + 1) * ordersPerPage, orders.length)} of{" "}
                      {orders.length} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOrderPage((p) => Math.max(0, p - 1))}
                        disabled={orderPage === 0}
                        className="px-2.5 py-1 border border-bharati-mist rounded bg-white text-bharati-charcoal hover:bg-bharati-cream transition-colors disabled:opacity-40 flex items-center gap-1"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                      </button>
                      <span className="font-medium text-bharati-charcoal px-2">
                        Page {orderPage + 1} of {totalOrderPages}
                      </span>
                      <button
                        onClick={() => setOrderPage((p) => Math.min(totalOrderPages - 1, p + 1))}
                        disabled={orderPage >= totalOrderPages - 1}
                        className="px-2.5 py-1 border border-bharati-mist rounded bg-white text-bharati-charcoal hover:bg-bharati-cream transition-colors disabled:opacity-40 flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Profile Details + Saved Addresses + Schema Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-bharati-mist/60">
              <div className="flex items-center gap-2 text-bharati-charcoal">
                <User size={17} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Profile Details
                </h2>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-bharati-cream border border-bharati-mist text-bharati-charcoal">
                {profile.type || "CUSTOMER"}
              </span>
            </div>

            <div className="text-xs space-y-3">
              {/* Full Name */}
              <div>
                <span className="text-bharati-ash block text-[11px]">Full Name</span>
                <span className="font-semibold text-bharati-black text-sm mt-0.5 block">
                  {profile.name || "Unnamed Customer"}
                </span>
              </div>

              {/* Full Phone */}
              <div>
                <span className="text-bharati-ash block text-[11px]">Primary Phone</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono text-sm text-bharati-charcoal font-medium">
                    {profile.phone || "—"}
                  </span>
                  {profile.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck size={11} />
                      Verified
                    </span>
                  ) : (
                    <span className="text-gray-500 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <span className="text-bharati-ash block text-[11px]">Email Address</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono text-xs text-bharati-charcoal break-all">
                    {profile.email || <span className="text-bharati-silver">No email registered</span>}
                  </span>
                  {profile.emailVerified && (
                    <span className="inline-flex items-center gap-1 text-blue-700 text-[10px] font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Registration Timestamp */}
              <div>
                <span className="text-bharati-ash block text-[11px]">Registration Date</span>
                <span className="text-bharati-charcoal mt-0.5 block">
                  {formattedRegistrationDateTime}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Delivery Addresses Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-bharati-mist/60">
              <div className="flex items-center gap-2 text-bharati-charcoal">
                <MapPin size={17} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Saved Delivery Addresses ({savedAddresses?.length || 0})
                </h2>
              </div>
            </div>

            {!savedAddresses || savedAddresses.length === 0 ? (
              <div className="py-6 text-center text-xs text-bharati-ash space-y-1">
                <MapPin size={22} className="mx-auto text-bharati-silver stroke-1 mb-1" />
                <p className="font-medium text-bharati-charcoal">No saved delivery addresses</p>
                <p className="text-[11px] text-bharati-silver">
                  Customer has not saved any address to their account profile yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                      addr.isDefault
                        ? "bg-emerald-50/30 border-emerald-300"
                        : "bg-bharati-cream/20 border-bharati-mist"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-bharati-charcoal uppercase tracking-wider text-[11px]">
                        {addr.label || "Delivery Address"}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Default Address
                        </span>
                      )}
                    </div>

                    <div className="text-bharati-charcoal leading-relaxed">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p className="font-medium mt-0.5">
                        {addr.city}, {addr.state} —{" "}
                        <span className="font-mono text-[11px]">{addr.pincode}</span>
                      </p>
                      <p className="text-[10px] text-bharati-silver uppercase mt-0.5">
                        {addr.country || "India"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-1 text-[11px] text-bharati-silver italic leading-normal border-t border-bharati-mist/40">
              Note: Saved addresses reflect the customer&apos;s current account profile. Historical orders preserve their own immutable shipping address snapshots.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
