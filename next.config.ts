import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // This demo lives inside the main project; keep Next from using the parent folder as root.
  outputFileTracingRoot: process.cwd(),
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
