"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

// Phone is the primary login identifier across the app (used at registration,
// required nowhere at the DB level) — kept optional here too since not every
// existing account has one on file, same reasoning as the staff edit form.
const updateMemberSchema = z
  .object({
    name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
    phone: z.union([z.literal(""), z.string().regex(/^0[0-9]{8,9}$/, { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" })]).optional(),
    email: z.union([z.literal(""), z.email({ error: "อีเมลไม่ถูกต้อง" })]).optional(),
    password: z.union([z.literal(""), z.string().min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" })]).optional(),
  })
  .check((ctx) => {
    if (!ctx.value.phone && !ctx.value.email) {
      ctx.issues.push({
        code: "custom",
        message: "กรุณากรอกเบอร์โทรศัพท์หรืออีเมลอย่างน้อยหนึ่งช่อง",
        input: ctx.value,
        path: ["phone"],
      });
    }
  });

export type UpdateMemberFormState = { error?: string; success?: string } | undefined;

export async function updateMemberAccountAction(
  userId: string,
  _prevState: UpdateMemberFormState,
  formData: FormData
): Promise<UpdateMemberFormState> {
  await requireRole(["ADMIN"]);
  const parsed = updateMemberSchema.safeParse(Object.fromEntries(formData));
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
    await prisma.user.update({ where: { id: userId }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "เบอร์โทรศัพท์หรืออีเมลนี้ถูกใช้ในระบบแล้ว" };
    throw error;
  }

  revalidatePath(`/admin/members/${userId}`);
  revalidatePath("/admin/members");
  return { success: "บันทึกข้อมูลบัญชีแล้ว" };
}

export async function toggleMemberActiveAction(userId: string) {
  const session = await requireRole(["ADMIN"]);
  if (userId === session.user.id) {
    revalidatePath("/admin/members");
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({ where: { id: userId }, data: { active: !user.active } });
  revalidatePath("/admin/members");
}
