import "server-only";
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB raw upload cap, before resize

export type ImageUploadResult = { url: string } | { error: string };

// Resizes to a max width (never upscales) and re-encodes as JPEG for
// predictable, web-appropriate file sizes, then saves under
// public/images/uploads/<subfolder>/. Mirrors the logo-upload action in
// src/app/admin/site-settings/actions.ts but adds the actual resize step.
export async function saveResizedImage(
  file: File,
  { maxWidth = 1600, subfolder = "" }: { maxWidth?: number; subfolder?: string } = {}
): Promise<ImageUploadResult> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "รองรับเฉพาะไฟล์ PNG, JPEG หรือ WEBP เท่านั้น" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 8MB" };
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  let resized: Buffer;
  try {
    resized = await sharp(inputBuffer)
      .rotate() // apply EXIF orientation before resizing
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    return { error: "ไม่สามารถประมวลผลไฟล์รูปภาพนี้ได้ กรุณาลองไฟล์อื่น" };
  }

  const filename = `${randomUUID()}.jpg`;
  const uploadDir = path.join(process.cwd(), "public", "images", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), resized);

  const url = subfolder ? `/images/uploads/${subfolder}/${filename}` : `/images/uploads/${filename}`;
  return { url };
}
