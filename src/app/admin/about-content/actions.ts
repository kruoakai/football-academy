"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";
import { ABOUT_CONTENT_FIELDS, ABOUT_VISIBILITY_FIELDS, ABOUT_CONTENT_ID } from "@/lib/about-content";

const aboutContentSchema = z.object(
  Object.fromEntries(ABOUT_CONTENT_FIELDS.map((f) => [f, z.string().min(1, { error: "กรุณากรอกข้อความ" })]))
);

export type AboutContentFormState = { error?: string; success?: string } | undefined;

const PHOTO_KEYS = ["founder1", "founder2"] as const;

export async function updateAboutContentAction(
  _prevState: AboutContentFormState,
  formData: FormData
): Promise<AboutContentFormState> {
  await requireRole(["ADMIN"]);

  // Handled separately from the text-field schema below, same pattern as
  // src/app/admin/site-content/actions.ts — File objects can't be validated
  // by the z.string() fields, and "remove" is an explicit checkbox rather
  // than relying on an empty file input.
  const mediaUpdates: Record<string, string | null> = {};
  for (const key of PHOTO_KEYS) {
    const file = formData.get(`${key}Photo`);
    const remove = formData.get(`remove${key[0].toUpperCase()}${key.slice(1)}Photo`) === "on";
    formData.delete(`${key}Photo`);
    formData.delete(`remove${key[0].toUpperCase()}${key.slice(1)}Photo`);
    if (file instanceof File && file.size > 0) {
      const result = await saveResizedImage(file, { subfolder: "about", maxWidth: 800 });
      if ("error" in result) return { error: result.error };
      mediaUpdates[`${key}PhotoUrl`] = result.url;
    } else if (remove) {
      mediaUpdates[`${key}PhotoUrl`] = null;
    }
  }

  // Show/hide checkboxes: an unchecked checkbox is simply absent from the
  // submitted FormData, so presence itself is the boolean value.
  const visibilityUpdates: Record<string, boolean> = {};
  for (const field of ABOUT_VISIBILITY_FIELDS) {
    visibilityUpdates[field] = formData.get(field) === "on";
    formData.delete(field);
  }

  const parsed = aboutContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  const data = { ...parsed.data, ...mediaUpdates, ...visibilityUpdates };

  await prisma.aboutPageContent.upsert({
    where: { id: ABOUT_CONTENT_ID },
    update: data,
    create: { id: ABOUT_CONTENT_ID, ...data },
  });

  revalidatePath("/admin/about-content");
  revalidatePath("/about");
  return { success: "บันทึกเนื้อหาหน้าเกี่ยวกับเราเรียบร้อยแล้ว" };
}
