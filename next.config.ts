import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.oss-*.aliyuncs.com",
      },
    ],
  },
  // Empty turbopack config to silence the warning
  // FFmpeg.wasm works fine in Turbopack without special config
  turbopack: {},
  // Webpack config (fallback for --webpack flag)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
