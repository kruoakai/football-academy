import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateBatchAction, addScheduleAction, deleteScheduleAction } from "../actions";
import BatchForm from "../BatchForm";
import ScheduleForm from "../ScheduleForm";

export const metadata: Metadata = { title: "แก้ไขรุ่น | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function EditBatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [batch, courses, coaches] = await Promise.all([
    prisma.batch.findUnique({
      where: { id },
      include: { schedules: { include: { coach: { include: { user: true } } } } },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.coach.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);
  if (!batch) notFound();

  const coachOptions = coaches.map((c) => ({ id: c.id, name: c.user.name }));

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/batches" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้ารุ่น/ตารางฝึก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขรุ่น: {batch.name}</h1>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={cardClass}>
        <BatchForm
          action={updateBatchAction.bind(null, batch.id)}
          courses={courses}
          defaultValues={{
            courseId: batch.courseId,
            name: batch.name,
            startDate: batch.startDate.toISOString().slice(0, 10),
            endDate: batch.endDate.toISOString().slice(0, 10),
            sessionTime: batch.sessionTime,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>

      <div className={cardClass}>
        <h2 className="font-heading text-lg font-semibold text-pitch-900">ตารางฝึกซ้อม</h2>
        <div className="mt-4 flex flex-col gap-2">
          {batch.schedules.length === 0 && <p className="text-sm text-neutral-400">ยังไม่มีตารางฝึกในรุ่นนี้</p>}
          {batch.schedules.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 text-sm"
            >
              <span>
                วัน{s.day} {s.time} น. · {s.venue} · โค้ช{s.coach.user.name}
              </span>
              <form action={deleteScheduleAction.bind(null, batch.id, s.id)}>
                <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                  ลบ
                </button>
              </form>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ScheduleForm action={addScheduleAction.bind(null, batch.id, batch.courseId)} coaches={coachOptions} />
        </div>
      </div>
    </div>
  );
}
