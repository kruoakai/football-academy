"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { notifyLine } from "@/lib/line";
import { sendEmail } from "@/lib/email";
import { formatThaiDateTime } from "@/lib/thai";

async function notifyPaymentStatus(user: { email: string | null; lineUserId: string | null }, subject: string, text: string) {
  if (user.email) await sendEmail(user.email, subject, `<p>${text}</p>`);
  if (user.lineUserId) await notifyLine(user.lineUserId, text);
}

export async function recordCashPaymentAction(bookingId: string) {
  await requireRole(["ADMIN"]);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      schedule: { include: { course: true } },
      clinicService: true,
      student: { include: { guardian: { include: { user: true } } } },
    },
  });
  if (!booking || booking.status !== "PENDING_PAYMENT") {
    revalidatePath("/admin/finance");
    return;
  }

  const amount =
    booking.type === "ACADEMY" ? Number(booking.schedule?.course.price ?? 0) : Number(booking.clinicService?.price ?? 0);

  await prisma.$transaction([
    prisma.payment.upsert({
      where: { bookingId },
      create: { userId: booking.student.guardian.userId, amount, method: "cash", status: "PAID", bookingId },
      update: { amount, method: "cash", status: "PAID", rejectedReason: null, slipUrl: null, slipSubmittedAt: null },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } }),
  ]);

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyPaymentStatus(
    booking.student.guardian.user,
    "ยืนยันการชำระเงิน - ยินผัน ฟุตบอล อคาเดมี",
    `รับชำระเงินสดสำหรับ "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} เรียบร้อยแล้ว`
  );

  revalidatePath("/admin/finance");
}

export type SlipReviewState = { error?: string } | undefined;

export async function approvePaymentSlipAction(bookingId: string) {
  const session = await requireRole(["ADMIN"]);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
      student: { include: { guardian: { include: { user: true } } } },
    },
  });
  if (!booking || !booking.payment || booking.payment.status !== "AWAITING_VERIFICATION") {
    redirect("/admin/finance");
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: "PAID", verifiedByUserId: session.user.id, verifiedAt: new Date(), rejectedReason: null },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } }),
  ]);

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyPaymentStatus(
    booking.student.guardian.user,
    "ยืนยันการชำระเงิน - ยินผัน ฟุตบอล อคาเดมี",
    `ตรวจสอบสลิปการโอนเงินสำหรับ "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} ผ่านแล้ว ยืนยันการจองเรียบร้อย`
  );

  revalidatePath("/admin/finance");
  redirect("/admin/finance");
}

export async function rejectPaymentSlipAction(
  bookingId: string,
  _prevState: SlipReviewState,
  formData: FormData
): Promise<SlipReviewState> {
  await requireRole(["ADMIN"]);

  const reason = String(formData.get("reason") || "").trim();
  if (!reason) return { error: "กรุณาระบุเหตุผลที่ไม่ผ่านการตรวจสอบ" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
      student: { include: { guardian: { include: { user: true } } } },
    },
  });
  if (!booking || !booking.payment || booking.payment.status !== "AWAITING_VERIFICATION") {
    redirect("/admin/finance");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { bookingId },
      data: { status: "FAILED", rejectedReason: reason },
    });

    // Undo any promo redemption tied to this booking so the customer can
    // reuse the same code (or a different one) when they resubmit a slip.
    const redemption = await tx.promotionRedemption.findUnique({ where: { bookingId } });
    if (redemption) {
      const promotion = await tx.promotion.findUnique({ where: { id: redemption.promotionId } });
      await tx.promotion.update({
        where: { id: redemption.promotionId },
        data: {
          usedCount: { decrement: 1 },
          ...(promotion?.type === "GIFT" ? { giftStock: { increment: 1 } } : {}),
        },
      });
      await tx.promotionRedemption.delete({ where: { bookingId } });
    }
  });

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyPaymentStatus(
    booking.student.guardian.user,
    "สลิปไม่ผ่านการตรวจสอบ - ยินผัน ฟุตบอล อคาเดมี",
    `สลิปการโอนเงินสำหรับ "${label}" ของ ${booking.student.name} ไม่ผ่านการตรวจสอบ: ${reason} กรุณาอัปโหลดสลิปใหม่`
  );

  revalidatePath("/admin/finance");
  redirect("/admin/finance");
}
