"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CustomerProfile, AuthResponse } from "@/types/ecommerce";
import {
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  getCustomerProfile,
  updateCustomerProfile,
} from "@/lib/api";

interface AuthContextType {
  token: string | null;
  customer: CustomerProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<AuthResponse>;
  refreshProfile: () => Promise<CustomerProfile | null>;
  updateProfile: (payload: { name: string; email?: string }) => Promise<CustomerProfile>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "bharati_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshProfile = useCallback(async (): Promise<CustomerProfile | null> => {
    try {
      const profile = await getCustomerProfile();
      setCustomer(profile);
      return profile;
    } catch (e) {
      console.error("Failed to load customer profile", e);
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const sendOtp = async (phone: string) => {
    await apiSendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string, name?: string): Promise<AuthResponse> => {
    const response = await apiVerifyOtp(phone, otp, name);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    await refreshProfile();
    return response;
  };

  const updateProfile = async (payload: { name: string; email?: string }) => {
    const updated = await updateCustomerProfile(payload);
    setCustomer(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  };

  const isLoggedIn = !!token && !!customer;
  
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        customer,
        isLoggedIn,
        isLoading,
        sendOtp,
        verifyOtp,
        refreshProfile,
        updateProfile,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
