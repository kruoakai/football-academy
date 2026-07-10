import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import BookingForm, { type StudentOption, type ClinicServiceOption } from "./BookingForm";

export const metadata: Metadata = { title: "จองคิว | ยินผัน ฟุตบอล อคาเดมี" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;
  const session = await verifySession();

  const students = await prisma.student.findMany({
    where: { guardian: { userId: session.user.id } },
    orderBy: { createdAt: "asc" },
    include: {
      enrollments: {
        where: { status: { not: "CANCELLED" } },
        include: {
          course: true,
          batch: { include: { schedules: { include: { coach: { include: { user: true } } } } } },
        },
      },
    },
  });

  const studentOptions: StudentOption[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    schedules: s.enrollments.flatMap((e) =>
      e.batch.schedules.map((sch) => ({
        id: sch.id,
        day: sch.day,
        time: sch.time,
        venue: sch.venue,
        courseName: e.course.name,
        coachName: sch.coach.user.name,
      }))
    ),
  }));

  const clinicServices = await prisma.clinicService.findMany({ orderBy: { price: "asc" } });
  const clinicServiceOptions: ClinicServiceOption[] = clinicServices.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    price: Number(c.price),
    durationMin: c.durationMin,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">จองคิว</h1>
        <p className="mt-1 text-sm text-neutral-600">จองคิวฝึกซ้อมหรือคลินิกกายภาพสำหรับบุตรหลาน</p>
      </div>

      {studentOptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          ยังไม่มีข้อมูลนักเรียนในบัญชีนี้
        </div>
      ) : (
        <BookingForm
          students={studentOptions}
          clinicServices={clinicServiceOptions}
          defaultStudentId={studentId}
        />
      )}
    </div>
  );
}
