"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { notifyLine } from "@/lib/line";
import { formatThaiDateTime } from "@/lib/thai";

export type PayState = { error?: string } | undefined;

export async function mockPayAction(
  bookingId: string,
  _prevState: PayState,
  formData: FormData
): Promise<PayState> {
  const session = await verifySession();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, student: { guardian: { userId: session.user.id } } },
    include: {
      schedule: { include: { course: true } },
      clinicService: true,
      student: { include: { guardian: { include: { user: true } } } },
    },
  });
  if (!booking) redirect("/dashboard/bookings");
  if (booking.status !== "PENDING_PAYMENT") redirect(`/pay/${bookingId}`);

  const baseAmount =
    booking.type === "ACADEMY" ? Number(booking.schedule?.course.price ?? 0) : Number(booking.clinicService?.price ?? 0);

  const promoCodeRaw = String(formData.get("promoCode") || "").trim().toUpperCase();
  let finalAmount = baseAmount;
  let promotionId: string | null = null;
  let promotionType: "DISCOUNT" | "GIFT" | null = null;
  let discountApplied: number | null = null;

  if (promoCodeRaw) {
    const promotion = await prisma.promotion.findUnique({ where: { code: promoCodeRaw } });
    const now = new Date();
    if (!promotion || !promotion.active) return { error: "ไม่พบรหัสโปรโมชั่นนี้" };
    if (now < promotion.validFrom || now > promotion.validTo) {
      return { error: "รหัสโปรโมชั่นหมดอายุหรือยังไม่เริ่มใช้งาน" };
    }
    if (promotion.maxUses !== null && promotion.usedCount >= promotion.maxUses) {
      return { error: "รหัสโปรโมชั่นนี้ถูกใช้ครบจำนวนแล้ว" };
    }
    if (promotion.type === "GIFT" && (promotion.giftStock === null || promotion.giftStock <= 0)) {
      return { error: "ของแถมหมดแล้ว" };
    }

    if (promotion.type === "DISCOUNT") {
      const discount =
        promotion.discountUnit === "PERCENT"
          ? (baseAmount * Number(promotion.value ?? 0)) / 100
          : Number(promotion.value ?? 0);
      finalAmount = Math.max(0, baseAmount - discount);
      discountApplied = baseAmount - finalAmount;
    }

    promotionId = promotion.id;
    promotionType = promotion.type;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: { userId: session.user.id, amount: finalAmount, method: "mock", status: "PAID", bookingId: booking.id },
      });
      await tx.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });

      if (promotionId) {
        const result = await tx.promotion.updateMany({
          where: {
            id: promotionId,
            active: true,
            ...(promotionType === "GIFT" ? { giftStock: { gt: 0 } } : {}),
          },
          data: {
            usedCount: { increment: 1 },
            ...(promotionType === "GIFT" ? { giftStock: { decrement: 1 } } : {}),
          },
        });
        if (result.count !== 1) {
          throw new Error("PROMO_RACE_CONDITION");
        }
        await tx.promotionRedemption.create({
          data: { promotionId, bookingId: booking.id, discountApplied },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROMO_RACE_CONDITION") {
      return { error: "รหัสโปรโมชั่นเพิ่งถูกใช้ครบจำนวนพอดี กรุณาลองใหม่โดยไม่ใส่โค้ด" };
    }
    throw error;
  }

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyLine(
    booking.student.guardian.user.lineUserId,
    `ยืนยันการจอง "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} เรียบร้อยแล้ว`
  );

  redirect(`/dashboard/bookings/${booking.id}`);
}
