"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";
import { HOME_CONTENT_FIELDS, HOME_VISIBILITY_FIELDS, HOMEPAGE_CONTENT_ID } from "@/lib/home-content";

const homeContentSchema = z.object(
  Object.fromEntries(HOME_CONTENT_FIELDS.map((f) => [f, z.string().min(1, { error: "กรุณากรอกข้อความ" })]))
);

export type HomeContentFormState = { error?: string; success?: string } | undefined;

const TILE_KEYS = ["heroTile1", "heroTile2", "heroTile3", "heroTile4"] as const;

export async function updateHomeContentAction(
  _prevState: HomeContentFormState,
  formData: FormData
): Promise<HomeContentFormState> {
  await requireRole(["ADMIN"]);

  // Handled separately from the text-field schema below, same pattern as the
  // logo upload in src/app/admin/site-settings/actions.ts — File objects
  // can't be validated by the z.string() fields, and "remove" is handled by
  // an explicit checkbox rather than relying on an empty file input.
  const mediaUpdates: Record<string, string | null> = {};

  // The video file itself is uploaded client-side via a direct fetch() to
  // /api/admin/upload-video (see HeroVideoField) — large files through this
  // Server Action's multipart body are flaky in Next.js dev. Only the
  // resulting URL arrives here, as a plain optional text field.
  const videoUrlRaw = formData.get("heroVideoUrl");
  formData.delete("heroVideoUrl");
  const videoUrl = typeof videoUrlRaw === "string" ? videoUrlRaw.trim() : "";
  mediaUpdates.heroVideoUrl = videoUrl || null;

  // Link alternative to the file upload (YouTube/Facebook/TikTok/etc.) — a plain
  // optional URL, not part of the required-string HOME_CONTENT_FIELDS schema below.
  const videoEmbedUrlRaw = formData.get("heroVideoEmbedUrl");
  formData.delete("heroVideoEmbedUrl");
  const videoEmbedUrl = typeof videoEmbedUrlRaw === "string" ? videoEmbedUrlRaw.trim() : "";
  if (videoEmbedUrl) {
    const urlCheck = z.url({ error: "ลิงก์วิดีโอไม่ถูกต้อง" }).safeParse(videoEmbedUrl);
    if (!urlCheck.success) return { error: urlCheck.error.issues[0]?.message ?? "ลิงก์วิดีโอไม่ถูกต้อง" };
    mediaUpdates.heroVideoEmbedUrl = videoEmbedUrl;
  } else {
    mediaUpdates.heroVideoEmbedUrl = null;
  }

  for (const key of TILE_KEYS) {
    const file = formData.get(`${key}File`);
    const remove = formData.get(`remove${key[0].toUpperCase()}${key.slice(1)}`) === "on";
    formData.delete(`${key}File`);
    formData.delete(`remove${key[0].toUpperCase()}${key.slice(1)}`);
    if (file instanceof File && file.size > 0) {
      const result = await saveResizedImage(file, { subfolder: "home", maxWidth: 1000 });
      if ("error" in result) return { error: result.error };
      mediaUpdates[`${key}Url`] = result.url;
    } else if (remove) {
      mediaUpdates[`${key}Url`] = null;
    }
  }

  // Show/hide checkboxes: an unchecked checkbox is simply absent from the
  // submitted FormData, so presence itself is the boolean value.
  const visibilityUpdates: Record<string, boolean> = {};
  for (const field of HOME_VISIBILITY_FIELDS) {
    visibilityUpdates[field] = formData.get(field) === "on";
    formData.delete(field);
  }

  const parsed = homeContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  const data = { ...parsed.data, ...mediaUpdates, ...visibilityUpdates };

  await prisma.homePageContent.upsert({
    where: { id: HOMEPAGE_CONTENT_ID },
    update: data,
    create: { id: HOMEPAGE_CONTENT_ID, ...data },
  });

  revalidatePath("/admin/site-content");
  revalidatePath("/");
  return { success: "บันทึกเนื้อหาหน้าแรกเรียบร้อยแล้ว" };
}
