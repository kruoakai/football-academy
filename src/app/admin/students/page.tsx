import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, inputClass } from "@/lib/admin-ui";

export const metadata: Metadata = { title: "นักเรียน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { guardian: { include: { user: true } }, batch: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">นักเรียน</h1>
        <p className="mt-1 text-sm text-neutral-600">ดูและจัดการข้อมูลนักเรียนทั้งหมด</p>
      </div>

      <form method="get" className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="ค้นหาชื่อหรือรหัสนักเรียน"
          className={inputClass}
        />
      </form>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อ</th>
              <th className={thClass}>รหัส</th>
              <th className={thClass}>ผู้ปกครอง</th>
              <th className={thClass}>รุ่น/คอร์ส</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className={tdClass}>
                  <Link href={`/admin/students/${s.id}`} className="font-medium text-pitch-800 hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className={tdClass}>{s.code}</td>
                <td className={tdClass}>
                  {s.guardian.user.name} · {s.guardian.user.phone ?? s.guardian.user.email}
                </td>
                <td className={tdClass}>
                  {s.batch ? `${s.batch.course.name} · ${s.batch.name}` : <span className="text-neutral-400">-</span>}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={4}>
                  <span className="text-neutral-400">ไม่พบนักเรียน</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
