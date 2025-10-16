import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: {
      panicThreshold: "ALL_ERRORS",
    },
  },
};

export default nextConfig;
