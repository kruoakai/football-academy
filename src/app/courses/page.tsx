import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/thai";

export const metadata: Metadata = {
  title: "คอร์สเรียน | ยินผัน ฟุตบอล อคาเดมี",
  description: "คอร์สเรียนฟุตบอลตามช่วงวัย สอนโดยอดีตนักเตะทีมชาติไทย พร้อมตารางฝึกซ้อมและรุ่นที่เปิดรับสมัคร",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { price: "asc" },
    include: {
      batches: {
        orderBy: { startDate: "asc" },
        include: {
          schedules: { include: { coach: { include: { user: true } } } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
            คอร์สเรียน
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
            คอร์สเรียนฟุตบอลตามช่วงวัย
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80">
            ออกแบบหลักสูตรให้เหมาะกับพัฒนาการของนักเรียนแต่ละช่วงวัย สอนโดยอดีตนักเตะทีมชาติไทย
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            ยังไม่มีคอร์สเรียนเปิดรับสมัครในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-gold-400 hover:shadow-md sm:p-8"
              >
                <span className="inline-block w-fit rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pitch-700">
                  ช่วงอายุ {course.ageGroup}
                  {course.level ? ` · ระดับ${course.level}` : ""}
                </span>
                <h2 className="mt-4 font-heading text-xl font-bold text-pitch-900">{course.name}</h2>
                {course.description && (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{course.description}</p>
                )}
                <p className="mt-4 text-lg font-bold text-gold-600">
                  {Number(course.price).toLocaleString()} บาท
                </p>

                {course.batches.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      รุ่นที่เปิดรับสมัคร
                    </p>
                    {course.batches.map((batch) => {
                      const schedule = batch.schedules[0];
                      return (
                        <div key={batch.id} className="rounded-lg bg-pitch-50 px-3 py-2 text-sm text-pitch-800">
                          <p className="font-medium">{batch.name}</p>
                          <p className="text-xs text-neutral-500">
                            {formatThaiDate(batch.startDate)} – {formatThaiDate(batch.endDate)}
                          </p>
                          {schedule && (
                            <p className="mt-1 text-xs text-neutral-600">
                              ทุกวัน{schedule.day} {schedule.time} น. · {schedule.venue}
                              {schedule.coach.user.name ? ` · โค้ช${schedule.coach.user.name}` : ""}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <Link
                  href="/register"
                  className="mt-6 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
                >
                  สมัครเรียนคอร์สนี้
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
