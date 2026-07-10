"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { SITE_SETTINGS_FIELDS, SITE_SETTINGS_ID } from "@/lib/site-settings";

const siteSettingsSchema = z.object(
  Object.fromEntries(SITE_SETTINGS_FIELDS.map((f) => [f, z.string().min(1, { error: "กรุณากรอกข้อความ" })]))
);

export type SiteSettingsFormState = { error?: string; success?: string } | undefined;

export async function updateSiteSettingsAction(
  _prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  await requireRole(["ADMIN"]);

  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: parsed.data,
    create: { id: SITE_SETTINGS_ID, ...parsed.data },
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/", "layout");
  return { success: "บันทึกส่วนหัว/ท้ายเว็บไซต์เรียบร้อยแล้ว" };
}
