"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

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

const guardianAccountSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  phone: z.union([z.literal(""), z.string().regex(/^0[0-9]{8,9}$/, { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" })]).optional(),
  email: z.union([z.literal(""), z.email({ error: "อีเมลไม่ถูกต้อง" })]).optional(),
  password: z.union([z.literal(""), z.string().min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" })]).optional(),
});

export type GuardianAccountFormState = { error?: string; success?: string } | undefined;

export async function updateGuardianAccountAction(
  studentId: string,
  guardianUserId: string,
  _prevState: GuardianAccountFormState,
  formData: FormData
): Promise<GuardianAccountFormState> {
  await requireRole(["ADMIN"]);
  const parsed = guardianAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const data: { name: string; phone: string | null; email: string | null; passwordHash?: string } = {
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
  };
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  try {
    await prisma.user.update({ where: { id: guardianUserId }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "เบอร์โทรศัพท์หรืออีเมลนี้ถูกใช้ในระบบแล้ว" };
    throw error;
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: "บันทึกบัญชีผู้ปกครองแล้ว" };
}
