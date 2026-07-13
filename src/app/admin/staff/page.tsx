import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { toggleActiveAction } from "./actions";

export const metadata: Metadata = { title: "ทีมงาน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = { ADMIN: "แอดมิน", COACH: "โค้ช" };

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "COACH"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">ทีมงาน</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการบัญชีแอดมินและโค้ช</p>
        </div>
        <Link href="/admin/staff/new" className={buttonPrimaryClass}>
          + เพิ่มแอดมิน
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อ</th>
              <th className={thClass}>บทบาท</th>
              <th className={thClass}>ติดต่อ</th>
              <th className={thClass}>สถานะ</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id}>
                <td className={tdClass}>{u.name}</td>
                <td className={tdClass}>{roleLabel[u.role] ?? u.role}</td>
                <td className={tdClass}>{u.phone ?? u.email ?? "-"}</td>
                <td className={tdClass}>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.active ? "bg-pitch-50 text-pitch-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {u.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/staff/${u.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={toggleActiveAction.bind(null, u.id)}>
                      <button type="submit" className="text-sm font-medium text-neutral-600 hover:underline">
                        {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
