"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { OtpVerification } from "@/app/checkout/components/OtpVerification";
import { AddressSelector } from "@/app/checkout/components/AddressSelector";
import { createAddress, deleteAddress } from "@/lib/api";
import { AddressInput } from "@/types/ecommerce";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Plus,
  RefreshCw,
  Home,
} from "lucide-react";

export default function AccountPage() {
  const { customer, isLoggedIn, isLoading, logout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"PROFILE" | "ADDRESSES">("PROFILE");
  const [addressLoading, setAddressLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-bharati-mint-dark animate-spin" />
          <p className="text-xs text-bharati-silver uppercase tracking-wider">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !customer) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
        <div className="section-container section-spacing max-w-md mx-auto py-16">
          <div className="text-center mb-8">
            <span className="text-label text-bharati-mint-dark mb-2 block font-medium">
              Bharati Account
            </span>
            <h1 className="text-2xl font-medium text-bharati-black mb-2">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-bharati-silver font-light">
              Enter your mobile number to access saved addresses and track purchases
            </p>
          </div>
          <OtpVerification onVerified={() => refreshProfile()} />
        </div>
      </div>
    );
  }

  const handleSaveNewAddress = async (choice: { newAddress?: AddressInput }) => {
    if (!choice.newAddress) return;
    setAddressLoading(true);
    try {
      await createAddress(choice.newAddress);
      await refreshProfile();
      setMessage("Address saved successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this saved address?")) return;
    try {
      await deleteAddress(id);
      await refreshProfile();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center font-bold text-xl">
              {customer.name?.charAt(0) || "B"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-bharati-charcoal">
                  {customer.name || "Bharati Customer"}
                </h1>
                {customer.phoneVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-bharati-silver">
                Mobile: +91 {customer.phone} {customer.email ? `• ${customer.email}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="btn-secondary text-xs flex items-center gap-2 py-2.5 px-4"
            >
              <Package size={16} />
              <span>My Orders</span>
            </Link>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-bharati-mist text-bharati-ash hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex w-full items-center gap-2 border-b border-bharati-mist/60 pb-3">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-3 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors ${
              activeTab === "PROFILE"
                ? "bg-bharati-mint-dark text-white"
                : "text-bharati-ash hover:text-bharati-charcoal"
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab("ADDRESSES")}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-3 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors ${
              activeTab === "ADDRESSES"
                ? "bg-bharati-mint-dark text-white"
                : "text-bharati-ash hover:text-bharati-charcoal"
            }`}
          >
            Saved Addresses ({customer.addresses?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "PROFILE" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal pb-3 border-b border-bharati-mist/60">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-bharati-silver uppercase tracking-wider block font-light">
                  Full Name
                </span>
                <p className="font-medium text-bharati-charcoal">
                  {customer.name || "Not specified"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-bharati-silver uppercase tracking-wider block font-light">
                  Primary Mobile
                </span>
                <p className="font-medium text-bharati-charcoal">
                  +91 {customer.phone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-bharati-silver uppercase tracking-wider block font-light">
                  Email Address
                </span>
                <div className="font-medium text-bharati-charcoal flex items-center gap-2">
                  {customer.email ? (
                    <>
                      {customer.email}
                      {customer.emailVerified ? (
                        <CheckCircle2 size={16} className="text-bharati-mint-dark" strokeWidth={2.5} title="Email Verified" />
                      ) : (
                        <button className="text-[10px] uppercase font-bold text-bharati-mint-dark bg-bharati-mint/10 px-2 py-0.5 rounded-full hover:bg-bharati-mint/20 transition-colors">
                          Verify
                        </button>
                      )}
                    </>
                  ) : (
                    "No email registered yet"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ADDRESSES" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(customer.addresses || []).map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-2xl p-5 border border-bharati-mist shadow-xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark bg-bharati-mint/10 px-2.5 py-0.5 rounded-full">
                      {addr.label || "Home"}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-bharati-silver hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-xs text-bharati-ash space-y-0.5">
                    <p className="font-medium text-bharati-charcoal text-sm">
                      {addr.line1}
                    </p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-bharati-silver">{addr.country || "India"}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Address Card */}
            <div className="bg-white rounded-2xl p-6 border border-bharati-mist shadow-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bharati-charcoal mb-4">
                Add New Address
              </h3>
              <AddressSelector
                savedAddresses={[]}
                onSelectAddress={handleSaveNewAddress}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
