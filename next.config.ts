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
  // Turbopack config (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      // Required for @ffmpeg/ffmpeg to work in browser
      fs: false,
      path: false,
      crypto: false,
    },
  },
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
