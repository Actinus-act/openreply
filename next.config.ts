import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Type-checked before deploy; tsc during next build exhausts a 1 GB VPS.
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
