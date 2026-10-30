import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.137.1", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bonnwrovvzlvpzoiwkzs.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bharati-backend-production.up.railway.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.up.railway.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
