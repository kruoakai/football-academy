import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/thai";
import { codeToQrDataUrl } from "@/lib/qrcode";
import { mockPayAction } from "./actions";
import PayForm from "./PayForm";

const statusMessage: Record<string, string> = {
  CONFIRMED: "ชำระเงินและยืนยันการจองเรียบร้อยแล้ว",
  CANCELLED: "การจองนี้ถูกยกเลิกแล้ว",
  COMPLETED: "การจองนี้เสร็จสิ้นแล้ว",
};

export default async function PayPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const session = await verifySession();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, student: { guardian: { userId: session.user.id } } },
    include: {
      student: true,
      schedule: { include: { course: true } },
      clinicService: true,
    },
  });
  if (!booking) notFound();

  const amount =
    booking.type === "ACADEMY" ? Number(booking.schedule?.course.price ?? 0) : Number(booking.clinicService?.price ?? 0);
  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  const qr = await codeToQrDataUrl(`MOCK-PAY:${booking.id}:${amount}`);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
          โหมดทดสอบ — ยังไม่ใช่การชำระเงินจริง
        </span>
        <h1 className="mt-4 font-heading text-xl font-bold text-pitch-900">ชำระเงินค่าจอง</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {label} — {booking.student.name}
        </p>
        <p className="text-sm text-neutral-600">{formatThaiDateTime(booking.date)}</p>

        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-pitch-50 p-6">
          <Image src={qr} alt="QR พร้อมเพย์ (จำลอง)" width={180} height={180} unoptimized />
          <p className="font-heading text-2xl font-bold text-pitch-900">{amount.toLocaleString()} บาท</p>
        </div>

        {booking.status === "PENDING_PAYMENT" ? (
          <PayForm action={mockPayAction.bind(null, booking.id)} />
        ) : (
          <p className="mt-6 rounded-lg bg-pitch-50 px-3 py-2 text-center text-sm font-medium text-pitch-800">
            {statusMessage[booking.status] ?? booking.status}
          </p>
        )}

        <Link
          href="/dashboard/bookings"
          className="mt-4 block text-center text-sm font-medium text-pitch-700 hover:text-pitch-900"
        >
          กลับไปหน้ารายการจอง
        </Link>
      </div>
    </div>
  );
}
