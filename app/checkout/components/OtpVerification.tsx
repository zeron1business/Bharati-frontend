"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Phone, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

interface OtpVerificationProps {
  onVerified: (isNewCustomer: boolean) => void;
}

export function OtpVerification({ onVerified }: OtpVerificationProps) {
  const { sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await sendOtp(cleanPhone);
      setStep("OTP");
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await verifyOtp(phone.trim(), cleanOtp);
      onVerified(response.isNewCustomer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-bharati-mist shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-bharati-mist/60">
        <div className="w-9 h-9 rounded-full bg-bharati-mint/15 text-bharati-mint-dark flex items-center justify-center font-bold text-sm">
          1
        </div>
        <div>
          <h2 className="text-lg font-medium text-bharati-charcoal">
            Mobile Verification
          </h2>
          <p className="text-xs text-bharati-silver font-light">
            We will look up your saved addresses or create your account automatically
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {step === "PHONE" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bharati-charcoal mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bharati-silver">
                <Phone size={16} />
                <span className="ml-2 font-medium text-bharati-charcoal text-sm">+91</span>
                <span className="mx-2 text-bharati-mist">|</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="w-full pl-24 pr-4 py-3 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal font-medium focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all text-sm tracking-wide"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-bharati-ash">
            <span>Code sent to <strong className="text-bharati-charcoal">+91 {phone}</strong></span>
            <button
              type="button"
              onClick={() => {
                setStep("PHONE");
                setOtp("");
                setError(null);
              }}
              className="text-bharati-mint-dark hover:underline font-semibold"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bharati-charcoal mb-2">
              6-Digit OTP Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bharati-silver">
                <KeyRound size={16} />
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-bharati-mist bg-bharati-ivory/40 text-bharati-charcoal font-bold text-center tracking-[0.4em] text-lg focus:outline-hidden focus:border-bharati-mint-dark focus:bg-white transition-all"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Verify & Proceed</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            {cooldown > 0 ? (
              <span className="text-xs text-bharati-silver">
                Resend code in <strong className="text-bharati-charcoal">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-xs text-bharati-mint-dark hover:underline font-semibold"
              >
                Didn&apos;t receive code? Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
