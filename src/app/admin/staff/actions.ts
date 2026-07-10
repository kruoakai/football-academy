"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

const createAdminSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  phone: z
    .string()
    .min(1, { error: "กรุณากรอกเบอร์โทรศัพท์" })
    .regex(/^0[0-9]{8,9}$/, { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" }),
  email: z.union([z.literal(""), z.email({ error: "อีเมลไม่ถูกต้อง" })]).optional(),
  password: z.string().min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }),
});

export type StaffFormState = { error?: string } | undefined;

export async function createAdminAction(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  await requireRole(["ADMIN"]);
  const parsed = createAdminSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        passwordHash,
        role: "ADMIN",
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "เบอร์โทรศัพท์หรืออีเมลนี้ถูกใช้ในระบบแล้ว" };
    }
    throw error;
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function toggleActiveAction(userId: string) {
  const session = await requireRole(["ADMIN"]);
  if (userId === session.user.id) {
    redirect("/admin/staff?error=ไม่สามารถปิดใช้งานบัญชีของตัวเองได้");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin/staff");

  await prisma.user.update({ where: { id: userId }, data: { active: !user.active } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
