"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prisma-errors";

const articleSchema = z.object({
  title: z.string().min(2, { error: "กรุณากรอกชื่อบทความ" }),
  slug: z
    .string()
    .min(2, { error: "กรุณากรอก slug" })
    .regex(/^[a-z0-9-]+$/, { error: "slug ใช้ได้เฉพาะตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น" }),
  excerpt: z.string().optional(),
  content: z.string().min(1, { error: "กรุณากรอกเนื้อหา" }),
  coverImage: z.union([z.literal(""), z.url({ error: "URL รูปภาพไม่ถูกต้อง" })]).optional(),
  authorName: z.string().optional(),
  published: z.string().optional(),
});

export type ArticleFormState = { error?: string } | undefined;

function buildData(parsed: z.infer<typeof articleSchema>, existingPublishedAt: Date | null) {
  const published = parsed.published === "on";
  return {
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt || null,
    content: parsed.content,
    coverImage: parsed.coverImage || null,
    authorName: parsed.authorName || null,
    published,
    publishedAt: published ? (existingPublishedAt ?? new Date()) : existingPublishedAt,
  };
}

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireRole(["ADMIN"]);
  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.article.create({ data: buildData(parsed.data, null) });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };
    throw error;
  }

  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  redirect("/admin/articles");
}

export async function updateArticleAction(
  articleId: string,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireRole(["ADMIN"]);
  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const existing = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) return { error: "ไม่พบบทความนี้" };

  try {
    await prisma.article.update({ where: { id: articleId }, data: buildData(parsed.data, existing.publishedAt) });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };
    throw error;
  }

  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  redirect("/admin/articles");
}

export async function deleteArticleAction(articleId: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.article.delete({ where: { id: articleId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect("/admin/articles?error=ลบไม่ได้ กรุณาลองใหม่");
    }
    throw error;
  }
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  redirect("/admin/articles");
}
