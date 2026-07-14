import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // This route is prerendered at build time — if there's no DB connection yet
  // (e.g. a Docker build stage) or a genuine runtime outage, fall back to the
  // static routes only rather than failing the whole build/request.
  let articles: { slug: string; updatedAt: Date }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (err) {
    console.warn("sitemap: DB query failed, omitting article routes.", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "yearly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/courses`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/clinic`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes];
}
