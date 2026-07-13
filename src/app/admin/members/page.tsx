import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, inputClass, labelClass, buttonSecondaryClass } from "@/lib/admin-ui";
import { toggleMemberActiveAction } from "./actions";

export const metadata: Metadata = { title: "สมาชิก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  ADMIN: "แอดมิน",
  COACH: "โค้ช",
  GUARDIAN: "ผู้ปกครอง",
  STUDENT: "นักเรียน",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role } = await searchParams;
  const query = q?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as "ADMIN" | "COACH" | "GUARDIAN" | "STUDENT" } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-pitch-900">สมาชิก</h1>
        <p className="mt-1 text-sm text-neutral-600">
          รายชื่อบัญชีผู้ใช้งานทั้งหมด (ผู้ปกครอง โค้ช แอดมิน) — แก้ไขชื่อ เบอร์โทร อีเมล และรหัสผ่านได้
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className={labelClass} htmlFor="q">
            ค้นหาชื่อ เบอร์โทร หรืออีเมล
          </label>
          <input id="q" name="q" defaultValue={query ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="role">
            บทบาท
          </label>
          <select id="role" name="role" defaultValue={role ?? ""} className={inputClass}>
            <option value="">ทั้งหมด</option>
            <option value="GUARDIAN">ผู้ปกครอง</option>
            <option value="COACH">โค้ช</option>
            <option value="ADMIN">แอดมิน</option>
          </select>
        </div>
        <button type="submit" className={buttonSecondaryClass}>
          กรอง
        </button>
      </form>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อ</th>
              <th className={thClass}>บทบาท</th>
              <th className={thClass}>เบอร์โทร</th>
              <th className={thClass}>อีเมล</th>
              <th className={thClass}>สถานะ</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={tdClass}>
                  <Link href={`/admin/members/${u.id}`} className="font-medium text-pitch-800 hover:underline">
                    {u.name}
                  </Link>
                </td>
                <td className={tdClass}>{roleLabel[u.role] ?? u.role}</td>
                <td className={tdClass}>{u.phone ?? "-"}</td>
                <td className={tdClass}>{u.email ?? "-"}</td>
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
                    <Link href={`/admin/members/${u.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={toggleMemberActiveAction.bind(null, u.id)}>
                      <button type="submit" className="text-sm font-medium text-neutral-600 hover:underline">
                        {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-neutral-400">ไม่พบสมาชิก</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
