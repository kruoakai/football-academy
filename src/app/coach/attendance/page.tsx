import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/thai";

export const metadata: Metadata = { title: "เช็คชื่อวันนี้ | ยินผัน ฟุตบอล อคาเดมี" };

const activityTypeLabel: Record<string, string> = {
  PRACTICE: "ฝึกซ้อม",
  MATCH: "แข่งขัน",
  CAMP: "แคมป์",
  ASSESSMENT: "ประเมินผล",
  CLINIC_GROUP: "คลินิกกลุ่ม",
};

export default async function CoachAttendancePage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let batchIdFilter: string[] | undefined;
  if (session.user.role === "COACH") {
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: { schedules: true },
    });
    batchIdFilter = coach ? Array.from(new Set(coach.schedules.map((s) => s.batchId))) : [];
  }

  const activities = await prisma.activity.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      ...(batchIdFilter ? { batchId: { in: batchIdFilter } } : {}),
    },
    include: { batch: { include: { course: true, students: true } }, attendance: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">เช็คชื่อวันนี้</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {today.toLocaleDateString("th-TH", { dateStyle: "full" })}
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          ไม่มีกิจกรรมวันนี้
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((a) => (
            <Link
              key={a.id}
              href={`/coach/attendance/${a.id}`}
              className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-pitch-300"
            >
              <div>
                <p className="font-medium text-pitch-900">
                  {a.name} · {activityTypeLabel[a.type]}
                </p>
                <p className="text-sm text-neutral-600">
                  {a.batch?.course.name ?? ""} {a.batch?.name ?? ""} · {formatThaiDateTime(a.date)}
                </p>
              </div>
              <span className="rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold text-pitch-700">
                เช็คแล้ว {a.attendance.length}/{a.batch?.students.length ?? 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
