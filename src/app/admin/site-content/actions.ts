"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
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

  const parsed = homeContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง" };
  }

  await prisma.homePageContent.upsert({
    where: { id: HOMEPAGE_CONTENT_ID },
    update: parsed.data,
    create: { id: HOMEPAGE_CONTENT_ID, ...parsed.data },
  });

  revalidatePath("/admin/site-content");
  revalidatePath("/");
  return { success: "บันทึกเนื้อหาหน้าแรกเรียบร้อยแล้ว" };
}
