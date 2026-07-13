import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateMemberAccountAction } from "../actions";
import MemberAccountForm from "../MemberAccountForm";

export const metadata: Metadata = { title: "แก้ไขสมาชิก | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  ADMIN: "แอดมิน",
  COACH: "โค้ช",
  GUARDIAN: "ผู้ปกครอง",
  STUDENT: "นักเรียน",
};

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { guardian: { include: { students: true } } },
  });
  if (!user) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/members" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าสมาชิก
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขบัญชี: {user.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">บทบาท: {roleLabel[user.role] ?? user.role}</p>
        {user.leadSource && <p className="mt-1 text-sm text-neutral-500">รู้จักเราจาก: {user.leadSource}</p>}
      </div>
      <div className={cardClass}>
        <MemberAccountForm
          action={updateMemberAccountAction.bind(null, user.id)}
          defaultValues={{ name: user.name, phone: user.phone, email: user.email }}
        />
      </div>

      {user.guardian && user.guardian.students.length > 0 && (
        <div className={cardClass}>
          <h2 className="mb-3 font-heading text-lg font-semibold text-pitch-900">บุตรหลาน</h2>
          <div className="flex flex-col gap-2">
            {user.guardian.students.map((s) => (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="rounded-lg border border-neutral-200 p-3 text-sm text-pitch-800 hover:bg-pitch-50"
              >
                {s.name} · รหัส {s.code}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
