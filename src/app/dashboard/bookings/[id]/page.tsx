import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/thai";
import { cancelBookingAction, rescheduleBookingAction } from "../actions";

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  COMPLETED: "เสร็จสิ้น",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();

  const booking = await prisma.booking.findFirst({
    where: { id, student: { guardian: { userId: session.user.id } } },
    include: {
      student: true,
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
    },
  });
  if (!booking) notFound();

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  const canManage = booking.status === "PENDING_PAYMENT" || booking.status === "CONFIRMED";
  const cancelThisBooking = cancelBookingAction.bind(null, booking.id);
  const rescheduleThisBooking = rescheduleBookingAction.bind(null, booking.id);

  return (
    <div className="mx-auto max-w-lg px-0">
      <Link href="/dashboard/bookings" className="text-sm font-medium text-pitch-700 hover:text-pitch-900">
        ← กลับไปหน้ารายการจอง
      </Link>

      <div className="mt-4 rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold text-pitch-700">
          {statusLabel[booking.status]}
        </span>
        <h1 className="mt-3 font-heading text-xl font-bold text-pitch-900">{label}</h1>
        <p className="mt-2 text-sm text-neutral-600">นักเรียน: {booking.student.name}</p>
        <p className="text-sm text-neutral-600">วันเวลา: {formatThaiDateTime(booking.date)}</p>
        {booking.type === "ACADEMY" && booking.schedule && (
          <p className="text-sm text-neutral-600">สถานที่: {booking.schedule.venue}</p>
        )}
        {booking.payment && (
          <p className="mt-2 text-sm text-neutral-600">
            ชำระเงิน: {Number(booking.payment.amount).toLocaleString()} บาท ({booking.payment.status})
          </p>
        )}

        {booking.status === "PENDING_PAYMENT" && (
          <Link
            href={`/pay/${booking.id}`}
            className="mt-4 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400"
          >
            ไปชำระเงิน
          </Link>
        )}

        {canManage && (
          <div className="mt-4 flex gap-3">
            <form action={rescheduleThisBooking} className="flex-1">
              <button
                type="submit"
                className="min-h-[44px] w-full rounded-full border border-pitch-300 px-4 text-sm font-semibold text-pitch-700 hover:bg-pitch-50"
              >
                เลื่อนนัด
              </button>
            </form>
            <form action={cancelThisBooking} className="flex-1">
              <button
                type="submit"
                className="min-h-[44px] w-full rounded-full border border-red-300 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                ยกเลิกการจอง
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
