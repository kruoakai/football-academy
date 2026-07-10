import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateArticleAction } from "../actions";
import ArticleForm from "../ArticleForm";

export const metadata: Metadata = { title: "แก้ไขบทความ | หลังบ้านแอดมิน" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/articles" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าบทความ
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขบทความ</h1>
      </div>
      <div className={cardClass}>
        <ArticleForm
          action={updateArticleAction.bind(null, article.id)}
          defaultValues={{
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            coverImage: article.coverImage,
            authorName: article.authorName,
            published: article.published,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
