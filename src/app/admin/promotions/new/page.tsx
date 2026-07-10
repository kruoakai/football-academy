import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createPromotionAction } from "../actions";
import PromotionForm from "../PromotionForm";

export const metadata: Metadata = { title: "เพิ่มโปรโมชั่น | หลังบ้านแอดมิน" };

export default function NewPromotionPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/promotions" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าโปรโมชั่น
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มโปรโมชั่นใหม่</h1>
      </div>
      <div className={cardClass}>
        <PromotionForm action={createPromotionAction} submitLabel="เพิ่มโปรโมชั่น" />
      </div>
    </div>
  );
}
