"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { notifyLine } from "@/lib/line";
import { formatThaiDateTime } from "@/lib/thai";

async function loadOwnedBooking(bookingId: string, guardianUserId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, student: { guardian: { userId: guardianUserId } } },
    include: {
      student: { include: { guardian: { include: { user: true } } } },
      schedule: { include: { course: true } },
      clinicService: true,
    },
  });
}

export async function cancelBookingAction(bookingId: string) {
  const session = await verifySession();
  const booking = await loadOwnedBooking(bookingId, session.user.id);
  if (!booking) redirect("/dashboard/bookings");
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    redirect(`/dashboard/bookings/${bookingId}`);
  }

  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  await notifyLine(
    booking.student.guardian.user.lineUserId,
    `ยกเลิกการจอง "${label}" ของ ${booking.student.name} วันที่ ${formatThaiDateTime(booking.date)} แล้ว`
  );

  redirect(`/dashboard/bookings/${bookingId}`);
}

export async function rescheduleBookingAction(bookingId: string) {
  const session = await verifySession();
  const booking = await loadOwnedBooking(bookingId, session.user.id);
  if (!booking) redirect("/dashboard/bookings");

  if (booking.status !== "CANCELLED") {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  }

  redirect(`/dashboard/book?studentId=${booking.studentId}`);
}
