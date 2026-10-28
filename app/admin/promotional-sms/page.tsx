"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  FolderOpen,
  Send,
  Save,
  ShieldCheck,
  Info,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  adminFetchCustomers,
  adminFetchCustomerStats,
  AdminCustomerSummary,
  AdminCustomerStats,
  CustomerSegment,
  adminFetchSmsProviderStatus,
  adminFetchSmsCampaigns,
  adminFetchSmsCampaignDetail,
  adminCreateSmsCampaign,
  adminUpdateSmsCampaign,
  adminDeleteSmsCampaign,
  SmsProviderStatus,
  SmsCampaignSummary,
  SmsSelectionMode,
} from "@/app/lib/admin-api";
import { useToast } from "@/app/admin/ToastContext";
import { analyzeSms, SmsAnalysis } from "./utils/smsEncoding";

const SEGMENT_OPTIONS: { label: string; value: CustomerSegment; desc: string }[] = [
  { label: "All Customers", value: "ALL", desc: "All verified customers across every lifecycle stage" },
  { label: "Prospects", value: "PROSPECT", desc: "Verified registered users with 0 completed purchases" },
  { label: "First-Time Buyers", value: "FIRST_TIME_BUYER", desc: "Customers with exactly 1 completed purchase" },
  { label: "Repeat Buyers", value: "REPEAT_BUYER", desc: "Loyal customers with 2 or more qualifying purchases" },
  { label: "VIP Customers", value: "VIP", desc: "High-value customers with spend >= ₹15,000" },
];

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function AdminPromotionalSmsPage() {
  const { showToast } = useToast();

  // --- Provider & System Status ---
  const [providerStatus, setProviderStatus] = useState<SmsProviderStatus | null>(null);

  // --- Campaign Composer Form State ---
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectionMode, setSelectionMode] = useState<SmsSelectionMode>("SPECIFIC_CUSTOMERS");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment>("ALL");
  const [isSaving, setIsSaving] = useState(false);

  // --- Specific Customer Selection State (Cross-page persistence) ---
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [selectedCustomersMap, setSelectedCustomersMap] = useState<
    Map<string, { id: string; name: string; phone: string; segment: string }>
  >(new Map());

  // --- Customer Directory Table State ---
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableSegment, setTableSegment] = useState<CustomerSegment>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // --- Segment Aggregate Estimates (Stats) ---
  const [stats, setStats] = useState<AdminCustomerStats | null>(null);

  // --- Drafts History Drawer & Management ---
  const [drafts, setDrafts] = useState<SmsCampaignSummary[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Analysis & Validation ---
  const smsAnalysis: SmsAnalysis = analyzeSms(messageBody);
  const isMessageOversized = smsAnalysis.charCount > 1000;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Initial Data Load
  useEffect(() => {
    let ignore = false;

    adminFetchSmsProviderStatus()
      .then((res) => {
        if (!ignore && res?.data) {
          setProviderStatus(res.data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.warn("Could not fetch SMS provider status:", err);
          setProviderStatus({
            providerConfigured: false,
            providerName: "NONE",
            message: "SMS delivery is currently disabled. No SMS provider is configured.",
          });
        }
      });

    adminFetchCustomerStats()
      .then((res) => {
        if (!ignore && res?.data) {
          setStats(res.data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.warn("Could not fetch customer stats for estimates:", err);
        }
      });

    adminFetchSmsCampaigns("DRAFT", 0, 50)
      .then((res) => {
        if (!ignore && res?.data?.content) {
          setDrafts(res.data.content);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to load drafts:", err);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Reload customer table when selectionMode, search, tableSegment, or page changes
  useEffect(() => {
    if (selectionMode !== "SPECIFIC_CUSTOMERS") return;

    let ignore = false;

    adminFetchCustomers(debouncedSearch.trim(), tableSegment, page, pageSize, "createdAt", "desc")
      .then((res) => {
        if (ignore) return;
        if (res?.data) {
          setCustomers(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        }
        setCustomerLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Failed to load customers for campaign selection:", err);
        setCustomerLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectionMode, debouncedSearch, tableSegment, page, pageSize]);

  // Refresh Drafts List
  const reloadDrafts = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const res = await adminFetchSmsCampaigns("DRAFT", 0, 50);
      if (res?.data?.content) {
        setDrafts(res.data.content);
      }
    } catch (err: unknown) {
      console.error("Failed to reload drafts:", err);
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  // --- Recipient Selection Handlers ---
  const handleToggleCustomer = (c: AdminCustomerSummary) => {
    if (!c.phoneVerified || !c.phone) {
      showToast("Cannot select: customer phone number is unverified", "error");
      return;
    }

    const nextSet = new Set(selectedCustomerIds);
    const nextMap = new Map(selectedCustomersMap);

    if (nextSet.has(c.id)) {
      nextSet.delete(c.id);
      nextMap.delete(c.id);
    } else {
      nextSet.add(c.id);
      nextMap.set(c.id, {
        id: c.id,
        name: c.name || "Customer",
        phone: c.phone,
        segment: c.segment,
      });
    }

    setSelectedCustomerIds(nextSet);
    setSelectedCustomersMap(nextMap);
  };

  const handleSelectCurrentPage = () => {
    const nextSet = new Set(selectedCustomerIds);
    const nextMap = new Map(selectedCustomersMap);
    let addedCount = 0;

    for (const c of customers) {
      if (c.phoneVerified && c.phone) {
        if (!nextSet.has(c.id)) {
          nextSet.add(c.id);
          nextMap.set(c.id, {
            id: c.id,
            name: c.name || "Customer",
            phone: c.phone,
            segment: c.segment,
          });
          addedCount++;
        }
      }
    }

    setSelectedCustomerIds(nextSet);
    setSelectedCustomersMap(nextMap);
    showToast(`Added ${addedCount} eligible customer${addedCount !== 1 ? "s" : ""} from current page`, "success");
  };

  const handleClearSelection = () => {
    setSelectedCustomerIds(new Set());
    setSelectedCustomersMap(new Map());
  };

  const handleRemoveSingleRecipient = (id: string) => {
    const nextSet = new Set(selectedCustomerIds);
    const nextMap = new Map(selectedCustomersMap);
    nextSet.delete(id);
    nextMap.delete(id);
    setSelectedCustomerIds(nextSet);
    setSelectedCustomersMap(nextMap);
  };

  // --- Segment Estimate Calculator ---
  const getEstimatedSegmentCount = (seg: CustomerSegment): number => {
    if (!stats) return 0;
    switch (seg) {
      case "ALL":
        return stats.totalCustomers;
      case "PROSPECT":
        return stats.totalProspects;
      case "FIRST_TIME_BUYER":
        return Math.max(0, stats.totalActiveBuyers - stats.totalRepeatBuyers);
      case "REPEAT_BUYER":
        return stats.totalRepeatBuyers;
      case "VIP":
        return stats.totalVipCustomers;
      default:
        return 0;
    }
  };

  // --- Campaign Draft CRUD Handlers ---
  const handleResetWorkspace = () => {
    setCampaignId(null);
    setTitle("");
    setMessageBody("");
    setSelectionMode("SPECIFIC_CUSTOMERS");
    setSegmentFilter("ALL");
    setSelectedCustomerIds(new Set());
    setSelectedCustomersMap(new Map());
    showToast("Workspace reset for new campaign draft", "info");
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      showToast("Please enter a campaign title", "error");
      return;
    }
    if (!messageBody.trim()) {
      showToast("Please enter an SMS message body", "error");
      return;
    }
    if (isMessageOversized) {
      showToast("Message exceeds the maximum limit of 1,000 characters", "error");
      return;
    }

    if (selectionMode === "SPECIFIC_CUSTOMERS" && selectedCustomerIds.size === 0) {
      showToast("Please select at least one eligible customer recipient", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        messageBody: messageBody.trim(),
        selectionMode,
        segmentFilter: selectionMode === "ALL_ELIGIBLE" ? segmentFilter : null,
        customerIds: selectionMode === "SPECIFIC_CUSTOMERS" ? Array.from(selectedCustomerIds) : null,
      };

      let response;
      if (campaignId) {
        response = await adminUpdateSmsCampaign(campaignId, payload);
        showToast("Campaign draft updated successfully", "success");
      } else {
        response = await adminCreateSmsCampaign(payload);
        if (response?.data?.id) {
          setCampaignId(response.data.id);
        }
        showToast("Campaign draft saved successfully", "success");
      }

      await reloadDrafts();
    } catch (err: unknown) {
      console.error("Failed to save campaign draft:", err);
      const msg = err instanceof Error ? err.message : "Failed to save campaign draft";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDraft = async (draftSummary: SmsCampaignSummary) => {
    try {
      setDraftsLoading(true);
      const res = await adminFetchSmsCampaignDetail(draftSummary.id);
      if (res?.data) {
        const detail = res.data;
        setCampaignId(detail.id);
        setTitle(detail.title);
        setMessageBody(detail.messageBody);
        setSelectionMode(detail.selectionMode);
        setSegmentFilter((detail.segmentFilter as CustomerSegment) || "ALL");

        // Populate recipient selections if specific mode
        const nextSet = new Set<string>();
        const nextMap = new Map<string, { id: string; name: string; phone: string; segment: string }>();

        if (detail.recipients && detail.recipients.length > 0) {
          for (const r of detail.recipients) {
            if (r.customerId) {
              nextSet.add(r.customerId);
              nextMap.set(r.customerId, {
                id: r.customerId,
                name: r.customerName,
                phone: r.maskedPhone,
                segment: "RECIPIENT",
              });
            }
          }
        }

        setSelectedCustomerIds(nextSet);
        setSelectedCustomersMap(nextMap);
        setShowDraftsDrawer(false);
        showToast(`Draft "${detail.title}" loaded into workspace`, "info");
      }
    } catch (err: unknown) {
      console.error("Failed to load draft detail:", err);
      const msg = err instanceof Error ? err.message : "Failed to open draft";
      showToast(msg, "error");
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    setIsDeleting(true);
    try {
      await adminDeleteSmsCampaign(id);
      showToast("Draft deleted successfully", "success");
      setDeletingDraftId(null);
      if (campaignId === id) {
        handleResetWorkspace();
      }
      await reloadDrafts();
    } catch (err: unknown) {
      console.error("Failed to delete draft:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete draft";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const allPageCustomersSelected =
    customers.length > 0 &&
    customers.every((c) => !c.phoneVerified || selectedCustomerIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ────────────────────────────────────────────── */}
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
              <h1 className="text-2xl font-light text-bharati-black tracking-wide flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-bharati-charcoal stroke-[1.5]" />
                Promotional SMS
              </h1>
              {campaignId && (
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Editing Draft
                </span>
              )}
            </div>
            <p className="text-sm text-bharati-ash mt-0.5">
              Target verified customers, compose promotional broadcasts, and manage campaign drafts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {campaignId && (
            <button
              onClick={handleResetWorkspace}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-bharati-charcoal border border-bharati-mist rounded-md hover:bg-white transition-colors"
            >
              <Plus size={14} />
              <span>New Draft</span>
            </button>
          )}

          <button
            onClick={() => setShowDraftsDrawer(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white text-bharati-black border border-bharati-mist rounded-md hover:bg-bharati-ivory transition-colors shadow-2xs"
          >
            <FolderOpen size={15} className="text-bharati-charcoal" />
            <span>Drafts History</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-bharati-ivory border border-bharati-mist text-bharati-charcoal">
              {drafts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Persistent SMS Provider Safety Notice ───────────────────────────── */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-2xs flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs leading-relaxed space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold text-amber-950 text-sm">
              SMS Delivery Disabled • Provider: {providerStatus?.providerName || "NONE"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-200/80 text-amber-900 border border-amber-300">
              Draft-Only Mode
            </span>
          </div>
          <p className="text-amber-800/90">
            {providerStatus?.message ||
              "SMS delivery is currently disabled because no SMS provider is configured. You can compose, save, and edit drafts. Live and simulated sending are completely disabled."}
          </p>
        </div>
      </div>

      {/* ── Main Workspace Grid (Desktop 2-Column Split) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LEFT PANEL: RECIPIENT SELECTION (Col 7 / 12)                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-bharati-mist shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-bharati-mist/60 pb-3.5">
            <div>
              <h2 className="text-base font-medium text-bharati-black flex items-center gap-2">
                <Users className="w-4 h-4 text-bharati-charcoal" />
                1. Target Audience Selection
              </h2>
              <p className="text-xs text-bharati-ash mt-0.5">
                Choose between selecting specific customers or targeting by customer segment
              </p>
            </div>
          </div>

          {/* Selection Mode Toggle Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                selectionMode === "SPECIFIC_CUSTOMERS"
                  ? "border-bharati-black bg-bharati-cream/30 ring-1 ring-bharati-black"
                  : "border-bharati-mist hover:border-bharati-ash bg-white"
              }`}
            >
              <input
                type="radio"
                name="selectionMode"
                value="SPECIFIC_CUSTOMERS"
                checked={selectionMode === "SPECIFIC_CUSTOMERS"}
                onChange={() => setSelectionMode("SPECIFIC_CUSTOMERS")}
                className="mt-1 accent-bharati-black"
              />
              <div>
                <p className="text-xs font-semibold text-bharati-black">Specific Customers</p>
                <p className="text-[11px] text-bharati-ash mt-0.5 leading-snug">
                  Search directory & pick specific individual recipients using checkboxes
                </p>
                {selectedCustomerIds.size > 0 && selectionMode === "SPECIFIC_CUSTOMERS" && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedCustomerIds.size} recipient{selectedCustomerIds.size !== 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
            </label>

            <label
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                selectionMode === "ALL_ELIGIBLE"
                  ? "border-bharati-black bg-bharati-cream/30 ring-1 ring-bharati-black"
                  : "border-bharati-mist hover:border-bharati-ash bg-white"
              }`}
            >
              <input
                type="radio"
                name="selectionMode"
                value="ALL_ELIGIBLE"
                checked={selectionMode === "ALL_ELIGIBLE"}
                onChange={() => setSelectionMode("ALL_ELIGIBLE")}
                className="mt-1 accent-bharati-black"
              />
              <div>
                <p className="text-xs font-semibold text-bharati-black">All Eligible Customers</p>
                <p className="text-[11px] text-bharati-ash mt-0.5 leading-snug">
                  Target all verified customers within a specific lifecycle segment
                </p>
                {selectionMode === "ALL_ELIGIBLE" && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Est: ~{getEstimatedSegmentCount(segmentFilter)} recipients
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* ── Mode A: Specific Customers View ─────────────────────────────── */}
          {selectionMode === "SPECIFIC_CUSTOMERS" && (
            <div className="space-y-3.5 pt-2">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-bharati-ash pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search customers by name, phone, email..."
                    className="w-full pl-8.5 pr-8 py-1.5 text-xs border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bharati-ash hover:text-bharati-black"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 justify-between sm:justify-end">
                  <button
                    type="button"
                    onClick={handleSelectCurrentPage}
                    disabled={customerLoading || customers.length === 0}
                    className="px-2.5 py-1.5 text-[11px] font-medium border border-bharati-mist rounded-md hover:bg-bharati-ivory text-bharati-charcoal transition-colors disabled:opacity-40"
                    title="Select all customers on current page"
                  >
                    Select page ({customers.length})
                  </button>

                  {selectedCustomerIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Clear all ({selectedCustomerIds.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Segment Filter Quick Pills for Table */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-bharati-ash font-medium text-[10px] uppercase tracking-wider mr-1">
                  Filter Table:
                </span>
                {(["ALL", "PROSPECT", "FIRST_TIME_BUYER", "REPEAT_BUYER", "VIP"] as CustomerSegment[]).map((seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => {
                      setTableSegment(seg);
                      setPage(0);
                    }}
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors ${
                      tableSegment === seg
                        ? "bg-bharati-black text-white border-bharati-black"
                        : "bg-white text-bharati-charcoal border-bharati-mist hover:bg-bharati-ivory"
                    }`}
                  >
                    {seg === "ALL" ? "All" : seg === "FIRST_TIME_BUYER" ? "First-Time" : seg === "REPEAT_BUYER" ? "Repeat" : seg}
                  </button>
                ))}
              </div>

              {/* Specific Customers Table */}
              <div className="border border-bharati-mist rounded-lg overflow-hidden bg-white">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bharati-cream/80 text-bharati-charcoal font-medium border-b border-bharati-mist sticky top-0 z-10">
                      <tr>
                        <th className="px-3.5 py-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={allPageCustomersSelected}
                            onChange={handleSelectCurrentPage}
                            aria-label="Select all customers on page"
                            className="accent-bharati-black cursor-pointer"
                          />
                        </th>
                        <th className="px-3 py-2.5">Customer</th>
                        <th className="px-3 py-2.5">Mobile</th>
                        <th className="px-3 py-2.5">Orders</th>
                        <th className="px-3 py-2.5">Segment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bharati-mist/60">
                      {customerLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-bharati-ash">
                            <RefreshCw size={18} className="animate-spin inline-block mr-2 text-bharati-mint-dark" />
                            Loading customers...
                          </td>
                        </tr>
                      ) : customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-bharati-ash space-y-1">
                            <Users size={22} className="mx-auto text-bharati-silver stroke-1 mb-1" />
                            <p className="font-medium text-bharati-charcoal">
                              {debouncedSearch ? `No customers match "${debouncedSearch}"` : "No customers available"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => {
                          const isSelected = selectedCustomerIds.has(c.id);
                          const isEligible = c.phoneVerified && Boolean(c.phone);

                          return (
                            <tr
                              key={c.id}
                              onClick={() => handleToggleCustomer(c)}
                              className={`transition-colors cursor-pointer select-none ${
                                isSelected
                                  ? "bg-bharati-mint/10 hover:bg-bharati-mint/15"
                                  : "hover:bg-bharati-cream/40"
                              } ${!isEligible ? "opacity-45 bg-gray-50/50" : ""}`}
                            >
                              <td className="px-3.5 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!isEligible}
                                  onChange={() => handleToggleCustomer(c)}
                                  className="accent-bharati-black cursor-pointer disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="font-medium text-bharati-black block">
                                  {c.name || "Customer"}
                                </span>
                                <span className="text-[10px] text-bharati-ash font-mono truncate max-w-[140px] block">
                                  {c.email || "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-1 font-mono text-[11px] text-bharati-charcoal">
                                  <span>{c.phone}</span>
                                  {c.phoneVerified ? (
                                    <span title="Phone verified via OTP">
                                      <ShieldCheck size={12} className="text-emerald-600 inline" />
                                    </span>
                                  ) : (
                                    <span title="Unverified: cannot receive SMS" className="text-red-500 font-bold">
                                      ✕
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-[11px] text-bharati-charcoal">
                                {c.totalOrders} {c.totalOrders === 1 ? "order" : "orders"}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-bharati-ivory border border-bharati-mist text-bharati-charcoal">
                                  {c.segment}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-3.5 py-2.5 bg-bharati-cream/30 border-t border-bharati-mist flex items-center justify-between text-xs">
                  <span className="text-[11px] text-bharati-ash">
                    Showing page {page + 1} of {Math.max(1, totalPages)} ({totalElements} total)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 0 || customerLoading}
                      onClick={() => {
                        setCustomerLoading(true);
                        setPage((p) => Math.max(0, p - 1));
                      }}
                      className="p-1 rounded hover:bg-white disabled:opacity-30 border border-transparent hover:border-bharati-mist transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages - 1 || customerLoading}
                      onClick={() => {
                        setCustomerLoading(true);
                        setPage((p) => p + 1);
                      }}
                      className="p-1 rounded hover:bg-white disabled:opacity-30 border border-transparent hover:border-bharati-mist transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Recipients Tray (removable badges) */}
              {selectedCustomerIds.size > 0 && (
                <div className="p-3 bg-bharati-ivory/60 rounded-lg border border-bharati-mist space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-bharati-charcoal">
                      Selected Recipients ({selectedCustomerIds.size})
                    </span>
                    <span className="text-[11px] text-bharati-ash">Click to remove individual</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {Array.from(selectedCustomersMap.values()).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white border border-bharati-mist text-bharati-charcoal"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-bharati-ash font-mono text-[10px]">({item.phone})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleRecipient(item.id)}
                          className="text-bharati-ash hover:text-red-600 transition-colors ml-0.5"
                          title="Remove"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Mode B: All Eligible Customers View ──────────────────────────── */}
          {selectionMode === "ALL_ELIGIBLE" && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 bg-bharati-cream/40 rounded-lg border border-bharati-mist space-y-3">
                <span className="text-xs font-semibold text-bharati-charcoal block">
                  Select Target Lifecycle Segment:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {SEGMENT_OPTIONS.map((opt) => {
                    const isSelected = segmentFilter === opt.value;
                    const estimate = getEstimatedSegmentCount(opt.value);

                    return (
                      <label
                        key={opt.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-white border-bharati-black shadow-xs ring-1 ring-bharati-black"
                            : "bg-white/60 border-bharati-mist hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="segmentFilter"
                            value={opt.value}
                            checked={isSelected}
                            onChange={() => setSegmentFilter(opt.value)}
                            className="accent-bharati-black"
                          />
                          <div>
                            <span className="text-xs font-semibold text-bharati-black">{opt.label}</span>
                            <p className="text-[11px] text-bharati-ash leading-snug">{opt.desc}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-bharati-charcoal">
                            ~{estimate.toLocaleString("en-IN")}
                          </span>
                          <span className="block text-[10px] text-bharati-ash">recipients</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Estimate Transparency Banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-950">Dynamic Recipient Estimation</p>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    Recipient count (~{getEstimatedSegmentCount(segmentFilter)}) is calculated in real time by the
                    backend from verified customers matching this segment. When saved as a draft, no customer list
                    is frozen—eligibility will be evaluated dynamically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal / Compliance Notice */}
          <div className="pt-2 border-t border-bharati-mist/60 text-[11px] text-bharati-ash leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 text-bharati-charcoal mt-0.5" />
            <span>
              <strong>Regulatory Notice:</strong> Phone OTP verification confirms device control for login and orders,
              but does not record explicit commercial marketing consent under TRAI TCCCPR regulations. Real SMS sending
              remains disabled until enterprise DLT templates and opt-in consent capture are deployed.
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL: SMS COMPOSER & LIVE PREVIEW (Col 5 / 12)               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-5">
          {/* Composer Form Card */}
          <div className="bg-white rounded-xl border border-bharati-mist shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-bharati-mist/60 pb-3.5">
              <h2 className="text-base font-medium text-bharati-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-bharati-charcoal" />
                2. Message Composer
              </h2>
              {campaignId && (
                <span className="text-[11px] text-bharati-ash font-mono truncate max-w-[150px]">
                  ID: {campaignId.slice(0, 8)}...
                </span>
              )}
            </div>

            {/* Campaign Title */}
            <div className="space-y-1.5">
              <label htmlFor="campaign-title" className="text-xs font-semibold text-bharati-charcoal">
                Campaign Title <span className="text-red-500">*</span>
              </label>
              <input
                id="campaign-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                placeholder="e.g. Diwali Cookware Flash Sale 2026"
                className="w-full px-3 py-2 text-xs border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors"
              />
            </div>

            {/* SMS Message Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="sms-body" className="text-xs font-semibold text-bharati-charcoal">
                  SMS Message Body <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    smsAnalysis.isUnicode
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                  title={
                    smsAnalysis.isUnicode
                      ? "Contains Unicode characters/emojis; 70 chars per segment"
                      : "Standard GSM-7 encoding; 160 chars per segment"
                  }
                >
                  {smsAnalysis.encoding}
                </span>
              </div>

              <textarea
                id="sms-body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={5}
                maxLength={1050}
                placeholder="Type your promotional SMS message here... (e.g. Festive Offer! Get 15% off all Triply Stainless Steel cookers with code FESTIVE15. Visit bharati.in/shop)"
                className="w-full px-3 py-2 text-xs border border-bharati-mist rounded-md bg-white text-bharati-charcoal focus:outline-none focus:border-bharati-black transition-colors resize-y leading-relaxed font-sans"
              />

              {/* Character & Segment Calculation Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-medium ${
                      isMessageOversized ? "text-red-600 font-bold" : "text-bharati-charcoal"
                    }`}
                  >
                    {smsAnalysis.charCount} / 1,000 chars
                  </span>
                  {isMessageOversized && (
                    <span className="text-[10px] text-red-600 font-semibold">(Exceeds 1000 limit)</span>
                  )}
                </div>

                <div className="text-bharati-ash text-[11px]">
                  Estimated:{" "}
                  <strong className="text-bharati-black">
                    {smsAnalysis.segments} {smsAnalysis.segments === 1 ? "SMS segment" : "SMS segments"}
                  </strong>{" "}
                  <span className="font-mono text-[10px]">
                    ({smsAnalysis.remainingInSegment} left in current segment)
                  </span>
                </div>
              </div>

              {smsAnalysis.isUnicode && (
                <p className="text-[10px] text-purple-700 bg-purple-50/60 p-2 rounded border border-purple-100">
                  ℹ️ Unicode characters or emojis detected. Telecom standards split Unicode messages at 70 characters
                  (67 characters per segment for multi-part concatenated SMS).
                </p>
              )}
            </div>

            {/* Campaign Summary Box */}
            <div className="p-3.5 bg-bharati-ivory/80 rounded-lg border border-bharati-mist space-y-2 text-xs">
              <span className="font-semibold text-bharati-black block">Campaign Summary</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-bharati-ash block">Audience Mode</span>
                  <span className="font-medium text-bharati-charcoal">
                    {selectionMode === "SPECIFIC_CUSTOMERS"
                      ? `Specific (${selectedCustomerIds.size} selected)`
                      : `All Eligible (${segmentFilter})`}
                  </span>
                </div>
                <div>
                  <span className="text-bharati-ash block">Recipients (Estimate)</span>
                  <span className="font-medium text-bharati-charcoal">
                    {selectionMode === "SPECIFIC_CUSTOMERS"
                      ? selectedCustomerIds.size
                      : getEstimatedSegmentCount(segmentFilter)}{" "}
                    verified customers
                  </span>
                </div>
                <div>
                  <span className="text-bharati-ash block">Segment Count</span>
                  <span className="font-medium text-bharati-charcoal">
                    {smsAnalysis.segments} segment{smsAnalysis.segments !== 1 ? "s" : ""} / message
                  </span>
                </div>
                <div>
                  <span className="text-bharati-ash block">Draft Status</span>
                  <span className="font-medium text-amber-700">DRAFT (Delivery Disabled)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving || isMessageOversized}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium bg-bharati-black hover:bg-bharati-charcoal text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Draft...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{campaignId ? "Update Draft" : "Save as Draft"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={true}
                aria-disabled="true"
                title="SMS provider is not configured. Live delivery is strictly disabled."
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium bg-gray-200 text-gray-500 cursor-not-allowed opacity-60 border border-gray-300"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS (Disabled)</span>
              </button>
            </div>
          </div>

          {/* ── Realistic Phone Preview Mockup ─────────────────────────────── */}
          <div className="bg-white rounded-xl border border-bharati-mist shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-bharati-charcoal flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-bharati-ash" />
                Live SMS Preview
              </h3>
              <span className="text-[10px] text-bharati-ash font-mono">Recipient Device View</span>
            </div>

            {/* Smartphone Frame Shell */}
            <div className="mx-auto max-w-[280px] bg-slate-900 rounded-[28px] p-3 shadow-xl border-4 border-slate-700">
              {/* Speaker / Notch */}
              <div className="w-16 h-2 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Screen Area */}
              <div className="bg-slate-100 rounded-2xl p-3 min-h-[260px] flex flex-col justify-between text-slate-800">
                {/* SMS Sender Header */}
                <div className="border-b border-slate-200 pb-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center mx-auto mb-1">
                    B
                  </div>
                  <span className="font-semibold text-xs tracking-wide">BHARATI</span>
                  <span className="block text-[9px] text-slate-500">Promotional SMS • Today</span>
                </div>

                {/* Message Bubble */}
                <div className="my-auto py-2">
                  {messageBody.trim() ? (
                    <div className="bg-white text-slate-900 text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/80 leading-relaxed break-words whitespace-pre-wrap">
                      {messageBody}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs italic py-6">
                      Type message above to preview bubble...
                    </div>
                  )}
                </div>

                {/* Simulated Input Bar */}
                <div className="pt-2 border-t border-slate-200/60 text-[9px] text-slate-400 text-center">
                  Replies are not monitored
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-20 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Saved Drafts Drawer / Modal ─────────────────────────────────────── */}
      {showDraftsDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white border border-bharati-mist rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bharati-mist flex items-center justify-between bg-bharati-cream">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-bharati-charcoal" />
                <div>
                  <h3 className="font-semibold text-sm text-bharati-black">Campaign Drafts History</h3>
                  <p className="text-xs text-bharati-ash">Review, reopen or remove previously saved drafts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsDrawer(false)}
                className="p-1 text-bharati-ash hover:text-bharati-black rounded hover:bg-bharati-ivory"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-bharati-mist/60 space-y-2">
              {draftsLoading ? (
                <div className="py-12 text-center text-bharati-ash text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-bharati-mint-dark mb-2" />
                  Loading drafts...
                </div>
              ) : drafts.length === 0 ? (
                <div className="py-12 text-center text-bharati-ash text-xs space-y-1">
                  <FolderOpen className="w-6 h-6 mx-auto text-bharati-silver stroke-1 mb-1" />
                  <p className="font-medium text-bharati-charcoal">No saved drafts found</p>
                  <p>Save a draft from the workspace to reopen it later.</p>
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 hover:bg-bharati-cream/40 rounded-lg transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-bharati-black">{d.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-bharati-charcoal line-clamp-2 leading-relaxed">
                        {d.messageBody}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-bharati-ash pt-0.5">
                        <span>Mode: <strong>{d.selectionMode}</strong></span>
                        {d.segmentFilter && <span>Segment: <strong>{d.segmentFilter}</strong></span>}
                        <span>Est: <strong>{d.estimatedRecipientCount}</strong> recipients</span>
                        <span>Saved: {formatDate(d.updatedAt || d.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDraft(d)}
                        className="px-2.5 py-1.5 rounded text-xs font-medium bg-bharati-black text-white hover:bg-bharati-charcoal transition-colors"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingDraftId(d.id)}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-bharati-mist bg-bharati-cream flex justify-end">
              <button
                type="button"
                onClick={() => setShowDraftsDrawer(false)}
                className="px-4 py-1.5 rounded text-xs font-medium border border-bharati-mist hover:bg-white text-bharati-charcoal transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      {deletingDraftId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white border border-bharati-mist rounded-xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-bharati-black">Delete Campaign Draft?</h4>
                <p className="text-xs text-bharati-ash leading-relaxed">
                  Are you sure you want to permanently delete this promotional SMS draft? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDraftId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium border border-bharati-mist rounded-md hover:bg-bharati-ivory transition-colors text-bharati-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDraft(deletingDraftId)}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
