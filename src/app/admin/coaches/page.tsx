import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { deleteCoachAction } from "./actions";

export const metadata: Metadata = { title: "โค้ช | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminCoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const coaches = await prisma.coach.findMany({
    include: { user: true, _count: { select: { schedules: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">โค้ช</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการโปรไฟล์และบัญชีโค้ช</p>
        </div>
        <Link href="/admin/coaches/new" className={buttonPrimaryClass}>
          + เพิ่มโค้ช
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อ</th>
              <th className={thClass}>ความเชี่ยวชาญ</th>
              <th className={thClass}>ติดต่อ</th>
              <th className={thClass}>ตารางฝึก</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((c) => (
              <tr key={c.id}>
                <td className={tdClass}>
                  <Link href={`/admin/coaches/${c.id}`} className="font-medium text-pitch-800 hover:underline">
                    {c.user.name}
                  </Link>
                  {!c.user.active && (
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      ปิดใช้งาน
                    </span>
                  )}
                </td>
                <td className={tdClass}>{c.specialty ?? "-"}</td>
                <td className={tdClass}>{c.user.phone ?? c.user.email ?? "-"}</td>
                <td className={tdClass}>{c._count.schedules}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/coaches/${c.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={deleteCoachAction.bind(null, c.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {coaches.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  <span className="text-neutral-400">ยังไม่มีโค้ช</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
