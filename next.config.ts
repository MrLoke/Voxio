import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [new URL("https://agdgsknwsczlqdvyomjp.supabase.co/**")],
    qualities: [75, 100],
  },
  compiler: {
    removeConsole: false,
  },
  // experimental: {
  //   globalNotFound: true,
  // },
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
