import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    // Default is 1MB — raised to match the 5MB limit enforced in the logo
    // upload action (src/app/admin/site-settings/actions.ts).
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
