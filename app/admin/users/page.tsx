"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  RefreshCw,
  UserCheck,
  Search,
  X,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  adminFetchCustomers,
  adminFetchCustomerStats,
  AdminCustomerSummary,
  AdminCustomerStats,
  CustomerSegment,
  PagedCustomerResponse,
} from "@/app/lib/admin-api";
import { getSessionCache, setSessionCache, CACHE_KEYS } from "@/app/lib/cache";
import { useToast } from "@/app/admin/ToastContext";

const SEGMENT_TABS: { label: string; value: CustomerSegment }[] = [
  { label: "All Customers", value: "ALL" },
  { label: "Prospects", value: "PROSPECT" },
  { label: "First-Time", value: "FIRST_TIME_BUYER" },
  { label: "Repeat Buyers", value: "REPEAT_BUYER" },
  { label: "VIP", value: "VIP" },
];

const SORT_OPTIONS = [
  { label: "Newest Registered", sortBy: "createdAt", sortDir: "desc" },
  { label: "Oldest Registered", sortBy: "createdAt", sortDir: "asc" },
  { label: "Highest Spend", sortBy: "totalSpend", sortDir: "desc" },
  { label: "Most Orders", sortBy: "totalOrders", sortDir: "desc" },
  { label: "Most Recent Order", sortBy: "lastOrderDate", sortDir: "desc" },
  { label: "Name (A–Z)", sortBy: "name", sortDir: "asc" },
];

const segmentBadgeStyles: Record<CustomerSegment, string> = {
  ALL: "bg-gray-100 text-gray-700 border-gray-200",
  PROSPECT: "bg-gray-100 text-gray-700 border-gray-200",
  FIRST_TIME_BUYER: "bg-blue-50 text-blue-700 border-blue-200",
  REPEAT_BUYER: "bg-emerald-50 text-emerald-800 border-emerald-200",
  VIP: "bg-purple-50 text-purple-800 border-purple-200",
};

