"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { notifyLine } from "@/lib/line";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const statusLabelTh: Record<AttendanceStatus, string> = {
  PRESENT: "มาเรียน",
  ABSENT: "ขาดเรียน",
  LATE: "มาสาย",
};

async function upsertAttendance(
  activityId: string,
  studentId: string,
  status: AttendanceStatus,
  method: "QR" | "MANUAL",
  checkedBy: string
) {
  await prisma.attendance.upsert({
    where: { studentId_activityId: { studentId, activityId } },
    update: { status, method, checkedBy, checkedAt: new Date() },
    create: { studentId, activityId, status, method, checkedBy },
  });
}

export type MarkByCodeState = { error?: string; success?: string } | undefined;

export async function markByCodeAction(
  activityId: string,
  _prevState: MarkByCodeState,
  formData: FormData
): Promise<MarkByCodeState> {
  const session = await requireRole(["COACH", "ADMIN"]);
  const code = String(formData.get("code") || "").trim();
  if (!code) return { error: "กรุณากรอกหรือสแกนรหัสนักเรียน" };

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return { error: "ไม่พบกิจกรรม" };

  const student = await prisma.student.findFirst({
    where: { code, batchId: activity.batchId ?? undefined },
    include: { guardian: { include: { user: true } } },
  });
  if (!student) return { error: "ไม่พบนักเรียนที่มีรหัสนี้ในรุ่นนี้" };

  await upsertAttendance(activityId, student.id, "PRESENT", "QR", session.user.id);
  await notifyLine(
    student.guardian.user.lineUserId,
    `เช็คชื่อเข้าเรียนสำเร็จ: ${student.name} (${activity.name})`
  );

  revalidatePath(`/coach/attendance/${activityId}`);
  return { success: `เช็คชื่อ ${student.name} สำเร็จ` };
}

export async function markManualAction(activityId: string, studentId: string, status: AttendanceStatus) {
  const session = await requireRole(["COACH", "ADMIN"]);
  await upsertAttendance(activityId, studentId, status, "MANUAL", session.user.id);

  const [student, activity] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, include: { guardian: { include: { user: true } } } }),
    prisma.activity.findUnique({ where: { id: activityId } }),
  ]);
  if (student && activity) {
    await notifyLine(
      student.guardian.user.lineUserId,
      `เช็คชื่อเข้าเรียน: ${student.name} (${activity.name}) — ${statusLabelTh[status]}`
    );
  }

  revalidatePath(`/coach/attendance/${activityId}`);
}
