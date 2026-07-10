import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai";
import { updateStudentAction, addInjuryRecordAction } from "../actions";
import StudentEditForm from "../StudentEditForm";
import InjuryRecordForm from "../InjuryRecordForm";

export const metadata: Metadata = { title: "รายละเอียดนักเรียน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const enrollmentStatusLabel: Record<string, string> = {
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

const attendanceStatusLabel: Record<string, string> = {
  PRESENT: "มาเรียน",
  ABSENT: "ขาดเรียน",
  LATE: "มาสาย",
};

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [student, batches, clinicServices] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        guardian: { include: { user: true } },
        batch: { include: { course: true } },
        enrollments: { include: { course: true, batch: true }, orderBy: { startDate: "desc" } },
        bookings: {
          include: { schedule: { include: { course: true } }, clinicService: true },
          orderBy: { date: "desc" },
          take: 10,
        },
        attendance: { include: { activity: true }, orderBy: { checkedAt: "desc" }, take: 10 },
        injuryRecords: { include: { clinicService: true }, orderBy: { date: "desc" } },
      },
    }),
    prisma.batch.findMany({ include: { course: true }, orderBy: { startDate: "desc" } }),
    prisma.clinicService.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!student) notFound();

  const batchOptions = batches.map((b) => ({ id: b.id, label: `${b.course.name} · ${b.name}` }));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/students" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้านักเรียน
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">{student.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          รหัส {student.code} · ผู้ปกครอง: {student.guardian.user.name} (
          {student.guardian.user.phone ?? student.guardian.user.email})
        </p>
        {student.guardian.user.leadSource && (
          <p className="mt-1 text-sm text-neutral-500">รู้จักเราจาก: {student.guardian.user.leadSource}</p>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 font-heading text-lg font-semibold text-pitch-900">ข้อมูลนักเรียน</h2>
        <StudentEditForm
          action={updateStudentAction.bind(null, student.id)}
          batches={batchOptions}
          defaultValues={{
            name: student.name,
            dob: student.dob.toISOString().slice(0, 10),
            level: student.level,
            batchId: student.batchId,
          }}
        />
      </div>

      <div className={cardClass}>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">คอร์สที่ลงทะเบียน</h2>
        <div className="mt-3 flex flex-col gap-2">
          {student.enrollments.length === 0 && <p className="text-sm text-neutral-400">ยังไม่มีการลงทะเบียน</p>}
          {student.enrollments.map((e) => (
            <div key={e.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              {e.course.name} · {e.batch.name} —{" "}
              <span className="font-medium text-pitch-700">{enrollmentStatusLabel[e.status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">ประวัติการจอง (ล่าสุด 10 รายการ)</h2>
        <div className="mt-3 flex flex-col gap-2">
          {student.bookings.length === 0 && <p className="text-sm text-neutral-400">ยังไม่มีการจอง</p>}
          {student.bookings.map((b) => (
            <div key={b.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              {b.type === "ACADEMY" ? b.schedule?.course.name : b.clinicService?.name} ·{" "}
              {formatThaiDateTime(b.date)} — <span className="font-medium text-gold-600">{bookingStatusLabel[b.status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">ประวัติการเช็คชื่อ (ล่าสุด 10 รายการ)</h2>
        <div className="mt-3 flex flex-col gap-2">
          {student.attendance.length === 0 && <p className="text-sm text-neutral-400">ยังไม่มีประวัติเช็คชื่อ</p>}
          {student.attendance.map((a) => (
            <div key={a.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              {a.activity.name} · {formatThaiDate(a.activity.date)} —{" "}
              <span className="font-medium text-pitch-700">{attendanceStatusLabel[a.status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PDPA-sensitive section — ADMIN only, not linked from anywhere else in the app */}
      <div className="rounded-2xl border-2 border-gold-300 bg-gold-50 p-5 sm:p-6">
        <div className="mb-4 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-gold-800">
          ข้อมูลอ่อนไหว (การรักษา/บาดเจ็บ) — จำกัดสิทธิ์เฉพาะแอดมิน และยังไม่ผ่านการตรวจสอบตามกฎหมาย PDPA
          โปรดใช้ความระมัดระวังในการบันทึกและเปิดเผยข้อมูลนี้
        </div>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">ประวัติการรักษา/บาดเจ็บ</h2>
        <div className="mt-3 flex flex-col gap-2">
          {student.injuryRecords.length === 0 && <p className="text-sm text-neutral-500">ยังไม่มีบันทึก</p>}
          {student.injuryRecords.map((r) => (
            <div key={r.id} className="rounded-lg border border-gold-200 bg-white p-3 text-sm">
              <p className="font-medium text-pitch-900">
                {r.diagnosis} · {formatThaiDate(r.date)}
              </p>
              {r.treatmentNotes && <p className="mt-1 text-neutral-600">{r.treatmentNotes}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                {r.clinicService ? `บริการ: ${r.clinicService.name} · ` : ""}บันทึกโดย {r.recordedBy}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <InjuryRecordForm
            action={addInjuryRecordAction.bind(null, student.id)}
            clinicServices={clinicServices}
          />
        </div>
      </div>
    </div>
  );
}
