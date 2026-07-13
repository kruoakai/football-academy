import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getActivePromotions } from "@/lib/promotions";
import RegistrationWizard, { type CourseOption } from "./RegistrationWizard";
import PromotionsBanner from "./PromotionsBanner";

export const metadata: Metadata = {
  title: "สมัครเรียน | ยินผัน ฟุตบอล อคาเดมี",
  description: "สมัครเรียนฟุตบอลกับยินผัน ฟุตบอล อคาเดมี เลือกคอร์สและรุ่นที่เหมาะกับบุตรหลานของคุณ",
};

// Course/batch availability must always be current — never freeze this at build time.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const promotions = await getActivePromotions();
  const courses = await prisma.course.findMany({
    include: {
      batches: {
        include: {
          schedules: {
            include: { coach: { include: { user: true } } },
          },
        },
      },
    },
    orderBy: { price: "asc" },
  });

  const courseOptions: CourseOption[] = courses.map((c) => ({
    id: c.id,
    name: c.name,
    ageGroup: c.ageGroup,
    level: c.level,
    price: Number(c.price),
    batches: c.batches.map((b) => ({
      id: b.id,
      name: b.name,
      sessionTime: b.sessionTime,
      schedules: b.schedules.map((s) => ({
        day: s.day,
        time: s.time,
        venue: s.venue,
        coachName: s.coach.user.name,
      })),
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-pitch-50 px-4 py-1 text-sm font-medium text-pitch-700">
          สมัครเรียน
        </span>
        <h1 className="mt-3 font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
          สมัครเรียนกับยินผัน ฟุตบอล อคาเดมี
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          กรอกข้อมูล 4 ขั้นตอนง่ายๆ เพื่อเริ่มต้นเส้นทางนักฟุตบอลของบุตรหลาน
        </p>
      </div>

      <PromotionsBanner promotions={promotions} />

      <RegistrationWizard courses={courseOptions} />
    </div>
  );
}
