"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { notifyLine } from "@/lib/line";
import { formatThaiDateTime } from "@/lib/thai";

export async function mockPayAction(bookingId: string) {
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

  const amount =
    booking.type === "ACADEMY" ? Number(booking.schedule?.course.price ?? 0) : Number(booking.clinicService?.price ?? 0);

  await prisma.$transaction([
    prisma.payment.create({
      data: { userId: session.user.id, amount, method: "mock", status: "PAID", bookingId: booking.id },
    }),
    prisma.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } }),
  ]);

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyLine(
    booking.student.guardian.user.lineUserId,
    `ยืนยันการจอง "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} เรียบร้อยแล้ว`
  );

  redirect(`/dashboard/bookings/${booking.id}`);
}
