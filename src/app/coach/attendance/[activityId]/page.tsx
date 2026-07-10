import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ScanInput from "./ScanInput";
import { markManualAction } from "./actions";

const statusLabel: Record<string, string> = { PRESENT: "มาเรียน", ABSENT: "ขาดเรียน", LATE: "มาสาย" };

export default async function AttendanceActivityPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  await requireRole(["COACH", "ADMIN"]);
  const { activityId } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { batch: { include: { course: true, students: { orderBy: { name: "asc" } } } } },
  });
  if (!activity) notFound();

  const attendanceRecords = await prisma.attendance.findMany({ where: { activityId } });
  const attendanceByStudent = new Map(attendanceRecords.map((a) => [a.studentId, a]));
  const students = activity.batch?.students ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/coach/attendance" className="text-sm font-medium text-pitch-700 hover:text-pitch-900">
          ← กลับ
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">{activity.name}</h1>
        <p className="text-sm text-neutral-600">
          {activity.batch?.course.name} {activity.batch?.name}
        </p>
      </div>

      <ScanInput activityId={activityId} />

      <div className="flex flex-col gap-2">
        {students.length === 0 && <p className="text-sm text-neutral-500">ไม่มีนักเรียนในรุ่นนี้</p>}
        {students.map((s) => {
          const record = attendanceByStudent.get(s.id);
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-pitch-900">{s.name}</p>
                <p className="text-xs text-neutral-500">
                  {s.code}
                  {record ? ` · ${statusLabel[record.status]} (${record.method === "QR" ? "QR" : "บันทึกมือ"})` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {(["PRESENT", "LATE", "ABSENT"] as const).map((status) => {
                  const markStatus = markManualAction.bind(null, activityId, s.id, status);
                  const active = record?.status === status;
                  const activeColor =
                    status === "PRESENT"
                      ? "bg-pitch-700 text-white"
                      : status === "LATE"
                        ? "bg-gold-500 text-pitch-950"
                        : "bg-red-500 text-white";
                  return (
                    <form key={status} action={markStatus}>
                      <button
                        type="submit"
                        className={`min-h-[44px] rounded-lg px-3 text-xs font-semibold ${
                          active ? activeColor : "border border-neutral-300 text-neutral-600"
                        }`}
                      >
                        {statusLabel[status]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
