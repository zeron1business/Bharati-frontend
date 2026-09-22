"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, ArrowRight, RefreshCw } from "lucide-react";

interface CustomerProfileFormProps {
  onProfileComplete: () => void;
}

export function CustomerProfileForm({ onProfileComplete }: CustomerProfileFormProps) {
  const { customer, updateProfile } = useAuth();
  const [name, setName] = useState(
    customer?.name && customer.name !== "Bharati Customer" ? customer.name : ""
  );
  const [email, setEmail] = useState(customer?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      onProfileComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-bharati-mist/60">
        <div className="w-9 h-9 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center font-bold text-sm">
          2
        </div>
        <div>
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Customer Details
          </h2>
          <p className="text-xs text-bharati-silver font-light">
            Tell us who this order should be prepared for
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-bharati-charcoal mb-2">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bharati-silver">
              <User size={16} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Raman"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal font-medium focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all text-sm"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-bharati-charcoal mb-2">
            Email Address (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bharati-silver">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="meera@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal font-medium focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all text-sm"
            />
          </div>
          <p className="text-[11px] text-bharati-silver mt-1.5 font-light">
            We will send order tracking updates and your digital invoice here
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40 mt-2"
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <>
              <span>Continue to Delivery Address</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
