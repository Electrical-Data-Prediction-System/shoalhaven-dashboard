import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls through the Next server so the browser stays same-origin.
  // The meter API sends no Access-Control-Allow-Origin header, so a direct
  // client-side fetch to it is blocked by CORS.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_ORIGIN ?? "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
