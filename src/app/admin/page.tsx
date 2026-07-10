import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "ภาพรวม | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [studentCount, revenueThisMonth, pendingPayments, todaysActivities, courseCount, coachCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", createdAt: { gte: startOfMonth } },
      }),
      prisma.booking.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.activity.count({ where: { date: { gte: startOfToday, lt: startOfTomorrow } } }),
      prisma.course.count(),
      prisma.coach.count(),
    ]);

  const cards = [
    { label: "นักเรียนทั้งหมด", value: studentCount.toLocaleString(), href: "/admin/students" },
    {
      label: "รายได้เดือนนี้",
      value: `${Number(revenueThisMonth._sum.amount ?? 0).toLocaleString()} บาท`,
      href: "/admin/finance",
    },
    { label: "การจองรอชำระ", value: pendingPayments.toLocaleString(), href: "/admin/finance" },
    { label: "กิจกรรมวันนี้", value: todaysActivities.toLocaleString(), href: "/admin/reports" },
    { label: "คอร์สที่เปิดอยู่", value: courseCount.toLocaleString(), href: "/admin/courses" },
    { label: "โค้ชทั้งหมด", value: coachCount.toLocaleString(), href: "/admin/coaches" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">ภาพรวมระบบ</h1>
        <p className="mt-1 text-sm text-neutral-600">สรุปข้อมูลสำคัญของยินผัน ฟุตบอล อคาเดมี</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-pitch-100 bg-white p-5 shadow-sm transition hover:border-pitch-300 hover:shadow-md"
          >
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-pitch-900">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
