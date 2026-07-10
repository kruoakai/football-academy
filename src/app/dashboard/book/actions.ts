"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { thaiDayName } from "@/lib/thai";

const bookingSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(["ACADEMY", "CLINIC"]),
  scheduleId: z.string().optional(),
  clinicServiceId: z.string().optional(),
  date: z.string().min(1, { error: "กรุณาเลือกวันที่" }),
  time: z.string().optional(),
});

export type BookingState = { error?: string } | undefined;

export async function createBookingAction(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const session = await verifySession();

  const parsed = bookingSchema.safeParse({
    studentId: formData.get("studentId"),
    type: formData.get("type"),
    scheduleId: formData.get("scheduleId") || undefined,
    clinicServiceId: formData.get("clinicServiceId") || undefined,
    date: formData.get("date"),
    time: formData.get("time") || undefined,
  });
  if (!parsed.success) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }
  const { studentId, type, scheduleId, clinicServiceId, date, time } = parsed.data;

  const student = await prisma.student.findFirst({
    where: { id: studentId, guardian: { userId: session.user.id } },
  });
  if (!student) {
    return { error: "ไม่พบข้อมูลนักเรียน" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let bookingDateTime: Date;

  if (type === "ACADEMY") {
    if (!scheduleId) return { error: "กรุณาเลือกตารางฝึกซ้อม" };
    const schedule = await prisma.courseSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) return { error: "ไม่พบตารางฝึกซ้อมที่เลือก" };

    const chosenDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(chosenDate.getTime()) || chosenDate < today) {
      return { error: "กรุณาเลือกวันที่ในอนาคต" };
    }
    if (thaiDayName(chosenDate) !== schedule.day) {
      return { error: `วันที่เลือกต้องตรงกับวัน${schedule.day}ตามตารางฝึกซ้อม` };
    }
    const startTime = schedule.time.split("-")[0]?.trim() || "09:00";
    bookingDateTime = new Date(`${date}T${startTime}:00`);
  } else {
    if (!clinicServiceId) return { error: "กรุณาเลือกบริการคลินิก" };
    if (!time) return { error: "กรุณาเลือกเวลา" };
    const service = await prisma.clinicService.findUnique({ where: { id: clinicServiceId } });
    if (!service) return { error: "ไม่พบบริการที่เลือก" };

    bookingDateTime = new Date(`${date}T${time}:00`);
    if (Number.isNaN(bookingDateTime.getTime()) || bookingDateTime < new Date()) {
      return { error: "กรุณาเลือกวันเวลาในอนาคต" };
    }
  }

  const duplicate = await prisma.booking.findFirst({
    where: { studentId, date: bookingDateTime, status: { not: "CANCELLED" } },
  });
  if (duplicate) {
    return { error: "มีการจองในวันเวลานี้อยู่แล้ว กรุณาเลือกเวลาอื่น" };
  }

  const booking = await prisma.booking.create({
    data: {
      type,
      studentId,
      scheduleId: type === "ACADEMY" ? scheduleId : null,
      clinicServiceId: type === "CLINIC" ? clinicServiceId : null,
      date: bookingDateTime,
      status: "PENDING_PAYMENT",
    },
  });

  redirect(`/pay/${booking.id}`);
}
