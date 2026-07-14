import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    // Default is 1MB — raised to fit up to 4 hero tile images (8MB raw cap
    // each, src/lib/image-upload.ts) submitted together in one form post.
    // Video uploads go through a separate Route Handler (see
    // src/app/api/admin/upload-video/route.ts), not a Server Action, so they
    // don't factor into this limit — large files through a Server Action's
    // multipart body proved flaky in Next.js dev (Turbopack).
    serverActions: {
      bodySizeLimit: "40mb",
    },
  },
};

export default nextConfig;
