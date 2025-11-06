import type { NextConfig } from "next";

const nextConfig = {
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
