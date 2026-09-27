"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/api";
import { Address, AddressInput, OrderCreatePayload, OrderResponse } from "@/types/ecommerce";
import { OtpVerification } from "./components/OtpVerification";
import { CustomerProfileForm } from "./components/CustomerProfileForm";
import { AddressSelector } from "./components/AddressSelector";
import { OrderReview } from "./components/OrderReview";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Package,
  Calendar,
  CreditCard,
} from "lucide-react";

type CheckoutStep = "OTP" | "PROFILE" | "ADDRESS" | "REVIEW" | "ORDER_CREATED";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const { customer, isLoggedIn, isLoading: authLoading, refreshProfile } = useAuth();

  const [step, setStep] = useState<CheckoutStep>("OTP");
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [newAddress, setNewAddress] = useState<AddressInput | undefined>(undefined);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize step based on auth status
  useEffect(() => {
    if (authLoading || step === "ORDER_CREATED") return;

    if (isLoggedIn && customer) {
      const isDefaultName = !customer.name || customer.name === "Bharati Customer";
      
      // If user is at OTP, forward them to the correct next step
      if (step === "OTP") {
        setStep(isDefaultName ? "PROFILE" : "ADDRESS");
      } 
      // If user is at an advanced step but needs profile completion, force them back
      else if (isDefaultName && (step === "ADDRESS" || step === "REVIEW")) {
        setStep("PROFILE");
      }
      // If user is at PROFILE but already has a name, forward them
      else if (step === "PROFILE" && !isDefaultName) {
        setStep("ADDRESS");
      }
      // Otherwise (user is at ADDRESS or REVIEW and has a name), leave the step as is.
    } else {
      setStep("OTP");
    }
  }, [isLoggedIn, customer, authLoading, step]);

  // Handle OTP verification complete
  const handleOtpVerified = useCallback(
    async (isNewCustomer: boolean) => {
      setErrorMessage(null);
      const updatedProfile = await refreshProfile();
      if (isNewCustomer || !updatedProfile?.name || updatedProfile.name === "Bharati Customer") {
        setStep("PROFILE");
      } else {
        setStep("ADDRESS");
      }
    },
    [refreshProfile]
  );

  // Handle profile update complete
  const handleProfileComplete = useCallback(() => {
    setErrorMessage(null);
    setStep("ADDRESS");
  }, []);

  // Handle address selected
  const handleAddressSelected = useCallback(
    (choice: { addressId?: string; newAddress?: AddressInput }) => {
      setErrorMessage(null);
      setSelectedAddressId(choice.addressId);
      setNewAddress(choice.newAddress);
      setStep("REVIEW");
    },
    []
  );

  // Place order (COD only — creates confirmed order in backend)
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMessage("Your cart is empty");
      return;
    }

    setIsProcessingOrder(true);
    setErrorMessage(null);

    try {
      const payload: OrderCreatePayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        addressId: selectedAddressId,
        newAddress: newAddress,
        paymentMethod: "COD",
      };

      const orderRes = await createOrder(payload);
      // Refresh profile so newly saved address is immediately available
      await refreshProfile();
      setCreatedOrder(orderRes);
      clearCart();
      setStep("ORDER_CREATED");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bharati-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && step !== "ORDER_CREATED") {
    return (
      <div className="min-h-screen pt-[var(--header-height)]">
        <div className="section-container section-spacing flex flex-col items-center justify-center text-center max-w-lg mx-auto py-24">
          <div className="w-20 h-20 rounded-full bg-bharati-ivory flex items-center justify-center text-bharati-ash mb-6">
            <ShoppingBag size={36} strokeWidth={1.2} />
          </div>
          <h1 className="text-2xl font-medium text-bharati-black mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-body-large text-bharati-ash mb-8 font-light">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link href="/products" className="btn-primary">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  const savedAddresses = customer?.addresses || [];
  const selectedAddressObj = selectedAddressId
    ? savedAddresses.find((a) => a.id === selectedAddressId) || null
    : null;

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto">
        {/* Header with Back button */}
        {step !== "ORDER_CREATED" && (
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-bharati-mist/60">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-bharati-ash hover:text-bharati-charcoal font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Cart
            </Link>
            <div className="flex items-center gap-2 text-xs text-bharati-silver">
              <Lock size={14} className="text-bharati-mint-dark" />
              <span>Secure Checkout</span>
            </div>
          </div>
        )}

        {/* Progress Stepper */}
        {step !== "ORDER_CREATED" && (
          <div className="grid grid-cols-4 gap-2 mb-10 text-center">
            {[
              { id: "OTP", label: "1. Verify" },
              { id: "PROFILE", label: "2. Profile" },
              { id: "ADDRESS", label: "3. Address" },
              { id: "REVIEW", label: "4. Review" },
            ].map((s) => {
              const stepOrder: CheckoutStep[] = ["OTP", "PROFILE", "ADDRESS", "REVIEW"];
              const currentIdx = stepOrder.indexOf(step);
              const thisIdx = stepOrder.indexOf(s.id as CheckoutStep);
              const isCompleted = thisIdx < currentIdx;
              const isCurrent = thisIdx === currentIdx;

              return (
                <div key={s.id} className="space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-bharati-mint"
                        : isCurrent
                        ? "bg-bharati-mint-dark"
                        : "bg-bharati-mist"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium tracking-wider uppercase block ${
                      isCurrent
                        ? "text-bharati-charcoal font-bold"
                        : isCompleted
                        ? "text-bharati-mint-dark"
                        : "text-bharati-silver"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Stage Rendering */}
        <div className="max-w-2xl mx-auto">
          {step === "OTP" && (
            <OtpVerification onVerified={handleOtpVerified} />
          )}

          {step === "PROFILE" && (
            <CustomerProfileForm onProfileComplete={handleProfileComplete} />
          )}

          {step === "ADDRESS" && (
            <AddressSelector
              savedAddresses={savedAddresses}
              onSelectAddress={handleAddressSelected}
              onBack={
                customer && customer.name && customer.name !== "Bharati Customer"
                  ? undefined
                  : () => setStep("PROFILE")
              }
            />
          )}

          {step === "REVIEW" && (
            <OrderReview
              items={items}
              subtotal={subtotal}
              selectedAddress={selectedAddressObj}
              newAddress={newAddress}
              customerName={customer?.name}
              customerPhone={customer?.phone}
              onEditAddress={() => setStep("ADDRESS")}
              onPlaceOrder={handlePlaceOrder}
              loading={isProcessingOrder}
              errorMessage={errorMessage}
            />
          )}

          {step === "ORDER_CREATED" && createdOrder && (
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  <Package size={12} />
                  Order Confirmed — Cash on Delivery
                </span>
                <h1 className="text-2xl font-bold text-bharati-charcoal">
                  Thank You! Your Order is Placed.
                </h1>
                <p className="text-sm text-bharati-ash font-medium">
                  Order Number: <strong className="text-bharati-charcoal">#{createdOrder.orderNumber}</strong>
                </p>
                <p className="text-xs text-bharati-silver max-w-md mx-auto leading-relaxed pt-2">
                  Your Bharati cookware is being prepared for dispatch. Our team will reach out to confirm your delivery slot.
                </p>
              </div>

              {/* COD Payment Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto text-sm text-amber-800 flex items-start gap-3 text-left">
                <Calendar size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold mb-0.5">Pay on Delivery</p>
                  <p className="text-xs font-light">
                    Please keep <strong>₹ {Number(createdOrder.amount).toLocaleString("en-IN")}</strong> ready in cash at the time of delivery.
                  </p>
                </div>
              </div>

              <div className="bg-bharati-ivory/60 rounded-xl p-4 max-w-md mx-auto text-xs text-bharati-ash border border-bharati-mist/60 text-left space-y-2">
                <div className="flex justify-between">
                  <span>Order Reference:</span>
                  <span className="font-semibold text-bharati-charcoal">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount to Pay at Delivery:</span>
                  <span className="font-bold text-bharati-charcoal text-sm">₹ {Number(createdOrder.amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Phone:</span>
                  <span className="text-bharati-charcoal">+91 {customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-bharati-charcoal">Cash on Delivery</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/orders/${createdOrder.orderNumber}`}
                  className="btn-primary w-full sm:w-auto text-xs py-3 px-6"
                >
                  View Order Details
                </Link>
                <Link
                  href="/orders"
                  className="btn-secondary w-full sm:w-auto text-xs py-3 px-6"
                >
                  My Order History
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/products"
                  className="text-xs text-bharati-silver hover:text-bharati-charcoal transition-colors"
                >
                  &larr; Continue Browsing Products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
