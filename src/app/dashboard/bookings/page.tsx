import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/thai";

export const metadata: Metadata = { title: "การจองของฉัน | ยินผัน ฟุตบอล อคาเดมี" };

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  COMPLETED: "เสร็จสิ้น",
};

const statusColor: Record<string, string> = {
  PENDING_PAYMENT: "bg-gold-100 text-gold-700",
  CONFIRMED: "bg-pitch-100 text-pitch-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  COMPLETED: "bg-neutral-100 text-neutral-500",
};

export default async function BookingsPage() {
  const session = await verifySession();

  const bookings = await prisma.booking.findMany({
    where: { student: { guardian: { userId: session.user.id } } },
    orderBy: { date: "desc" },
    include: { student: true, schedule: { include: { course: true } }, clinicService: true },
  });

  const now = new Date();
  const upcoming = bookings.filter((b) => b.date >= now && b.status !== "CANCELLED");
  const past = bookings.filter((b) => b.date < now || b.status === "CANCELLED");

  function BookingRow({ booking }: { booking: (typeof bookings)[number] }) {
    const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
    return (
      <Link
        href={`/dashboard/bookings/${booking.id}`}
        className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4 hover:border-pitch-300"
      >
        <div>
          <p className="font-medium text-pitch-900">{label}</p>
          <p className="text-sm text-neutral-600">
            {booking.student.name} · {formatThaiDateTime(booking.date)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[booking.status]}`}>
          {statusLabel[booking.status]}
        </span>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-pitch-900">การจองของฉัน</h1>
        <Link
          href="/dashboard/book"
          className="flex min-h-[44px] items-center justify-center rounded-full bg-pitch-700 px-4 text-sm font-semibold text-white hover:bg-pitch-800"
        >
          จองใหม่
        </Link>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-pitch-800">จะถึง</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">ยังไม่มีการจองที่จะถึง</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-pitch-800">ผ่านไปแล้ว / ยกเลิก</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">ยังไม่มีประวัติการจอง</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
