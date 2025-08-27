import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utmost-wildebeest-284.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
