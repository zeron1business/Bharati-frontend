"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { OtpVerification } from "@/app/checkout/components/OtpVerification";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, refreshProfile } = useAuth();

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-bharati-black/40 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden m-4"
          >
            <button
              onClick={closeAuthModal}
              className="absolute right-4 top-4 p-2 text-bharati-ash hover:text-bharati-black hover:bg-bharati-ivory rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 pt-10">
              <div className="text-center mb-6">
                <span className="text-label text-bharati-mint-dark mb-2 block font-medium">
                  Welcome to Bharati
                </span>
                <h2 className="text-xl font-medium text-bharati-black mb-1">
                  Sign In / Sign Up
                </h2>
                <p className="text-xs text-bharati-ash font-light">
                  Enter your mobile number to get started.
                </p>
              </div>

              <OtpVerification 
                onVerified={() => {
                  refreshProfile();
                  closeAuthModal();
                }} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
