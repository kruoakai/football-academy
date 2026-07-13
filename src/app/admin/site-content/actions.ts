"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";
import { HOME_CONTENT_FIELDS, HOMEPAGE_CONTENT_ID } from "@/lib/home-content";

const homeContentSchema = z.object(
  Object.fromEntries(HOME_CONTENT_FIELDS.map((f) => [f, z.string().min(1, { error: "กรุณากรอกข้อความ" })]))
);

export type HomeContentFormState = { error?: string; success?: string } | undefined;

export async function updateHomeContentAction(
  _prevState: HomeContentFormState,
  formData: FormData
): Promise<HomeContentFormState> {
  await requireRole(["ADMIN"]);

  // Handled separately from the text-field schema below, same pattern as the
  // logo upload in src/app/admin/site-settings/actions.ts — a File object
  // can't be validated by the z.string() fields, and "remove image" is
  // handled by an explicit checkbox rather than an empty file input.
  const heroImageFile = formData.get("heroImageFile");
  const removeHeroImage = formData.get("removeHeroImage") === "on";
  formData.delete("heroImageFile");
  formData.delete("removeHeroImage");

  let heroImageUrl: string | null | undefined;
  if (heroImageFile instanceof File && heroImageFile.size > 0) {
    const result = await saveResizedImage(heroImageFile, { subfolder: "home", maxWidth: 1600 });
    if ("error" in result) return { error: result.error };
    heroImageUrl = result.url;
  } else if (removeHeroImage) {
    heroImageUrl = null;
  }

  const parsed = homeContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  const data = { ...parsed.data, ...(heroImageUrl !== undefined ? { heroImageUrl } : {}) };

  await prisma.homePageContent.upsert({
    where: { id: HOMEPAGE_CONTENT_ID },
    update: data,
    create: { id: HOMEPAGE_CONTENT_ID, ...data },
  });

  revalidatePath("/admin/site-content");
  revalidatePath("/");
  return { success: "บันทึกเนื้อหาหน้าแรกเรียบร้อยแล้ว" };
}
