import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createClinicServiceAction } from "../actions";
import ClinicServiceForm from "../ClinicServiceForm";

export const metadata: Metadata = { title: "เพิ่มบริการคลินิก | หลังบ้านแอดมิน" };

export default function NewClinicServicePage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/clinic-services" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าบริการคลินิก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มบริการคลินิก</h1>
      </div>
      <div className={cardClass}>
        <ClinicServiceForm action={createClinicServiceAction} submitLabel="เพิ่มบริการ" />
      </div>
    </div>
  );
}
