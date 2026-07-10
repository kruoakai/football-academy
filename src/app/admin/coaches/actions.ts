"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isUniqueConstraintError, isForeignKeyError } from "@/lib/prisma-errors";

const createCoachSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  phone: z
    .string()
    .min(1, { error: "กรุณากรอกเบอร์โทรศัพท์" })
    .regex(/^0[0-9]{8,9}$/, { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" }),
  email: z.union([z.literal(""), z.email({ error: "อีเมลไม่ถูกต้อง" })]).optional(),
  password: z.string().min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }),
  bio: z.string().optional(),
  specialty: z.string().optional(),
});

export type CoachFormState = { error?: string } | undefined;

export async function createCoachAction(
  _prevState: CoachFormState,
  formData: FormData
): Promise<CoachFormState> {
  await requireRole(["ADMIN"]);
  const parsed = createCoachSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  let coachId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        passwordHash,
        role: "COACH",
      },
    });
    const coach = await prisma.coach.create({
      data: { userId: user.id, bio: parsed.data.bio || null, specialty: parsed.data.specialty || null },
    });
    coachId = coach.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "เบอร์โทรศัพท์หรืออีเมลนี้ถูกใช้ในระบบแล้ว" };
    }
    throw error;
  }

  revalidatePath("/admin/coaches");
  redirect(`/admin/coaches/${coachId}`);
}

const updateCoachSchema = z.object({
  bio: z.string().optional(),
  specialty: z.string().optional(),
});

export async function updateCoachAction(
  coachId: string,
  _prevState: CoachFormState,
  formData: FormData
): Promise<CoachFormState> {
  await requireRole(["ADMIN"]);
  const parsed = updateCoachSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.coach.update({
    where: { id: coachId },
    data: { bio: parsed.data.bio || null, specialty: parsed.data.specialty || null },
  });

  revalidatePath("/admin/coaches");
  revalidatePath(`/admin/coaches/${coachId}`);
  redirect("/admin/coaches");
}

export async function deleteCoachAction(coachId: string) {
  await requireRole(["ADMIN"]);
  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach) redirect("/admin/coaches");

  try {
    await prisma.coach.delete({ where: { id: coachId } });
    await prisma.user.delete({ where: { id: coach.userId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect("/admin/coaches?error=ลบไม่ได้ เพราะโค้ชคนนี้ยังมีตารางฝึกหรือประวัติผูกอยู่");
    }
    throw error;
  }
  revalidatePath("/admin/coaches");
  redirect("/admin/coaches");
}
