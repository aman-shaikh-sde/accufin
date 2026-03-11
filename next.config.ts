import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws"],
  experimental: {
    instrumentationHook: true,  
  },
};

export default nextConfig;