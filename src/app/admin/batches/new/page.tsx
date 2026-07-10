import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { createBatchAction } from "../actions";
import BatchForm from "../BatchForm";

export const metadata: Metadata = { title: "เพิ่มรุ่น | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function NewBatchPage() {
  const courses = await prisma.course.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/batches" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้ารุ่น/ตารางฝึก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มรุ่นใหม่</h1>
      </div>
      <div className={cardClass}>
        <BatchForm action={createBatchAction} courses={courses} submitLabel="เพิ่มรุ่น" />
      </div>
    </div>
  );
}
