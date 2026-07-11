"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB

export type SiteSettingsFormState = { error?: string; success?: string } | undefined;

export async function updateSiteSettingsAction(
  _prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  await requireRole(["ADMIN"]);

  // Handled separately from the text-field schema below — File objects
  // can't be validated by the z.string() fields, and an uploaded file
  // takes priority over whatever's typed in the logoUrl text input.
  const logoFile = formData.get("logoFile");
  formData.delete("logoFile");

  let uploadedLogoUrl: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_LOGO_TYPES.has(logoFile.type)) {
      return { error: "รองรับเฉพาะไฟล์ PNG, JPEG, WEBP หรือ SVG เท่านั้น" };
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "ไฟล์รูปโลโก้ต้องมีขนาดไม่เกิน 5MB" };
    }

    const ext = logoFile.type.split("/")[1] === "svg+xml" ? "svg" : logoFile.type.split("/")[1];
    const filename = `logo-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await logoFile.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    uploadedLogoUrl = `/images/uploads/${filename}`;
  }

  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  const data = { ...parsed.data, logoUrl: uploadedLogoUrl ?? (parsed.data.logoUrl || null) };

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: data,
    create: { id: SITE_SETTINGS_ID, ...data },
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/", "layout");
  return { success: "บันทึกส่วนหัว/ท้ายเว็บไซต์เรียบร้อยแล้ว" };
}
