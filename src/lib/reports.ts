import "server-only";
import { prisma } from "@/lib/prisma";
import { formatThaiDate, formatThaiDateTime } from "@/lib/thai";
import type { ExportColumn } from "@/lib/export";

export type ReportFilters = {
  from?: string;
  to?: string;
  courseId?: string;
  batchId?: string;
  status?: string;
};

export type ReportResult = { columns: ExportColumn[]; rows: Record<string, unknown>[] };

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

export async function getRegistrationsReport(filters: ReportFilters): Promise<ReportResult> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(filters.from || filters.to
        ? {
            startDate: {
              ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00`) } : {}),
              ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(filters.courseId ? { courseId: filters.courseId } : {}),
      ...(filters.batchId ? { batchId: filters.batchId } : {}),
      ...(filters.status ? { status: filters.status as "PENDING" | "ACTIVE" | "CANCELLED" } : {}),
    },
    include: { student: { include: { guardian: { include: { user: true } } } }, course: true, batch: true },
    orderBy: { startDate: "desc" },
  });

  const columns: ExportColumn[] = [
    { header: "วันที่ลงทะเบียน", key: "date", width: 2 },
    { header: "นักเรียน", key: "student", width: 2 },
    { header: "รหัสนักเรียน", key: "code", width: 2 },
    { header: "ผู้ปกครอง", key: "guardian", width: 2 },
    { header: "เบอร์โทร", key: "phone", width: 2 },
    { header: "คอร์ส", key: "course", width: 2 },
    { header: "รุ่น", key: "batch", width: 2 },
    { header: "สถานะ", key: "status", width: 1 },
    { header: "รู้จักเราจาก", key: "leadSource", width: 2 },
  ];
  const rows = enrollments.map((e) => ({
    date: formatThaiDate(e.startDate),
    student: e.student.name,
    code: e.student.code,
    guardian: e.student.guardian.user.name,
    phone: e.student.guardian.user.phone ?? "-",
    course: e.course.name,
    batch: e.batch.name,
    status: enrollmentStatusLabel[e.status] ?? e.status,
    leadSource: e.student.guardian.user.leadSource ?? "-",
  }));
  return { columns, rows };
}

export async function getBookingsReport(filters: ReportFilters): Promise<ReportResult> {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(filters.from || filters.to
        ? {
            date: {
              ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00`) } : {}),
              ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(filters.status
        ? { status: filters.status as "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED" }
        : {}),
    },
    include: { student: true, schedule: { include: { course: true } }, clinicService: true, payment: true },
    orderBy: { date: "desc" },
  });

  const columns: ExportColumn[] = [
    { header: "วันเวลา", key: "date", width: 2 },
    { header: "นักเรียน", key: "student", width: 2 },
    { header: "ประเภท", key: "type", width: 1 },
    { header: "รายการ", key: "item", width: 2 },
    { header: "สถานะ", key: "status", width: 1 },
    { header: "ยอดชำระ", key: "amount", width: 1 },
  ];
  const rows = bookings.map((b) => ({
    date: formatThaiDateTime(b.date),
    student: b.student.name,
    type: b.type === "ACADEMY" ? "ฝึกซ้อม" : "คลินิก",
    item: (b.type === "ACADEMY" ? b.schedule?.course.name : b.clinicService?.name) ?? "-",
    status: bookingStatusLabel[b.status] ?? b.status,
    amount: b.payment ? `${Number(b.payment.amount).toLocaleString()} บาท` : "-",
  }));
  return { columns, rows };
}

export async function getCohortReport(filters: ReportFilters): Promise<ReportResult> {
  const students = await prisma.student.findMany({
    where: {
      ...(filters.batchId ? { batchId: filters.batchId } : {}),
      ...(filters.courseId ? { batch: { courseId: filters.courseId } } : {}),
    },
    include: { batch: { include: { course: true } }, guardian: { include: { user: true } } },
    orderBy: { name: "asc" },
  });

  const columns: ExportColumn[] = [
    { header: "รุ่น", key: "batch", width: 2 },
    { header: "คอร์ส", key: "course", width: 2 },
    { header: "นักเรียน", key: "student", width: 2 },
    { header: "รหัส", key: "code", width: 1 },
    { header: "ระดับ", key: "level", width: 1 },
    { header: "ผู้ปกครอง", key: "guardian", width: 2 },
    { header: "เบอร์โทร", key: "phone", width: 2 },
  ];
  const rows = students.map((s) => ({
    batch: s.batch?.name ?? "-",
    course: s.batch?.course.name ?? "-",
    student: s.name,
    code: s.code,
    level: s.level ?? "-",
    guardian: s.guardian.user.name,
    phone: s.guardian.user.phone ?? "-",
  }));
  return { columns, rows };
}

export async function getAttendanceReport(filters: ReportFilters): Promise<ReportResult> {
  const dateFilter =
    filters.from || filters.to
      ? {
          ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00`) } : {}),
          ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
        }
      : undefined;

  const records = await prisma.attendance.findMany({
    where: {
      activity: {
        ...(dateFilter ? { date: dateFilter } : {}),
        ...(filters.batchId ? { batchId: filters.batchId } : {}),
      },
    },
    include: { student: true, activity: { include: { batch: { include: { course: true } } } } },
    orderBy: { checkedAt: "desc" },
  });

  const columns: ExportColumn[] = [
    { header: "วันที่กิจกรรม", key: "date", width: 2 },
    { header: "กิจกรรม", key: "activity", width: 2 },
    { header: "รุ่น", key: "batch", width: 2 },
    { header: "นักเรียน", key: "student", width: 2 },
    { header: "สถานะ", key: "status", width: 1 },
    { header: "วิธีเช็คชื่อ", key: "method", width: 1 },
  ];
  const rows = records.map((r) => ({
    date: formatThaiDate(r.activity.date),
    activity: r.activity.name,
    batch: r.activity.batch ? `${r.activity.batch.course.name} · ${r.activity.batch.name}` : "-",
    student: r.student.name,
    status: attendanceStatusLabel[r.status] ?? r.status,
    method: r.method === "QR" ? "QR" : "บันทึกมือ",
  }));
  return { columns, rows };
}

export const REPORT_TYPES = ["registrations", "bookings", "cohort", "attendance"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_LABELS: Record<ReportType, string> = {
  registrations: "รายงานผู้สมัคร",
  bookings: "รายงานตารางนัดหมาย",
  cohort: "รายงานรายรุ่น",
  attendance: "รายงานเช็คชื่อ",
};

export async function getReport(type: ReportType, filters: ReportFilters): Promise<ReportResult> {
  switch (type) {
    case "registrations":
      return getRegistrationsReport(filters);
    case "bookings":
      return getBookingsReport(filters);
    case "cohort":
      return getCohortReport(filters);
    case "attendance":
      return getAttendanceReport(filters);
  }
}
