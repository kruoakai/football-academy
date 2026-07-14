"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";

const photoSchema = z.object({
  caption: z.string().optional().default(""),
});

export type GalleryPhotoFormState = { error?: string } | undefined;

// Extracted from formData before the rest of the fields go through the zod
// schema — a File object isn't a string and would fail that validation.
async function extractImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("imageFile");
  formData.delete("imageFile");
  if (file instanceof File && file.size > 0) {
    const result = await saveResizedImage(file, { subfolder: "gallery" });
    if ("error" in result) return { error: result.error };
    return { url: result.url };
  }
  return {};
}

export async function createGalleryPhotoAction(
  _prevState: GalleryPhotoFormState,
  formData: FormData
): Promise<GalleryPhotoFormState> {
  await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: imageUrl, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };
  // A gallery photo is nothing without a photo — required at create time,
  // unlike ClinicActivity where the image can be added later.
  if (!imageUrl) return { error: "กรุณาอัปโหลดรูปภาพ" };

  const parsed = photoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const maxOrder = await prisma.galleryPhoto.aggregate({ _max: { sortOrder: true } });

  await prisma.galleryPhoto.create({
    data: {
      caption: parsed.data.caption || null,
      imageUrl,
      published,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryPhotoAction(
  photoId: string,
  _prevState: GalleryPhotoFormState,
  formData: FormData
): Promise<GalleryPhotoFormState> {
  await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: imageUrl, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };

  const parsed = photoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.galleryPhoto.update({
    where: { id: photoId },
    data: {
      caption: parsed.data.caption || null,
      published,
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${photoId}`);
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryPhotoAction(photoId: string) {
  await requireRole(["ADMIN"]);
  await prisma.galleryPhoto.delete({ where: { id: photoId } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function toggleGalleryPhotoPublishedAction(photoId: string) {
  await requireRole(["ADMIN"]);
  const photo = await prisma.galleryPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  await prisma.galleryPhoto.update({
    where: { id: photoId },
    data: { published: !photo.published },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function moveGalleryPhotoAction(photoId: string, direction: "up" | "down") {
  await requireRole(["ADMIN"]);
  const photo = await prisma.galleryPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  const neighbor = await prisma.galleryPhoto.findFirst({
    where: {
      sortOrder: direction === "up" ? { lt: photo.sortOrder } : { gt: photo.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return; // already at the edge

  await prisma.$transaction([
    prisma.galleryPhoto.update({ where: { id: photo.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.galleryPhoto.update({ where: { id: neighbor.id }, data: { sortOrder: photo.sortOrder } }),
  ]);

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
