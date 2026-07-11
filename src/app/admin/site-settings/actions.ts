"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { SITE_SETTINGS_FIELDS, SITE_SETTINGS_ID } from "@/lib/site-settings";

// Accepts either a full URL (https://...) or a root-relative path
// (/images/logo.png) so a locally-hosted image works too, not just external links.
const logoUrlSchema = z.union([
  z.literal(""),
  z.url({ error: "URL โลโก้ไม่ถูกต้อง" }),
  z.string().regex(/^\/[^\s]+$/, { error: "URL โลโก้ไม่ถูกต้อง" }),
]);

const siteSettingsSchema = z.object({
  ...Object.fromEntries(SITE_SETTINGS_FIELDS.map((f) => [f, z.string().min(1, { error: "กรุณากรอกข้อความ" })])),
  logoUrl: logoUrlSchema.optional(),
});

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

  const data = { ...parsed.data, logoUrl: parsed.data.logoUrl || null };

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: data,
    create: { id: SITE_SETTINGS_ID, ...data },
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/", "layout");
  return { success: "บันทึกส่วนหัว/ท้ายเว็บไซต์เรียบร้อยแล้ว" };
}
