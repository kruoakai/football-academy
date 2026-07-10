"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateStudentCode } from "@/lib/codes";
import { signIn } from "@/auth";
import { registrationSchema, type RegistrationInput } from "./schema";

export type RegisterState = { error?: string } | undefined;

export async function registerAction(input: RegistrationInput): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
  }
  const { courseId, batchId, guardian, students } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ phone: guardian.phone }, ...(guardian.email ? [{ email: guardian.email }] : [])],
    },
  });
  if (existing) {
    return { error: "เบอร์โทรศัพท์หรืออีเมลนี้ถูกใช้สมัครไว้แล้ว กรุณาเข้าสู่ระบบแทน" };
  }

  const batch = await prisma.batch.findFirst({ where: { id: batchId, courseId } });
  if (!batch) {
    return { error: "ไม่พบรุ่นที่เลือก กรุณาลองใหม่" };
  }

  const passwordHash = await bcrypt.hash(guardian.password, 10);
  const leadSource =
    guardian.leadSource === "เพื่อนแนะนำ" && guardian.referrerName
      ? `เพื่อนแนะนำ: ${guardian.referrerName}`
      : guardian.leadSource;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: guardian.name,
        phone: guardian.phone,
        email: guardian.email ? guardian.email : null,
        passwordHash,
        role: "GUARDIAN",
        leadSource,
      },
    });

    const guardianRow = await tx.guardian.create({ data: { userId: user.id } });

    for (const s of students) {
      const student = await tx.student.create({
        data: {
          guardianId: guardianRow.id,
          code: generateStudentCode(),
          name: s.name,
          dob: new Date(s.dob),
          level: s.level || null,
          batchId,
        },
      });

      await tx.enrollment.create({
        data: {
          studentId: student.id,
          courseId,
          batchId,
          status: "PENDING",
        },
      });
    }
  });

  await signIn("credentials", {
    identifier: guardian.phone,
    password: guardian.password,
    redirectTo: "/register/success",
  });
}
