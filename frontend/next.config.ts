import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.56.1:3000",
    "192.168.56.1",
    "192.168.*.*",
    "192.168.*.*:3000",
  ],
};

export default nextConfig;
