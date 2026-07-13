import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tableWrapClass, tableClass, thClass, tdClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { formatThaiDate } from "@/lib/thai";
import { deleteArticleAction, toggleArticlePublishedAction } from "./actions";

export const metadata: Metadata = { title: "บทความ | หลังบ้านแอดมิน" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-pitch-900">บทความ</h1>
          <p className="mt-1 text-sm text-neutral-600">จัดการบทความสำหรับหน้าเว็บสาธารณะ</p>
        </div>
        <Link href="/admin/articles/new" className={buttonPrimaryClass}>
          + เพิ่มบทความ
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}></th>
              <th className={thClass}>ชื่อบทความ</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}>สถานะ</th>
              <th className={thClass}>วันที่สร้าง</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td className={tdClass}>
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-pitch-50">
                    {a.coverImage && <Image src={a.coverImage} alt="" fill unoptimized className="object-cover" />}
                  </div>
                </td>
                <td className={tdClass}>
                  <Link href={`/admin/articles/${a.id}`} className="font-medium text-pitch-800 hover:underline">
                    {a.title}
                  </Link>
                </td>
                <td className={tdClass}>
                  <span className="font-mono text-xs text-neutral-500">{a.slug}</span>
                </td>
                <td className={tdClass}>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.published ? "bg-pitch-50 text-pitch-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {a.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                  </span>
                  {!a.coverImage && (
                    <span className="ml-1 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
                      ไม่มีรูปปก
                    </span>
                  )}
                </td>
                <td className={tdClass}>{formatThaiDate(a.createdAt)}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/articles/${a.id}`} className="text-sm font-medium text-pitch-700 hover:underline">
                      แก้ไข
                    </Link>
                    <form action={toggleArticlePublishedAction.bind(null, a.id)}>
                      <button
                        type="submit"
                        disabled={!a.published && !a.coverImage}
                        title={!a.published && !a.coverImage ? "กรุณาอัปโหลดรูปปกก่อนเผยแพร่" : undefined}
                        className="text-sm font-medium text-neutral-600 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline"
                      >
                        {a.published ? "ยกเลิกเผยแพร่" : "เผยแพร่"}
                      </button>
                    </form>
                    <form action={deleteArticleAction.bind(null, a.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-neutral-400">ยังไม่มีบทความ</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
