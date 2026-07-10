import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { formatThaiDate } from "@/lib/thai";
import { deleteBatchAction } from "./actions";

export const metadata: Metadata = { title: "รุ่น/ตารางฝึก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const batches = await prisma.batch.findMany({
    include: { course: true, _count: { select: { students: true, schedules: true } } },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">รุ่น/ตารางฝึก</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการรุ่นเรียนและตารางฝึกซ้อม</p>
        </div>
        <Link href="/admin/batches/new" className={buttonPrimaryClass}>
          + เพิ่มรุ่น
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>รุ่น</th>
              <th className={thClass}>คอร์ส</th>
              <th className={thClass}>ช่วงเวลา</th>
              <th className={thClass}>นักเรียน</th>
              <th className={thClass}>ตารางฝึก</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className={tdClass}>
                  <Link href={`/admin/batches/${b.id}`} className="font-medium text-pitch-800 hover:underline">
                    {b.name}
                  </Link>
                </td>
                <td className={tdClass}>{b.course.name}</td>
                <td className={tdClass}>
                  {formatThaiDate(b.startDate)} – {formatThaiDate(b.endDate)}
                </td>
                <td className={tdClass}>{b._count.students}</td>
                <td className={tdClass}>{b._count.schedules}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/batches/${b.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={deleteBatchAction.bind(null, b.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-neutral-400">ยังไม่มีรุ่น</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
