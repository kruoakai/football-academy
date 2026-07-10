import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateClinicServiceAction } from "../actions";
import ClinicServiceForm from "../ClinicServiceForm";

export const metadata: Metadata = { title: "แก้ไขบริการคลินิก | หลังบ้านแอดมิน" };

export default async function EditClinicServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.clinicService.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/clinic-services" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าบริการคลินิก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขบริการคลินิก</h1>
      </div>
      <div className={cardClass}>
        <ClinicServiceForm
          action={updateClinicServiceAction.bind(null, service.id)}
          defaultValues={{
            name: service.name,
            description: service.description,
            price: Number(service.price),
            durationMin: service.durationMin,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
