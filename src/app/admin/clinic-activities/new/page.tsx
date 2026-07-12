import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createClinicActivityAction } from "../actions";
import ClinicActivityForm from "../ClinicActivityForm";

export const metadata: Metadata = { title: "เพิ่มกิจกรรมคลินิก | หลังบ้านแอดมิน" };

export default function NewClinicActivityPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/clinic-activities" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้ากิจกรรมคลินิก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มกิจกรรมคลินิก</h1>
      </div>
      <div className={cardClass}>
        <ClinicActivityForm action={createClinicActivityAction} submitLabel="เพิ่มกิจกรรม" />
      </div>
    </div>
  );
}
