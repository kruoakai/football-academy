import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateClinicActivityAction } from "../actions";
import ClinicActivityForm from "../ClinicActivityForm";

export const metadata: Metadata = { title: "แก้ไขกิจกรรมคลินิก | หลังบ้านแอดมิน" };

export default async function EditClinicActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await prisma.clinicActivity.findUnique({ where: { id } });
  if (!activity) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/clinic-activities" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้ากิจกรรมคลินิก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขกิจกรรมคลินิก</h1>
      </div>
      <div className={cardClass}>
        <ClinicActivityForm
          action={updateClinicActivityAction.bind(null, activity.id)}
          defaultValues={{
            category: activity.category,
            title: activity.title,
            caption: activity.caption,
            imageUrl: activity.imageUrl,
            published: activity.published,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
