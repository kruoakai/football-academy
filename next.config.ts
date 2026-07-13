import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    // Default is 1MB — raised to fit the 50MB cap on hero video uploads
    // (src/lib/video-upload.ts), the largest upload this app accepts.
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },
};

export default nextConfig;
