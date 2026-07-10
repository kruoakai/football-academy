import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<string, string> = {
  PENDING: "รอเริ่มเรียน",
  ACTIVE: "กำลังเรียน",
  CANCELLED: "ยกเลิกแล้ว",
};

const bookingStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  COMPLETED: "เสร็จสิ้น",
};

export default async function DashboardPage() {
  const session = await verifySession();

  const guardian = await prisma.guardian.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        orderBy: { createdAt: "asc" },
        include: {
          enrollments: { include: { course: true, batch: true } },
          bookings: {
            where: { status: { not: "CANCELLED" }, date: { gte: new Date() } },
            orderBy: { date: "asc" },
            take: 3,
            include: { schedule: true, clinicService: true },
          },
        },
      },
    },
  });

  const students = guardian?.students ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">สวัสดี, {session.user.name}</h1>
        <p className="mt-1 text-sm text-neutral-600">ภาพรวมบุตรหลานและการจองของคุณ</p>
      </div>

      {students.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          ยังไม่มีข้อมูลนักเรียนในบัญชีนี้
        </div>
      )}

      <div className="flex flex-col gap-5">
        {students.map((student) => (
          <div key={student.id} className="rounded-2xl border border-pitch-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-pitch-900">{student.name}</h2>
                <p className="text-sm text-neutral-500">รหัสนักเรียน: {student.code}</p>
              </div>
              <Link
                href={`/dashboard/book?studentId=${student.id}`}
                className="flex min-h-[44px] items-center justify-center rounded-full bg-pitch-700 px-4 text-sm font-semibold text-white hover:bg-pitch-800"
              >
                จองคิว
              </Link>
            </div>

            {student.enrollments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-700">คอร์สที่ลงทะเบียน</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {student.enrollments.map((e) => (
                    <li key={e.id} className="text-sm text-neutral-600">
                      {e.course.name} · {e.batch.name} —{" "}
                      <span className="font-medium text-pitch-700">{statusLabel[e.status]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-700">การจองที่จะถึง</p>
              {student.bookings.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-400">ยังไม่มีการจอง</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {student.bookings.map((b) => (
                    <li key={b.id} className="text-sm text-neutral-600">
                      {new Date(b.date).toLocaleDateString("th-TH", { dateStyle: "medium" })} ·{" "}
                      {b.type === "ACADEMY" ? b.schedule?.venue : b.clinicService?.name} —{" "}
                      <span className="font-medium text-gold-600">{bookingStatusLabel[b.status]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
