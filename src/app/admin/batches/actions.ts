"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isForeignKeyError } from "@/lib/prisma-errors";
import { THAI_DAY_NAMES } from "@/lib/thai";

const batchSchema = z.object({
  courseId: z.string().min(1, { error: "กรุณาเลือกคอร์ส" }),
  name: z.string().min(1, { error: "กรุณากรอกชื่อรุ่น" }),
  startDate: z.string().min(1, { error: "กรุณาเลือกวันเริ่ม" }),
  endDate: z.string().min(1, { error: "กรุณาเลือกวันสิ้นสุด" }),
  sessionTime: z.string().min(1, { error: "กรุณากรอกเวลาเรียน" }),
});

export type BatchFormState = { error?: string } | undefined;

export async function createBatchAction(
  _prevState: BatchFormState,
  formData: FormData
): Promise<BatchFormState> {
  await requireRole(["ADMIN"]);
  const parsed = batchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const batch = await prisma.batch.create({
    data: {
      courseId: parsed.data.courseId,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      sessionTime: parsed.data.sessionTime,
    },
  });

  revalidatePath("/admin/batches");
  redirect(`/admin/batches/${batch.id}`);
}

export async function updateBatchAction(
  batchId: string,
  _prevState: BatchFormState,
  formData: FormData
): Promise<BatchFormState> {
  await requireRole(["ADMIN"]);
  const parsed = batchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.batch.update({
    where: { id: batchId },
    data: {
      courseId: parsed.data.courseId,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      sessionTime: parsed.data.sessionTime,
    },
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
  redirect(`/admin/batches/${batchId}`);
}

export async function deleteBatchAction(batchId: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.batch.delete({ where: { id: batchId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect("/admin/batches?error=ลบไม่ได้ เพราะมีนักเรียนหรือตารางฝึกผูกกับรุ่นนี้อยู่");
    }
    throw error;
  }
  revalidatePath("/admin/batches");
  redirect("/admin/batches");
}

const scheduleSchema = z.object({
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  coachId: z.string().min(1, { error: "กรุณาเลือกโค้ช" }),
  day: z.enum(THAI_DAY_NAMES as [string, ...string[]], { error: "กรุณาเลือกวัน" }),
  time: z.string().min(1, { error: "กรุณากรอกเวลา เช่น 09:00-10:30" }),
  venue: z.string().min(1, { error: "กรุณากรอกสถานที่" }),
});

export type ScheduleFormState = { error?: string } | undefined;

export async function addScheduleAction(
  batchId: string,
  courseId: string,
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  await requireRole(["ADMIN"]);
  const parsed = scheduleSchema.safeParse({
    courseId,
    batchId,
    coachId: formData.get("coachId"),
    day: formData.get("day"),
    time: formData.get("time"),
    venue: formData.get("venue"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.courseSchedule.create({ data: parsed.data });
  revalidatePath(`/admin/batches/${batchId}`);
  return undefined;
}

export async function deleteScheduleAction(batchId: string, scheduleId: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.courseSchedule.delete({ where: { id: scheduleId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect(`/admin/batches/${batchId}?error=ลบไม่ได้ เพราะมีการจองผูกกับตารางฝึกนี้อยู่`);
    }
    throw error;
  }
  revalidatePath(`/admin/batches/${batchId}`);
  redirect(`/admin/batches/${batchId}`);
}
