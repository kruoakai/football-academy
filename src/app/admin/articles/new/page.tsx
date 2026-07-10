import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createArticleAction } from "../actions";
import ArticleForm from "../ArticleForm";

export const metadata: Metadata = { title: "เพิ่มบทความ | หลังบ้านแอดมิน" };

export default function NewArticlePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/articles" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าบทความ
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มบทความใหม่</h1>
      </div>
      <div className={cardClass}>
        <ArticleForm action={createArticleAction} submitLabel="เพิ่มบทความ" />
      </div>
    </div>
  );
}
