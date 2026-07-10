import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { deleteCourseAction } from "./actions";

export const metadata: Metadata = { title: "คอร์ส | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const courses = await prisma.course.findMany({
    include: { _count: { select: { batches: true, enrollments: true } } },
    orderBy: { price: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">คอร์ส</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการคอร์สเรียนทั้งหมด</p>
        </div>
        <Link href="/admin/courses/new" className={buttonPrimaryClass}>
          + เพิ่มคอร์ส
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อคอร์ส</th>
              <th className={thClass}>ช่วงอายุ</th>
              <th className={thClass}>ราคา</th>
              <th className={thClass}>รุ่น</th>
              <th className={thClass}>ผู้ลงทะเบียน</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td className={tdClass}>
                  <Link href={`/admin/courses/${c.id}`} className="font-medium text-pitch-800 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className={tdClass}>{c.ageGroup}</td>
                <td className={tdClass}>{Number(c.price).toLocaleString()} บาท</td>
                <td className={tdClass}>{c._count.batches}</td>
                <td className={tdClass}>{c._count.enrollments}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/courses/${c.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={deleteCourseAction.bind(null, c.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-neutral-400">ยังไม่มีคอร์ส</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
