import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createCourseAction } from "../actions";
import CourseForm from "../CourseForm";

export const metadata: Metadata = { title: "เพิ่มคอร์ส | หลังบ้านแอดมิน" };

export default function NewCoursePage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/courses" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าคอร์ส
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มคอร์สใหม่</h1>
      </div>
      <div className={cardClass}>
        <CourseForm action={createCourseAction} submitLabel="เพิ่มคอร์ส" />
      </div>
    </div>
  );
}
