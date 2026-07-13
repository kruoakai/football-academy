"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { saveResizedImage } from "@/lib/image-upload";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

const articleSchema = z.object({
  title: z.string().min(2, { error: "กรุณากรอกชื่อบทความ" }),
  slug: z
    .string()
    .min(2, { error: "กรุณากรอก slug" })
    .regex(/^[a-z0-9-]+$/, { error: "slug ใช้ได้เฉพาะตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น" }),
  excerpt: z.string().optional(),
  content: z.string().min(1, { error: "กรุณากรอกเนื้อหา" }),
});

export type ArticleFormState = { error?: string } | undefined;

// Extracted from formData before the rest of the fields go through the zod
// schema — a File object isn't a string and would fail that validation.
// Mirrors the same pattern used for clinic activities/site-settings logo.
async function extractImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("coverImageFile");
  formData.delete("coverImageFile");
  if (file instanceof File && file.size > 0) {
    const result = await saveResizedImage(file, { subfolder: "articles", maxWidth: 1600 });
    if ("error" in result) return { error: result.error };
    return { url: result.url };
  }
  return {};
}

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const session = await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: coverImage, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  // Every published article must have a cover image — this is enforced here
  // as well as by disabling the publish checkbox client-side, since the
  // client-side check alone can't be trusted.
  if (published && !coverImage) {
    return { error: "กรุณาอัปโหลดรูปปกก่อนเผยแพร่บทความ" };
  }

  try {
    await prisma.article.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        coverImage: coverImage ?? null,
        authorId: session.user.id,
        published,
        publishedAt: published ? new Date() : null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };
    throw error;
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles");
}

export async function updateArticleAction(
  articleId: string,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireRole(["ADMIN"]);

  const published = formData.get("published") === "on";
  formData.delete("published");

  const { url: newCoverImage, error: imageError } = await extractImage(formData);
  if (imageError) return { error: imageError };

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const existing = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) return { error: "ไม่พบบทความนี้" };

  const coverImage = newCoverImage ?? existing.coverImage;
  if (published && !coverImage) {
    return { error: "กรุณาอัปโหลดรูปปกก่อนเผยแพร่บทความ" };
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        published,
        publishedAt: published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        ...(newCoverImage ? { coverImage: newCoverImage } : {}),
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { error: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };
    throw error;
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath(`/articles/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/articles");
}

export async function deleteArticleAction(articleId: string) {
  await requireRole(["ADMIN"]);
  await prisma.article.delete({ where: { id: articleId } }).catch(() => null);
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles");
}

export async function toggleArticlePublishedAction(articleId: string) {
  await requireRole(["ADMIN"]);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return;

  // Only guard the false -> true transition; unpublishing is always allowed.
  if (!article.published && !article.coverImage) {
    redirect("/admin/articles?error=กรุณาอัปโหลดรูปปกก่อนเผยแพร่บทความนี้");
  }

  await prisma.article.update({
    where: { id: articleId },
    data: {
      published: !article.published,
      publishedAt: !article.published ? (article.publishedAt ?? new Date()) : article.publishedAt,
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}
