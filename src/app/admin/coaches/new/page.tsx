import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import CreateCoachForm from "../CreateCoachForm";

export const metadata: Metadata = { title: "เพิ่มโค้ช | หลังบ้านแอดมิน" };

export default function NewCoachPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/coaches" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าโค้ช
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มโค้ชใหม่</h1>
      </div>
      <div className={cardClass}>
        <CreateCoachForm />
      </div>
    </div>
  );
}
