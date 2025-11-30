import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "agdgsknwsczlqdvyomjp.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
    qualities: [75, 100],
  },
  compiler: {
    removeConsole: false,
  },
  turbopack: {
    rules: {
      "**/*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
} as NextConfig;

export default nextConfig;
