"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

const updateStudentSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  dob: z.string().min(1, { error: "กรุณาเลือกวันเกิด" }),
  level: z.string().optional(),
  batchId: z.string().optional(),
});

export type StudentFormState = { error?: string; success?: string } | undefined;

export async function updateStudentAction(
  studentId: string,
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  await requireRole(["ADMIN"]);
  const parsed = updateStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.student.update({
    where: { id: studentId },
    data: {
      name: parsed.data.name,
      dob: new Date(parsed.data.dob),
      level: parsed.data.level || null,
      batchId: parsed.data.batchId || null,
    },
  });

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  return { success: "บันทึกข้อมูลนักเรียนแล้ว" };
}

// PDPA access-control note: injury records are not legally reviewed yet (see CLAUDE.md).
// This action — and every other read/write path for InjuryRecord — MUST stay gated to
// Role.ADMIN only. Do not relax this without a completed PDPA review.
const injuryRecordSchema = z.object({
  diagnosis: z.string().min(2, { error: "กรุณากรอกการวินิจฉัย/อาการ" }),
  treatmentNotes: z.string().optional(),
  clinicServiceId: z.string().optional(),
  date: z.string().min(1, { error: "กรุณาเลือกวันที่" }),
});

export type InjuryRecordFormState = { error?: string } | undefined;

export async function addInjuryRecordAction(
  studentId: string,
  _prevState: InjuryRecordFormState,
  formData: FormData
): Promise<InjuryRecordFormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = injuryRecordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.injuryRecord.create({
    data: {
      studentId,
      clinicServiceId: parsed.data.clinicServiceId || null,
      diagnosis: parsed.data.diagnosis,
      treatmentNotes: parsed.data.treatmentNotes || null,
      date: new Date(parsed.data.date),
      recordedBy: session.user.name ?? session.user.id,
    },
  });

  revalidatePath(`/admin/students/${studentId}`);
  return undefined;
}
