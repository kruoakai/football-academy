import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/thai";

export const metadata: Metadata = {
  title: "บทความ | ยินผัน ฟุตบอล อคาเดมี",
  description: "บทความและเคล็ดลับเกี่ยวกับฟุตบอล การฝึกซ้อม และการดูแลร่างกาย จากยินผัน ฟุตบอล อคาเดมี",
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <span className="inline-block rounded-full bg-pitch-50 px-4 py-1 text-sm font-medium text-pitch-700">
          บทความ
        </span>
        <h1 className="mt-3 font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
          เคล็ดลับและเรื่องราวจากยินผัน ฟุตบอล อคาเดมี
        </h1>
      </div>

      {articles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีบทความในขณะนี้
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-pitch-300 hover:shadow-md"
            >
              {a.coverImage ? (
                <div className="relative aspect-[16/9] w-full">
                  <Image src={a.coverImage} alt={a.title} fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-pitch-700 to-pitch-950">
                  <span className="font-heading text-3xl font-bold text-gold-400">YP</span>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xs text-neutral-400">
                  {a.publishedAt ? formatThaiDate(a.publishedAt) : formatThaiDate(a.createdAt)}
                </p>
                <h2 className="font-heading text-lg font-semibold text-pitch-900">{a.title}</h2>
                {a.excerpt && <p className="line-clamp-3 text-sm text-neutral-600">{a.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
