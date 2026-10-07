"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/lib/admin-api";
import Image from "next/image";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "replaced") {
      setNotice("You were signed out because this account logged in on another device.");
    } else if (reason === "expired") {
      setNotice("Your session has expired. Please sign in again.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await adminLogin({ email, password });
      if (response.data?.token) {
        localStorage.setItem("bharati_admin_token", response.data.token);
        router.push("/admin/products");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bharati-cream p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg shadow-sm border border-bharati-mist">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/BHARATILOGO_clean.png"
            alt="BHARATI"
            width={160}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>
        
        <h1 className="text-2xl font-light text-center text-bharati-black mb-8 tracking-wide">
          Admin Portal
        </h1>

        {notice && !error && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200/60 p-3 rounded-md mb-6 text-sm">
            {notice}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-bharati-mist rounded-md focus:outline-none focus:border-bharati-black transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bharati-charcoal mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-bharati-mist rounded-md focus:outline-none focus:border-bharati-black transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
