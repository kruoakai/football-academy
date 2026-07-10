import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateCoachAction } from "../actions";
import EditCoachForm from "../EditCoachForm";

export const metadata: Metadata = { title: "แก้ไขโค้ช | หลังบ้านแอดมิน" };

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coach = await prisma.coach.findUnique({ where: { id }, include: { user: true } });
  if (!coach) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/coaches" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าโค้ช
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขโค้ช: {coach.user.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{coach.user.phone ?? coach.user.email}</p>
      </div>
      <div className={cardClass}>
        <EditCoachForm
          action={updateCoachAction.bind(null, coach.id)}
          defaultValues={{ specialty: coach.specialty, bio: coach.bio }}
        />
      </div>
    </div>
  );
}
