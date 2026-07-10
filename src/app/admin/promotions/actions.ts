"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

const promotionSchema = z
  .object({
    code: z.string().min(2, { error: "กรุณากรอกรหัสโปรโมชั่น" }),
    type: z.enum(["DISCOUNT", "GIFT"], { error: "กรุณาเลือกประเภท" }),
    value: z.string().optional(),
    discountUnit: z.string().optional(),
    giftItem: z.string().optional(),
    giftStock: z.string().optional(),
    targetGroup: z.string().optional(),
    validFrom: z.string().min(1, { error: "กรุณาเลือกวันเริ่ม" }),
    validTo: z.string().min(1, { error: "กรุณาเลือกวันสิ้นสุด" }),
    maxUses: z.string().optional(),
  })
  .check((ctx) => {
    const v = ctx.value;
    if (v.type === "DISCOUNT") {
      const num = Number(v.value);
      if (!v.value || Number.isNaN(num) || num <= 0) {
        ctx.issues.push({ code: "custom", message: "กรุณากรอกมูลค่าส่วนลดที่มากกว่า 0", input: v, path: ["value"] });
      }
      if (v.discountUnit !== "PERCENT" && v.discountUnit !== "AMOUNT") {
        ctx.issues.push({ code: "custom", message: "กรุณาเลือกหน่วยส่วนลด", input: v, path: ["discountUnit"] });
      }
    } else if (v.type === "GIFT") {
      if (!v.giftItem) {
        ctx.issues.push({ code: "custom", message: "กรุณากรอกชื่อของแถม", input: v, path: ["giftItem"] });
      }
      const stock = Number(v.giftStock);
      if (!v.giftStock || Number.isNaN(stock) || stock < 0) {
        ctx.issues.push({ code: "custom", message: "กรุณากรอกจำนวนของแถม", input: v, path: ["giftStock"] });
      }
    }
    if (new Date(v.validTo) < new Date(v.validFrom)) {
      ctx.issues.push({ code: "custom", message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม", input: v, path: ["validTo"] });
    }
  });

export type PromotionFormState = { error?: string } | undefined;

function buildData(parsed: z.infer<typeof promotionSchema>) {
  return {
    code: parsed.code.toUpperCase().trim(),
    type: parsed.type as "DISCOUNT" | "GIFT",
    value: parsed.type === "DISCOUNT" ? Number(parsed.value) : null,
    discountUnit: parsed.type === "DISCOUNT" ? (parsed.discountUnit as "PERCENT" | "AMOUNT") : null,
    giftItem: parsed.type === "GIFT" ? parsed.giftItem || null : null,
    giftStock: parsed.type === "GIFT" ? Number(parsed.giftStock) : null,
    targetGroup: parsed.targetGroup || null,
    validFrom: new Date(parsed.validFrom),
    validTo: new Date(`${parsed.validTo}T23:59:59`),
    maxUses: parsed.maxUses ? Number(parsed.maxUses) : null,
  };
}

export async function createPromotionAction(
  _prevState: PromotionFormState,
  formData: FormData
): Promise<PromotionFormState> {
  await requireRole(["ADMIN"]);
  const parsed = promotionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.promotion.create({ data: buildData(parsed.data) });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "รหัสโปรโมชั่นนี้ถูกใช้แล้ว" };
    throw error;
  }

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function updatePromotionAction(
  promotionId: string,
  _prevState: PromotionFormState,
  formData: FormData
): Promise<PromotionFormState> {
  await requireRole(["ADMIN"]);
  const parsed = promotionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.promotion.update({ where: { id: promotionId }, data: buildData(parsed.data) });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "รหัสโปรโมชั่นนี้ถูกใช้แล้ว" };
    throw error;
  }

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function togglePromotionActiveAction(promotionId: string) {
  await requireRole(["ADMIN"]);
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promo) redirect("/admin/promotions");
  await prisma.promotion.update({ where: { id: promotionId }, data: { active: !promo.active } });
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function deletePromotionAction(promotionId: string) {
  await requireRole(["ADMIN"]);
  await prisma.promotion.delete({ where: { id: promotionId } }).catch(() => null);
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}
