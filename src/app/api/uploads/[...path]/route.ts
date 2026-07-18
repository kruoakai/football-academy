import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Serves files written by src/lib/image-upload.ts and src/lib/video-upload.ts
// from a directory outside `public/` — reading from disk on every request.
// Files under `public/` are served from an in-memory list Next.js builds
// once at server startup (see next-server's filesystem router), so anything
// an admin uploads after boot 404s until the process restarts. Storing
// uploads outside `public/` and serving them here sidesteps that entirely.
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.some((segment) => segment === ".." || segment === "")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments);
  if (filePath !== UPLOADS_ROOT && !filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!fileStat.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await readFile(filePath);
  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      // Filenames are randomUUID-based and never reused, so a fresh upload
      // always gets a new URL — safe to cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
