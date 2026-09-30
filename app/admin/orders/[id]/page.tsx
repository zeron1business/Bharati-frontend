"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  User,
  CreditCard,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { adminFetchOrderDetails, adminUpdateOrderStatus } from "@/app/lib/admin-api";
import { clearSessionCacheByPrefix, CACHE_KEYS } from "@/app/lib/cache";
import { useToast } from "@/app/admin/ToastContext";

interface CustomerSummary {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  type: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface ShippingAddress {
  name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface OrderItem {
  id: string;
  productId?: string;
  productSlug?: string;
  titleSnapshot: string;
  skuSnapshot?: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
  productImageUrl?: string;
  volumeLitres?: number;
  inductionCompatible?: boolean;
  materialType?: string;
}

interface PaymentSummary {
  id?: string;
  method: string;
  status: string;
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: string;
}

interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  customer?: CustomerSummary;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payment?: PaymentSummary | null;
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

// Lifecycle steps for the non-fabricated visual stepper
const LIFECYCLE_STAGES = [
  { key: "CREATED", label: "Placed" },
  { key: "PAID_OR_CONFIRMED", label: "Confirmed / Paid" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

function getLifecycleProgress(status: string): number {
  switch (status) {
    case "CREATED":
    case "PAYMENT_PENDING":
      return 0;
    case "PAID":
    case "CONFIRMED":
      return 1;
    case "SHIPPED":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return -1; // CANCELLED or other terminal/unknown
  }
}

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { showToast } = useToast();
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError("");

    try {
      const res = await adminFetchOrderDetails(orderId);
      setOrder(res.data);
    } catch (err: any) {
      console.error("Failed to load order details:", err);
      setError(err.message || "Failed to load order details.");
      showToast(err.message || "Failed to load order details.", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || order.status === newStatus) return;

    setIsUpdatingStatus(true);
    try {
      await adminUpdateOrderStatus(order.id, newStatus);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      clearSessionCacheByPrefix(CACHE_KEYS.ADMIN_ORDERS);
      showToast(
        `Order #${order.orderNumber} updated to ${newStatus.replace(/_/g, " ")}.`,
        "success"
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err.message || "Failed to update order status.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={26} className="animate-spin text-bharati-mint-dark" />
        <p className="text-xs uppercase tracking-wider text-bharati-ash font-medium">
          Loading order overview...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle size={26} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-bharati-black">Order Not Found</h2>
          <p className="text-sm text-bharati-ash leading-relaxed">
            {error || "The requested order could not be located in the database."}
          </p>
          <p className="text-xs font-mono text-bharati-silver">ID: {orderId}</p>
        </div>
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = getLifecycleProgress(order.status);
  const isCancelled = order.status === "CANCELLED";

  const formattedCreatedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const formattedUpdatedAt = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="p-2 rounded-md hover:bg-bharati-ivory text-bharati-ash hover:text-bharati-black transition-colors"
              title="Back to Orders list"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-light text-bharati-black tracking-wide">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                statusBadgeStyles[order.status] ||
                "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-bharati-ash pl-11">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-bharati-silver" />
              Placed on {formattedCreatedAt}
            </span>
            {formattedUpdatedAt && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-bharati-silver" />
                  Last updated on {formattedUpdatedAt}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Header Actions: Status Changer & Refresh */}
        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-bharati-mist rounded-md shadow-xs">
            <span className="text-xs text-bharati-ash font-medium">Status:</span>
            <div className="relative inline-block">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="appearance-none pl-2 pr-7 py-1 text-xs font-medium text-bharati-charcoal bg-transparent focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none"
              />
            </div>
            {isUpdatingStatus && (
              <RefreshCw size={12} className="animate-spin text-bharati-mint-dark" />
            )}
          </div>

          <button
            onClick={() => loadOrder(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors disabled:opacity-50"
            title="Refresh order details"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin text-bharati-mint-dark" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Progress Stepper (Non-fabricated) */}
      <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs">
        {isCancelled ? (
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-xs font-medium">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <div>
              <span>This order has been CANCELLED.</span>
              {formattedUpdatedAt && (
                <span className="text-red-700/80 ml-1">
                  Status transition recorded at {formattedUpdatedAt}.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-bharati-ash font-medium pb-1 border-b border-bharati-mist/40">
              <span className="uppercase tracking-wider">Order Lifecycle</span>
              <span className="text-[11px] text-bharati-silver">
                Current State: <strong className="text-bharati-charcoal font-semibold">{order.status.replace(/_/g, " ")}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-md border transition-all ${
                      isCurrent
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-xs"
                        : isPassed
                        ? "bg-bharati-cream/40 border-bharati-mist text-bharati-charcoal"
                        : "bg-gray-50/40 border-gray-200/60 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? "bg-emerald-600 text-white"
                            : isPassed
                            ? "bg-bharati-charcoal text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 size={12} /> : idx + 1}
                      </div>
                      <span className="text-xs font-medium tracking-tight">
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column (Items + Shipping) & Right Column (Summary + Customer + Payment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items Card */}
          <div className="bg-white rounded-lg border border-bharati-mist shadow-xs overflow-hidden">
            <div className="p-5 border-b border-bharati-mist bg-bharati-cream/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package size={18} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal">
                  Purchased Items ({order.items.length})
                </h2>
              </div>
              <span className="text-xs text-bharati-ash font-mono">
                {order.items.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} unit(s)
              </span>
            </div>

            <div className="divide-y divide-bharati-mist/60">
              {order.items.length === 0 ? (
                <div className="p-8 text-center text-sm text-bharati-ash">
                  No items listed for this order.
                </div>
              ) : (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bharati-cream/20 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative w-16 h-16 rounded-md bg-bharati-ivory border border-bharati-mist overflow-hidden shrink-0">
                        <Image
                          src={item.productImageUrl || "/products/cooker_cutout.png"}
                          alt={item.titleSnapshot}
                          fill
                          unoptimized={Boolean(item.productImageUrl?.startsWith("http"))}
                          className="object-contain p-1.5"
                          sizes="64px"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-bharati-black">
                            {item.titleSnapshot}
                          </h3>
                          {item.productSlug && (
                            <Link
                              href={`/products/${item.productSlug}`}
                              target="_blank"
                              className="text-bharati-silver hover:text-bharati-charcoal transition-colors"
                              title="Open public product page"
                            >
                              <ExternalLink size={13} />
                            </Link>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bharati-ash font-mono">
                          {item.skuSnapshot && (
                            <span>SKU: {item.skuSnapshot}</span>
                          )}
                          {item.volumeLitres && (
                            <>
                              <span>•</span>
                              <span>{item.volumeLitres}L</span>
                            </>
                          )}
                          {item.inductionCompatible !== undefined && (
                            <>
                              <span>•</span>
                              <span>
                                {item.inductionCompatible
                                  ? "Induction"
                                  : "Non-Induction"}
                              </span>
                            </>
                          )}
                          {item.materialType && (
                            <>
                              <span>•</span>
                              <span>{item.materialType}</span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-bharati-silver pt-0.5">
                          Qty: <strong className="text-bharati-charcoal">{item.quantity}</strong> &times; ₹{Number(item.priceSnapshot).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right sm:self-center shrink-0">
                      <span className="text-sm font-semibold text-bharati-black block">
                        ₹{Number(item.lineTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shipping Address Card (Immutable Snapshot) */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-bharati-mist/60">
              <div className="flex items-center gap-2 text-bharati-charcoal">
                <MapPin size={17} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Shipping Details
                </h2>
              </div>
              <span className="text-[11px] text-bharati-ash bg-bharati-cream px-2 py-0.5 rounded border border-bharati-mist/80">
                Checkout Snapshot
              </span>
            </div>

            <div className="text-sm text-bharati-charcoal space-y-1 leading-relaxed">
              <p className="font-semibold text-bharati-black">
                {order.shippingAddress.name || "Customer"}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-xs text-bharati-ash font-mono">
                  Phone: +91 {order.shippingAddress.phone}
                </p>
              )}
              <div className="text-xs text-bharati-charcoal pt-1 space-y-0.5">
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                  <span className="font-mono font-medium">
                    {order.shippingAddress.pincode}
                  </span>
                </p>
                <p className="text-bharati-ash text-[11px]">
                  {order.shippingAddress.country || "India"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-bharati-charcoal">
                <span className="text-bharati-ash">Subtotal</span>
                <span className="font-medium">
                  ₹{Number(order.subtotal).toLocaleString("en-IN")}
                </span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-bharati-charcoal">
                <span className="text-bharati-ash">Shipping</span>
                <span>
                  {Number(order.shippingFee) > 0 ? (
                    `₹${Number(order.shippingFee).toLocaleString("en-IN")}`
                  ) : (
                    <span className="text-emerald-700 font-medium uppercase text-[11px]">
                      FREE
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-bharati-charcoal">
                <span className="text-bharati-ash">Tax</span>
                <span className="text-bharati-silver">
                  {Number(order.tax) > 0
                    ? `₹${Number(order.tax).toLocaleString("en-IN")}`
                    : "Included"}
                </span>
              </div>

              <div className="pt-3 border-t border-bharati-mist flex justify-between items-baseline">
                <span className="text-sm font-medium text-bharati-black">
                  Total Payable
                </span>
                <span className="text-xl font-bold text-bharati-black">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-bharati-mist/60">
              <div className="flex items-center gap-2 text-bharati-charcoal">
                <User size={17} className="text-bharati-mint-dark" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Customer Information
                </h2>
              </div>
              {order.customer?.type && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-bharati-cream border border-bharati-mist text-bharati-charcoal">
                  {order.customer.type}
                </span>
              )}
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-bharati-ash block text-[11px]">Name</span>
                <span className="font-medium text-bharati-black text-sm">
                  {order.customer?.name || order.shippingAddress.name || "—"}
                </span>
              </div>

              <div>
                <span className="text-bharati-ash block text-[11px]">Email</span>
                <span className="text-bharati-charcoal font-mono break-all">
                  {order.customer?.email || "—"}
                </span>
              </div>

              <div>
                <span className="text-bharati-ash block text-[11px]">Phone</span>
                <span className="text-bharati-charcoal font-mono">
                  {order.customer?.phone || order.shippingAddress.phone || "—"}
                </span>
              </div>

              {order.customer?.phoneVerified && (
                <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] pt-1">
                  <ShieldCheck size={13} />
                  <span>Phone Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-white rounded-lg p-5 border border-bharati-mist shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-bharati-mist/60 text-bharati-charcoal">
              <CreditCard size={17} className="text-bharati-mint-dark" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Payment Details
              </h2>
            </div>

            {order.payment ? (
              <div className="text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-bharati-ash">Method</span>
                  <span className="font-medium text-bharati-charcoal uppercase">
                    {order.payment.method === "ONLINE_RAZORPAY"
                      ? "Online (Razorpay)"
                      : order.payment.method || "COD"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-bharati-ash">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                      order.payment.status === "CAPTURED" || order.payment.status === "PAID"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : order.payment.status === "COD_PENDING"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-bharati-ash">Amount</span>
                  <span className="font-semibold text-bharati-black">
                    ₹{Number(order.payment.amount).toLocaleString("en-IN")}
                  </span>
                </div>

                {order.payment.razorpayOrderId && (
                  <div className="pt-2 border-t border-bharati-mist/60 space-y-1">
                    <span className="text-bharati-ash block text-[11px]">
                      Razorpay Order ID
                    </span>
                    <span className="font-mono text-[11px] text-bharati-charcoal break-all block bg-bharati-cream/50 p-1.5 rounded border border-bharati-mist/40">
                      {order.payment.razorpayOrderId}
                    </span>
                  </div>
                )}

                {order.payment.razorpayPaymentId && (
                  <div className="space-y-1">
                    <span className="text-bharati-ash block text-[11px]">
                      Razorpay Payment ID
                    </span>
                    <span className="font-mono text-[11px] text-bharati-charcoal break-all block bg-bharati-cream/50 p-1.5 rounded border border-bharati-mist/40">
                      {order.payment.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-bharati-ash py-2">
                No payment transaction record found for this order.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
