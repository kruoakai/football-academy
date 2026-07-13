import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, inputClass, labelClass, buttonSecondaryClass } from "@/lib/admin-ui";
import { formatThaiDateTime } from "@/lib/thai";
import { recordCashPaymentAction } from "./actions";

export const metadata: Metadata = { title: "การเงิน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const bookingStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  COMPLETED: "เสร็จสิ้น",
};

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const fromDate = from ? new Date(`${from}T00:00:00`) : defaultFrom;
  const toDate = to ? new Date(`${to}T23:59:59`) : new Date(defaultTo.setHours(23, 59, 59));

  const bookings = await prisma.booking.findMany({
    where: { date: { gte: fromDate, lte: toDate }, status: { not: "CANCELLED" } },
    include: {
      student: true,
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
    },
    orderBy: { date: "desc" },
  });

  const totalRevenue = bookings
    .filter((b) => b.payment?.status === "PAID")
    .reduce((sum, b) => sum + Number(b.payment?.amount ?? 0), 0);
  const pendingCount = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">การเงิน</h1>
        <p className="mt-1 text-sm text-neutral-600">ภาพรวมรายรับและการชำระเงิน</p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <div>
          <label className={labelClass} htmlFor="from">
            จากวันที่
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={fromDate.toISOString().slice(0, 10)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="to">
            ถึงวันที่
          </label>
          <input id="to" name="to" type="date" defaultValue={toDate.toISOString().slice(0, 10)} className={inputClass} />
        </div>
        <button type="submit" className={buttonSecondaryClass}>
          กรอง
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-pitch-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">รายรับที่ชำระแล้ว (ช่วงที่เลือก)</p>
          <p className="mt-2 font-heading text-2xl font-bold text-pitch-900">{totalRevenue.toLocaleString()} บาท</p>
        </div>
        <div className="rounded-2xl border border-gold-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">รอชำระเงิน</p>
          <p className="mt-2 font-heading text-2xl font-bold text-gold-600">{pendingCount} รายการ</p>
        </div>
      </div>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>วันที่</th>
              <th className={thClass}>นักเรียน</th>
              <th className={thClass}>รายการ</th>
              <th className={thClass}>ยอด</th>
              <th className={thClass}>สถานะ</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const label = b.type === "ACADEMY" ? b.schedule?.course.name : b.clinicService?.name;
              const amount =
                b.payment?.amount ??
                (b.type === "ACADEMY" ? b.schedule?.course.price : b.clinicService?.price) ??
                0;
              return (
                <tr key={b.id}>
                  <td className={tdClass}>{formatThaiDateTime(b.date)}</td>
                  <td className={tdClass}>{b.student.name}</td>
                  <td className={tdClass}>{label}</td>
                  <td className={tdClass}>{Number(amount).toLocaleString()} บาท</td>
                  <td className={tdClass}>
                    {b.payment?.status === "AWAITING_VERIFICATION"
                      ? "รอตรวจสอบสลิป"
                      : b.payment
                        ? `${bookingStatusLabel[b.status]} (${b.payment.method})`
                        : bookingStatusLabel[b.status]}
                  </td>
                  <td className={tdClass}>
                    {b.payment?.status === "AWAITING_VERIFICATION" ? (
                      <Link
                        href={`/admin/finance/verify/${b.id}`}
                        className="text-sm font-medium text-gold-700 hover:underline"
                      >
                        ตรวจสอบสลิป
                      </Link>
                    ) : (
                      b.status === "PENDING_PAYMENT" && (
                        <form action={recordCashPaymentAction.bind(null, b.id)}>
                          <button type="submit" className="text-sm font-medium text-pitch-700 hover:underline">
                            บันทึกรับเงินสด
                          </button>
                        </form>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-neutral-400">ไม่มีข้อมูลในช่วงที่เลือก</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
