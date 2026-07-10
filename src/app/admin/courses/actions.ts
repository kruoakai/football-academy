"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isForeignKeyError } from "@/lib/prisma-errors";

const courseSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อคอร์ส" }),
  ageGroup: z.string().min(1, { error: "กรุณากรอกช่วงอายุ" }),
  level: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { error: "ราคาต้องไม่ติดลบ" }),
});

export type CourseFormState = { error?: string } | undefined;

export async function createCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireRole(["ADMIN"]);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const course = await prisma.course.create({
    data: {
      name: parsed.data.name,
      ageGroup: parsed.data.ageGroup,
      level: parsed.data.level || null,
      description: parsed.data.description || null,
      price: parsed.data.price,
    },
  });

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourseAction(
  courseId: string,
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireRole(["ADMIN"]);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      name: parsed.data.name,
      ageGroup: parsed.data.ageGroup,
      level: parsed.data.level || null,
      description: parsed.data.description || null,
      price: parsed.data.price,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirect("/admin/courses");
}

export async function deleteCourseAction(courseId: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.course.delete({ where: { id: courseId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect("/admin/courses?error=ลบไม่ได้ เพราะมีรุ่นหรือนักเรียนผูกกับคอร์สนี้อยู่");
    }
    throw error;
  }
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
