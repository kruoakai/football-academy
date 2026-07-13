import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatThaiDateTime } from "@/lib/thai";
import { cardClass, buttonSecondaryClass } from "@/lib/admin-ui";
import { approvePaymentSlipAction } from "../../actions";
import RejectSlipForm from "./RejectSlipForm";

export const metadata: Metadata = { title: "ตรวจสอบสลิป | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function VerifySlipPage({ params }: { params: Promise<{ bookingId: string }> }) {
  await requireRole(["ADMIN"]);
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { include: { guardian: { include: { user: true } } } },
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
    },
  });
  if (!booking || !booking.payment || !booking.payment.slipUrl) notFound();

  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;
  const isPending = booking.payment.status === "AWAITING_VERIFICATION";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/finance" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าการเงิน
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">ตรวจสอบสลิปการโอนเงิน</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="mb-3 font-heading text-lg font-semibold text-pitch-900">รายละเอียดการจอง</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">นักเรียน</dt>
              <dd className="text-right font-medium text-pitch-900">{booking.student.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">ผู้ปกครอง</dt>
              <dd className="text-right font-medium text-pitch-900">{booking.student.guardian.user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">รายการ</dt>
              <dd className="text-right font-medium text-pitch-900">{label}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">วันที่นัดหมาย</dt>
              <dd className="text-right font-medium text-pitch-900">{formatThaiDateTime(booking.date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">ยอดชำระ</dt>
              <dd className="text-right font-semibold text-pitch-900">
                {Number(booking.payment.amount).toLocaleString()} บาท
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">ส่งสลิปเมื่อ</dt>
              <dd className="text-right font-medium text-pitch-900">
                {booking.payment.slipSubmittedAt ? formatThaiDateTime(booking.payment.slipSubmittedAt) : "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">สถานะปัจจุบัน</dt>
              <dd className="text-right font-medium text-pitch-900">
                {isPending ? "รอตรวจสอบ" : booking.payment.status === "PAID" ? "ยืนยันแล้ว" : "ไม่ผ่านการตรวจสอบ"}
              </dd>
            </div>
          </dl>

          {isPending && (
            <div className="mt-6 flex flex-col gap-4">
              <form action={approvePaymentSlipAction.bind(null, booking.id)}>
                <button
                  type="submit"
                  className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-pitch-700 px-5 text-sm font-semibold text-white hover:bg-pitch-800"
                >
                  อนุมัติ — ยืนยันการจอง
                </button>
              </form>
              <RejectSlipForm bookingId={booking.id} />
            </div>
          )}
          {!isPending && (
            <Link href="/admin/finance" className={`${buttonSecondaryClass} mt-6`}>
              กลับไปหน้าการเงิน
            </Link>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="mb-3 font-heading text-lg font-semibold text-pitch-900">รูปสลิป</h2>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <Image src={booking.payment.slipUrl} alt="สลิปการโอนเงิน" fill unoptimized className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
