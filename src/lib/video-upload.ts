import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB — short clips only, no transcoding pipeline here

export type VideoUploadResult = { url: string } | { error: string };

// Saves the file as-is (no transcoding/compression, unlike saveResizedImage)
// under uploads/<subfolder>/ (outside `public/` — see
// src/app/api/uploads/[...path]/route.ts for why) — good enough for a short,
// pre-compressed training clip, not a general video pipeline.
export async function saveVideoFile(
  file: File,
  { subfolder = "" }: { subfolder?: string } = {}
): Promise<VideoUploadResult> {
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return { error: "รองรับเฉพาะไฟล์ MP4 หรือ WEBM เท่านั้น" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "ไฟล์วิดีโอต้องมีขนาดไม่เกิน 50MB" };
  }

  const ext = file.type === "video/webm" ? "webm" : "mp4";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const url = subfolder ? `/api/uploads/${subfolder}/${filename}` : `/api/uploads/${filename}`;
  return { url };
}
