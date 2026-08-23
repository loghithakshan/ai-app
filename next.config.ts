import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["llamaindex"],
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "framer-motion-3d"],
};

export default nextConfig;