import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Keep Next from using a parent folder as the root if it finds another lockfile there.
  outputFileTracingRoot: process.cwd(),
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