const segmentDisplayNames: Record<CustomerSegment, string> = {
  ALL: "All",
  PROSPECT: "Prospect",
  FIRST_TIME_BUYER: "First-Time",
  REPEAT_BUYER: "Repeat Buyer",
  VIP: "VIP Customer",
};

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminCustomersPage() {
  const { showToast } = useToast();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("ALL");
  const [sortIndex, setSortIndex] = useState(0); // Default: Newest Registered
  const [page, setPage] = useState(0);

  // Data states
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [stats, setStats] = useState<AdminCustomerStats | null>(() => {
    return getSessionCache<AdminCustomerStats>(CACHE_KEYS.ADMIN_CUSTOMER_STATS);
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Network & UI states
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(!stats);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const hasLoadedCustomersRef = useRef(false);

  // Cache key generator for directory queries
  const getCacheKey = useCallback(
    (p: number, s: string, seg: string, sortIdx: number) => {
      const selectedSort = SORT_OPTIONS[sortIdx] || SORT_OPTIONS[0];
      return `${CACHE_KEYS.ADMIN_CUSTOMERS}_p${p}_s${s}_seg${seg}_sort${selectedSort.sortBy}_${selectedSort.sortDir}`;
    },
    []
  );

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Initial stats load
  useEffect(() => {
    let ignore = false;
    adminFetchCustomerStats()
      .then((res) => {
        if (!ignore && res?.data) {
          setStats(res.data);
          setSessionCache(CACHE_KEYS.ADMIN_CUSTOMER_STATS, res.data);
          setStatsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to load customer statistics:", err);
          setStatsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Directory page change effect
  useEffect(() => {
    let ignore = false;
    const term = debouncedSearch.trim();
    const sortOpt = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
    const cacheKey = getCacheKey(page, term.toLowerCase(), segment, sortIndex);
    const requestId = ++requestIdRef.current;

    adminFetchCustomers(term, segment, page, 20, sortOpt.sortBy, sortOpt.sortDir)
      .then((res) => {
        if (ignore || requestId !== requestIdRef.current) return;
        const data: PagedCustomerResponse = res.data;
        hasLoadedCustomersRef.current = true;
        setCustomers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setSessionCache(cacheKey, data);
        setSyncStatus("synced");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore || requestId !== requestIdRef.current) return;
        const msg = err instanceof Error ? err.message : "Failed to load customers. Please verify your connection.";
        console.error("Failed to fetch customers:", err);
        setErrorMessage(msg);
        setSyncStatus("idle");
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, segment, sortIndex, getCacheKey]);

  // Imperative data reloader for user actions
  const executeReload = async () => {
    setSyncStatus("syncing");
    setStatsLoading(true);
    setErrorMessage(null);
    try {
      const term = debouncedSearch.trim();
      const sortOpt = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
      const cacheKey = getCacheKey(page, term.toLowerCase(), segment, sortIndex);
      const requestId = ++requestIdRef.current;

      const [statsRes, custRes] = await Promise.all([
        adminFetchCustomerStats(),
        adminFetchCustomers(term, segment, page, 20, sortOpt.sortBy, sortOpt.sortDir),
      ]);

      if (requestId !== requestIdRef.current) return;

      if (statsRes?.data) {
        setStats(statsRes.data);
        setSessionCache(CACHE_KEYS.ADMIN_CUSTOMER_STATS, statsRes.data);
      }

      if (custRes?.data) {
        const data: PagedCustomerResponse = custRes.data;
        hasLoadedCustomersRef.current = true;
        setCustomers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setSessionCache(cacheKey, data);
      }

      setSyncStatus("synced");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refresh customer directory.";
      console.error("Failed to refresh:", err);
      setErrorMessage(msg);
      setSyncStatus("idle");
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    await executeReload();
    showToast("Customers directory refreshed", "info");
  };

  // Change segment filter
  const handleSegmentChange = (newSegment: CustomerSegment) => {
    if (newSegment === segment) return;
    setSegment(newSegment);
    setPage(0);
  };

  // Change sort selection
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = Number(e.target.value);
    setSortIndex(newIndex);
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
  };

  const handleRetry = async () => {
    await executeReload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-md hover:bg-bharati-ivory text-bharati-ash hover:text-bharati-black transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-light text-bharati-black tracking-wide">
                Customers
              </h1>
              {syncStatus === "syncing" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Syncing...
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Synced
                </span>
              )}
            </div>
            <p className="text-sm text-bharati-ash mt-0.5">
              {totalElements} registered customer{totalElements !== 1 ? "s" : ""}
              {segment !== "ALL" ? ` · ${segmentDisplayNames[segment]}` : ""}
              {debouncedSearch.trim() ? ` matching "${debouncedSearch.trim()}"` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={syncStatus === "syncing"}
          className="flex items-center gap-2 px-4 py-2 text-sm text-bharati-ash hover:text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors disabled:opacity-50 self-start sm:self-auto"
          title="Refresh Customer Directory"
        >
          <RefreshCw
            size={16}
            className={syncStatus === "syncing" ? "animate-spin text-bharati-mint-dark" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-lg border border-bharati-mist p-5 flex items-start gap-4 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Users size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-bharati-ash font-medium uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-xl font-semibold text-bharati-black mt-1">
              {statsLoading ? "—" : Number(stats?.totalCustomers ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-bharati-silver mt-0.5">Verified Indian Mobile</p>
          </div>
        </div>

        {/* Active Buyers */}
        <div className="bg-white rounded-lg border border-bharati-mist p-5 flex items-start gap-4 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-bharati-ash font-medium uppercase tracking-wider">
              Active Buyers
            </p>
            <p className="text-xl font-semibold text-bharati-black mt-1">
              {statsLoading ? "—" : Number(stats?.totalActiveBuyers ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {stats && stats.totalCustomers > 0
                ? `${Math.round((stats.totalActiveBuyers / stats.totalCustomers) * 100)}% Conversion`
                : "1+ completed purchase"}
            </p>
          </div>
        </div>

        {/* Repeat Buyers */}
        <div className="bg-white rounded-lg border border-bharati-mist p-5 flex items-start gap-4 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <RefreshCw size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-bharati-ash font-medium uppercase tracking-wider">
              Repeat Buyers
            </p>
            <p className="text-xl font-semibold text-bharati-black mt-1">
              {statsLoading ? "—" : Number(stats?.totalRepeatBuyers ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              {stats && stats.totalActiveBuyers > 0
                ? `${Math.round((stats.totalRepeatBuyers / stats.totalActiveBuyers) * 100)}% of Buyers`
                : "2+ completed purchases"}
            </p>
          </div>
        </div>

        {/* Prospects */}
        <div className="bg-white rounded-lg border border-bharati-mist p-5 flex items-start gap-4 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <UserCheck size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-bharati-ash font-medium uppercase tracking-wider">
              Prospects
            </p>
            <p className="text-xl font-semibold text-bharati-black mt-1">
              {statsLoading ? "—" : Number(stats?.totalProspects ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              0 qualifying purchases
            </p>
          </div>
        </div>
      </div>

      {/* Search, Filter Pills & Sorting Controls */}
      <div className="bg-white rounded-lg p-4 border border-bharati-mist shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Debounced Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by customer name, phone, or email..."
              className="w-full pl-10 pr-9 py-2 text-sm border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bharati-ash hover:text-bharati-black p-0.5"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-bharati-ash font-medium whitespace-nowrap hidden sm:inline">
              Sort by:
            </span>
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortIndex}
                onChange={handleSortChange}
                className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={opt.label} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Segment Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-bharati-mist/60">
          <span className="text-xs text-bharati-ash font-medium mr-1.5">Segment:</span>
          {SEGMENT_TABS.map((tab) => {
            const isSelected = segment === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleSegmentChange(tab.value)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  isSelected
                    ? "bg-bharati-black text-white border-bharati-black font-medium"
                    : "bg-white text-bharati-charcoal border-bharati-mist hover:bg-bharati-ivory hover:border-bharati-ash"
                }`}
              >
                {tab.label}
                {tab.value === "VIP" && stats && stats.totalVipCustomers > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-black font-bold">
                    {stats.totalVipCustomers}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-bharati-mist overflow-hidden">
        {errorMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-xs font-medium text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-cream transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-bharati-cream text-bharati-charcoal font-medium border-b border-bharati-mist">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Mobile</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5">Orders</th>
                  <th className="px-6 py-3.5">Financial Summary</th>
                  <th className="px-6 py-3.5">Last Order</th>
                  <th className="px-6 py-3.5">Segment</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bharati-mist">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-bharati-ash">
                      <RefreshCw size={22} className="animate-spin inline-block mr-2.5 text-bharati-mint-dark" />
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-bharati-ash space-y-2">
                      <Users size={28} className="mx-auto text-bharati-silver stroke-1 mb-2" />
                      <p className="font-medium text-bharati-charcoal">
                        {debouncedSearch.trim()
                          ? `No customers found matching "${debouncedSearch.trim()}"`
                          : segment !== "ALL"
                          ? `No customers found in segment "${segmentDisplayNames[segment]}"`
                          : "No customer records exist yet"}
                      </p>
                      {(debouncedSearch.trim() || segment !== "ALL") && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setDebouncedSearch("");
                            setSegment("ALL");
                            setPage(0);
                          }}
                          className="mt-2 text-xs text-bharati-mint-dark hover:underline font-medium"
                        >
                          Clear filters and search
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const hasQualifying = c.qualifyingOrders > 0;
                    const hasCancelled = c.cancelledOrdersCount > 0;
                    const hasInFlightCod = c.inFlightCodTotal > 0;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-bharati-cream/40 transition-colors group"
                      >
                        {/* Customer Name & Email */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-bharati-black group-hover:text-bharati-mint-dark transition-colors">
                            {c.name || "Bharati Customer"}
                          </div>
                          <div className="text-xs text-bharati-ash font-mono mt-0.5 truncate max-w-[200px]">
                            {c.email || "—"}
                          </div>
                        </td>

                        {/* Mobile Number & Trust Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-bharati-charcoal font-medium">
                              {c.phone}
                            </span>
                            {c.phoneVerified && (
                              <span title="Phone verified via OTP" className="inline-flex">
                                <ShieldCheck
                                  size={14}
                                  className="text-emerald-600 shrink-0"
                                />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-bharati-ash">
                          {formatDate(c.createdAt)}
                        </td>

                        {/* Order Count Badges */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-bharati-ivory text-bharati-charcoal border border-bharati-mist">
                            {c.totalOrders} {c.totalOrders === 1 ? "order" : "orders"}
                          </span>
                          {hasCancelled && (
                            <span className="block text-[11px] text-red-600 mt-1 font-mono">
                              {c.cancelledOrdersCount} cancelled
                            </span>
                          )}
                        </td>

                        {/* Financial Summary */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-bharati-black">
                            ₹{Number(c.totalQualifyingSpend).toLocaleString("en-IN")}
                          </div>
                          <div className="text-[11px] space-y-0.5 mt-1 font-mono">
                            {Number(c.collectedOnlineTotal) > 0 && (
                              <span className="block text-emerald-700">
                                • Online (Paid): ₹{Number(c.collectedOnlineTotal).toLocaleString("en-IN")}
                              </span>
                            )}
                            {Number(c.deliveredCodTotal) > 0 && (
                              <span className="block text-bharati-charcoal" title="Courier marked delivered">
                                • COD Deliv: ₹{Number(c.deliveredCodTotal).toLocaleString("en-IN")}
                              </span>
                            )}
                            {hasInFlightCod && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 font-sans">
                                In-Transit COD: ₹{Number(c.inFlightCodTotal).toLocaleString("en-IN")}
                              </span>
                            )}
                            {!hasQualifying && (
                              <span className="text-bharati-silver text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Last Order Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-bharati-ash">
                          {formatDate(c.lastOrderDate)}
                        </td>

                        {/* Segment Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              segmentBadgeStyles[c.segment] || segmentBadgeStyles.ALL
                            }`}
                          >
                            {c.segment === "VIP" && <Sparkles size={11} className="text-purple-600" />}
                            {segmentDisplayNames[c.segment] || c.segment}
                          </span>
                        </td>

                        {/* Row Action: Navigate to Profile */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/users/${c.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-bharati-charcoal bg-bharati-ivory hover:bg-bharati-black hover:text-white rounded-md border border-bharati-mist transition-all shadow-2xs"
                          >
                            <span>Profile</span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-bharati-mist flex items-center justify-between">
            <span className="text-xs text-bharati-ash">
              Showing{" "}
              <strong className="text-bharati-charcoal">
                {page * 20 + 1}–{Math.min((page + 1) * 20, totalElements)}
              </strong>{" "}
              of <strong className="text-bharati-charcoal">{totalElements}</strong> customers
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="px-3 py-1.5 border border-bharati-mist rounded-md text-xs font-medium text-bharati-charcoal hover:bg-bharati-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-bharati-ash px-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="px-3 py-1.5 border border-bharati-mist rounded-md text-xs font-medium text-bharati-charcoal hover:bg-bharati-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
