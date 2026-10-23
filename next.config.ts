import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
