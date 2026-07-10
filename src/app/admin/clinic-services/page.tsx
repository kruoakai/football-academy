import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { deleteClinicServiceAction } from "./actions";

export const metadata: Metadata = { title: "บริการคลินิก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminClinicServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const services = await prisma.clinicService.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { price: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">บริการคลินิก</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการบริการกายภาพบำบัด/ฟื้นฟู</p>
        </div>
        <Link href="/admin/clinic-services/new" className={buttonPrimaryClass}>
          + เพิ่มบริการ
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ชื่อบริการ</th>
              <th className={thClass}>ระยะเวลา</th>
              <th className={thClass}>ราคา</th>
              <th className={thClass}>จำนวนการจอง</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td className={tdClass}>
                  <Link href={`/admin/clinic-services/${s.id}`} className="font-medium text-pitch-800 hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className={tdClass}>{s.durationMin} นาที</td>
                <td className={tdClass}>{Number(s.price).toLocaleString()} บาท</td>
                <td className={tdClass}>{s._count.bookings}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/clinic-services/${s.id}`}
                      className="text-sm font-medium text-pitch-700 hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <form action={deleteClinicServiceAction.bind(null, s.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  <span className="text-neutral-400">ยังไม่มีบริการคลินิก</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
