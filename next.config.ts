import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["llamaindex"],
  experimental: {
    // Disable turbopack for build if possible or other stability flags
  }
};

export default nextConfig;
