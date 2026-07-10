import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { formatThaiDate } from "@/lib/thai";
import { togglePromotionActiveAction, deletePromotionAction } from "./actions";

export const metadata: Metadata = { title: "โปรโมชั่น | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">โปรโมชั่น/คูปอง</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการรหัสส่วนลดและของแถม</p>
        </div>
        <Link href="/admin/promotions/new" className={buttonPrimaryClass}>
          + เพิ่มโปรโมชั่น
        </Link>
      </div>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>รหัส</th>
              <th className={thClass}>ประเภท</th>
              <th className={thClass}>มูลค่า</th>
              <th className={thClass}>ใช้ได้ถึง</th>
              <th className={thClass}>ใช้ไปแล้ว</th>
              <th className={thClass}>สถานะ</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id}>
                <td className={tdClass}>
                  <Link href={`/admin/promotions/${p.id}`} className="font-mono font-medium text-pitch-800 hover:underline">
                    {p.code}
                  </Link>
                </td>
                <td className={tdClass}>{p.type === "DISCOUNT" ? "ส่วนลด" : "ของแถม"}</td>
                <td className={tdClass}>
                  {p.type === "DISCOUNT"
                    ? `${Number(p.value)}${p.discountUnit === "PERCENT" ? "%" : " บาท"}`
                    : `${p.giftItem} (เหลือ ${p.giftStock})`}
                </td>
                <td className={tdClass}>{formatThaiDate(p.validTo)}</td>
                <td className={tdClass}>
                  {p.usedCount}
                  {p.maxUses ? ` / ${p.maxUses}` : ""}
                </td>
                <td className={tdClass}>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.active ? "bg-pitch-50 text-pitch-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {p.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/promotions/${p.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={togglePromotionActiveAction.bind(null, p.id)}>
                      <button type="submit" className="text-sm font-medium text-neutral-600 hover:underline">
                        {p.active ? "ปิด" : "เปิด"}
                      </button>
                    </form>
                    <form action={deletePromotionAction.bind(null, p.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={7}>
                  <span className="text-neutral-400">ยังไม่มีโปรโมชั่น</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
