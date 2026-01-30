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
};

export default nextConfig;
