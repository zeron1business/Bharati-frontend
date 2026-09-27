"use client";

import React, { useState } from "react";
import { Address, AddressInput } from "@/types/ecommerce";
import { MapPin, Plus, Check, Home, Building2, ArrowRight } from "lucide-react";

interface AddressSelectorProps {
  savedAddresses: Address[];
  onSelectAddress: (choice: { addressId?: string; newAddress?: AddressInput }) => void;
  onBack?: () => void;
}

export function AddressSelector({
  savedAddresses,
  onSelectAddress,
  onBack,
}: AddressSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    savedAddresses.length > 0 ? savedAddresses[0].id : null
  );
  const [isAddingNew, setIsAddingNew] = useState(savedAddresses.length === 0);

  // New address form state
  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePincodeChange = async (value: string) => {
    const clean = value.replace(/\D/g, "");
    setPincode(clean);

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        const post = data?.[0]?.PostOffice?.[0];
        if (post && data?.[0]?.Status === "Success") {
          setCity(post.District || post.Name || "");
          setState(post.State || "");
        }
      } catch {
        // silently fail — user can type manually
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isAddingNew) {
      if (!line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
        setError("Please complete all required address fields");
        return;
      }
      if (!/^\d{6}$/.test(pincode.trim())) {
        setError("Please enter a valid 6-digit PIN code");
        return;
      }

      onSelectAddress({
        newAddress: {
          label,
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: "India",
        },
      });
    } else {
      if (!selectedId) {
        setError("Please select a delivery address");
        return;
      }
      onSelectAddress({ addressId: selectedId });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-bharati-mist/60">
        <div className="w-9 h-9 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center font-bold text-sm">
          3
        </div>
        <div>
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Delivery Address
          </h2>
          <p className="text-xs text-bharati-silver font-light">
            Where should we deliver your Bharati cookware?
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Saved Addresses Cards */}
      {savedAddresses.length > 0 && !isAddingNew && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAddresses.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedId(addr.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "border-bharati-mint bg-bharati-mint/5 shadow-xs"
                      : "border-bharati-mist/80 hover:border-bharati-mint/40 bg-white"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark bg-bharati-mint/10 px-2.5 py-0.5 rounded-full">
                        {addr.label?.toLowerCase() === "work" ? (
                          <Building2 size={12} />
                        ) : (
                          <Home size={12} />
                        )}
                        {addr.label || "Home"}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-bharati-mint text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-bharati-charcoal leading-snug">
                      {addr.line1}
                    </p>
                    {addr.line2 && (
                      <p className="text-xs text-bharati-ash">{addr.line2}</p>
                    )}
                    <p className="text-xs text-bharati-silver">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bharati-mint-dark hover:underline pt-2"
          >
            <Plus size={14} />
            Deliver to a new address
          </button>
        </div>
      )}

      {/* New Address Form */}
      {isAddingNew && (
        <form onSubmit={handleContinue} className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-bharati-charcoal">
              New Delivery Address
            </span>
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-bharati-mint-dark hover:underline font-semibold"
              >
                Use a saved address
              </button>
            )}
          </div>

          {/* Label selector */}
          <div className="flex items-center gap-2">
            {["Home", "Work", "Other"].map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLabel(lbl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  label === lbl
                    ? "bg-bharati-mint-dark text-white border-bharati-mint-dark"
                    : "bg-bharati-ivory border-bharati-mist text-bharati-charcoal hover:bg-bharati-mist/50"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-bharati-ash mb-1">
              Flat / House / Floor / Building *
            </label>
            <input
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="e.g. 402, Lotus Residency"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-bharati-ash mb-1">
              Street / Area / Landmark
            </label>
            <input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="e.g. Near HDFC Bank, Jubilee Hills"
              className="w-full px-4 py-2.5 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-bharati-ash mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="500034"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white font-medium"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-bharati-ash mb-1">
                City / Town *
                {pincodeLoading && <span className="ml-1 text-bharati-mint-dark text-[10px]">fetching...</span>}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Hyderabad"
                required
                disabled={pincodeLoading}
                className={`w-full px-4 py-2.5 rounded-xl border border-bharati-mist text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all ${
                  pincodeLoading
                    ? "bg-bharati-mint/5 border-bharati-mint/30 animate-pulse"
                    : "bg-bharati-ivory/40"
                }`}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-bharati-ash mb-1">
                State *
                {pincodeLoading && <span className="ml-1 text-bharati-mint-dark text-[10px]">fetching...</span>}
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Telangana"
                required
                disabled={pincodeLoading}
                className={`w-full px-4 py-2.5 rounded-xl border border-bharati-mist text-bharati-charcoal text-sm focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all ${
                  pincodeLoading
                    ? "bg-bharati-mint/5 border-bharati-mint/30 animate-pulse"
                    : "bg-bharati-ivory/40"
                }`}
              />
            </div>
          </div>

          {/* Continue CTA — inside form so type="submit" works */}
          <div className="pt-2 flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-3.5 rounded-xl border border-bharati-mist text-bharati-ash hover:text-bharati-charcoal text-sm font-medium transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={pincodeLoading}
              className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>Continue to Order Review</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Continue CTA for saved address selection (not adding new) */}
      {!isAddingNew && (
        <div className="pt-2 flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3.5 rounded-xl border border-bharati-mist text-bharati-ash hover:text-bharati-charcoal text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleContinue}
            className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-sm"
          >
            <span>Continue to Order Review</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
