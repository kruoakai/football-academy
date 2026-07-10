import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updatePromotionAction } from "../actions";
import PromotionForm from "../PromotionForm";

export const metadata: Metadata = { title: "แก้ไขโปรโมชั่น | หลังบ้านแอดมิน" };

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/promotions" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าโปรโมชั่น
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขโปรโมชั่น: {promotion.code}</h1>
      </div>
      <div className={cardClass}>
        <PromotionForm
          action={updatePromotionAction.bind(null, promotion.id)}
          defaultValues={{
            code: promotion.code,
            type: promotion.type,
            value: promotion.value ? Number(promotion.value) : null,
            discountUnit: promotion.discountUnit,
            giftItem: promotion.giftItem,
            giftStock: promotion.giftStock,
            targetGroup: promotion.targetGroup,
            validFrom: promotion.validFrom.toISOString().slice(0, 10),
            validTo: promotion.validTo.toISOString().slice(0, 10),
            maxUses: promotion.maxUses,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
