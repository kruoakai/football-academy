import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/thai";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  return prisma.article.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return {
    title: `${article.title} | ยินผัน ฟุตบอล อคาเดมี`,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const html = await renderMarkdown(article.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="text-sm font-medium text-pitch-700 hover:text-pitch-900">
        ← กลับไปหน้าบทความ
      </Link>

      <p className="mt-4 text-sm text-neutral-400">
        {article.publishedAt ? formatThaiDate(article.publishedAt) : formatThaiDate(article.createdAt)}
        {article.authorName ? ` · โดย ${article.authorName}` : ""}
      </p>
      <h1 className="mt-2 font-heading text-2xl font-bold leading-tight text-pitch-900 sm:text-3xl">
        {article.title}
      </h1>

      {article.coverImage && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image src={article.coverImage} alt={article.title} fill unoptimized className="object-cover" />
        </div>
      )}

      <div
        className="prose prose-neutral mt-8 max-w-none prose-headings:font-heading prose-headings:text-pitch-900 prose-a:text-pitch-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
