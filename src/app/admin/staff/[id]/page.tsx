import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateStaffAction } from "../actions";
import StaffEditForm from "../StaffEditForm";

export const metadata: Metadata = { title: "แก้ไขบัญชีทีมงาน | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = { ADMIN: "แอดมิน", COACH: "โค้ช" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/staff" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าทีมงาน
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขบัญชี: {user.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">บทบาท: {roleLabel[user.role] ?? user.role}</p>
      </div>
      <div className={cardClass}>
        <StaffEditForm
          action={updateStaffAction.bind(null, user.id)}
          defaultValues={{ name: user.name, phone: user.phone, email: user.email }}
        />
      </div>
    </div>
  );
}
