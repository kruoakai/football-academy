"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";
import { saveVideoFile } from "@/lib/video-upload";
import { HOME_CONTENT_FIELDS, HOMEPAGE_CONTENT_ID } from "@/lib/home-content";

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

  const videoFile = formData.get("heroVideoFile");
  const removeVideo = formData.get("removeHeroVideo") === "on";
  formData.delete("heroVideoFile");
  formData.delete("removeHeroVideo");
  if (videoFile instanceof File && videoFile.size > 0) {
    const result = await saveVideoFile(videoFile, { subfolder: "home" });
    if ("error" in result) return { error: result.error };
    mediaUpdates.heroVideoUrl = result.url;
  } else if (removeVideo) {
    mediaUpdates.heroVideoUrl = null;
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

  const parsed = homeContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  const data = { ...parsed.data, ...mediaUpdates };

  await prisma.homePageContent.upsert({
    where: { id: HOMEPAGE_CONTENT_ID },
    update: data,
    create: { id: HOMEPAGE_CONTENT_ID, ...data },
  });

  revalidatePath("/admin/site-content");
  revalidatePath("/");
  return { success: "บันทึกเนื้อหาหน้าแรกเรียบร้อยแล้ว" };
}
