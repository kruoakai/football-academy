import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateCourseAction } from "../actions";
import CourseForm from "../CourseForm";

export const metadata: Metadata = { title: "แก้ไขคอร์ส | หลังบ้านแอดมิน" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/courses" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าคอร์ส
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขคอร์ส</h1>
      </div>
      <div className={cardClass}>
        <CourseForm
          action={updateCourseAction.bind(null, course.id)}
          defaultValues={{
            name: course.name,
            ageGroup: course.ageGroup,
            level: course.level,
            description: course.description,
            price: Number(course.price),
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
