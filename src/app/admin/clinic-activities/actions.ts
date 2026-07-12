"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";

const activitySchema = z.object({
  category: z.enum(["ASSESSMENT", "TREATMENT", "FIELD"], { error: "กรุณาเลือกหมวดหมู่" }),
  title: z.string().min(2, { error: "กรุณากรอกชื่อกิจกรรม" }),
  caption: z.string().min(2, { error: "กรุณากรอกคำอธิบาย" }),
});

export type ClinicActivityFormState = { error?: string } | undefined;

// Extracted from formData before the rest of the fields go through the
// zod schema — a File object isn't a string and would fail that validation.
async function extractImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("imageFile");
  formData.delete("imageFile");
  if (file instanceof File && file.size > 0) {
    const result = await saveResizedImage(file, { subfolder: "clinic-activities" });
    if ("error" in result) return { error: result.error };
    return { url: result.url };
  }
  return {};
}

export async function createClinicActivityAction(
  _prevState: ClinicActivityFormState,
  formData: FormData
): Promise<ClinicActivityFormState> {
  await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: imageUrl, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };

  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const maxOrder = await prisma.clinicActivity.aggregate({
    where: { category: parsed.data.category },
    _max: { sortOrder: true },
  });

  await prisma.clinicActivity.create({
    data: {
      category: parsed.data.category,
      title: parsed.data.title,
      caption: parsed.data.caption,
      imageUrl: imageUrl ?? null,
      published,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/clinic-activities");
  revalidatePath("/clinic");
  redirect("/admin/clinic-activities");
}

export async function updateClinicActivityAction(
  activityId: string,
  _prevState: ClinicActivityFormState,
  formData: FormData
): Promise<ClinicActivityFormState> {
  await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: imageUrl, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };

  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.clinicActivity.update({
    where: { id: activityId },
    data: {
      category: parsed.data.category,
      title: parsed.data.title,
      caption: parsed.data.caption,
      published,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  revalidatePath("/admin/clinic-activities");
  revalidatePath(`/admin/clinic-activities/${activityId}`);
  revalidatePath("/clinic");
  redirect("/admin/clinic-activities");
}

export async function deleteClinicActivityAction(activityId: string) {
  await requireRole(["ADMIN"]);
  await prisma.clinicActivity.delete({ where: { id: activityId } });
  revalidatePath("/admin/clinic-activities");
  revalidatePath("/clinic");
  redirect("/admin/clinic-activities");
}

export async function toggleClinicActivityPublishedAction(activityId: string) {
  await requireRole(["ADMIN"]);
  const activity = await prisma.clinicActivity.findUnique({ where: { id: activityId } });
  if (!activity) return;

  await prisma.clinicActivity.update({
    where: { id: activityId },
    data: { published: !activity.published },
  });

  revalidatePath("/admin/clinic-activities");
  revalidatePath("/clinic");
}

export async function moveClinicActivityAction(activityId: string, direction: "up" | "down") {
  await requireRole(["ADMIN"]);
  const activity = await prisma.clinicActivity.findUnique({ where: { id: activityId } });
  if (!activity) return;

  const neighbor = await prisma.clinicActivity.findFirst({
    where: {
      category: activity.category,
      sortOrder: direction === "up" ? { lt: activity.sortOrder } : { gt: activity.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return; // already at the edge of its category

  await prisma.$transaction([
    prisma.clinicActivity.update({ where: { id: activity.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.clinicActivity.update({ where: { id: neighbor.id }, data: { sortOrder: activity.sortOrder } }),
  ]);

  revalidatePath("/admin/clinic-activities");
  revalidatePath("/clinic");
}
