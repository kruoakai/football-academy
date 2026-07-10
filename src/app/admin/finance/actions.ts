"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { notifyLine } from "@/lib/line";
import { formatThaiDateTime } from "@/lib/thai";

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
    prisma.payment.create({
      data: { userId: booking.student.guardian.userId, amount, method: "cash", status: "PAID", bookingId },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } }),
  ]);

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyLine(
    booking.student.guardian.user.lineUserId,
    `รับชำระเงินสดสำหรับ "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} เรียบร้อยแล้ว`
  );

  revalidatePath("/admin/finance");
}
