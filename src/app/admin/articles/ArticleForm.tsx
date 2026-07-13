"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import MarkdownEditor from "./MarkdownEditor";
import type { ArticleFormState } from "./actions";

// Slugs must stay ASCII (server-side regex enforces /^[a-z0-9-]+$/, matching
// every other slug in this app) — Thai titles are the norm here, so Thai
// characters are stripped rather than kept, leaving the slug empty until the
// admin fills in an English one, instead of auto-filling something that
// would silently fail validation on submit.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArticleForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  defaultValues?: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    published: boolean;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(defaultValues?.coverImage ?? null);
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!defaultValues?.slug);
  const hasImage = !!preview;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="title">
          ชื่อบทความ
        </label>
        <input
          id="title"
          name="title"
          defaultValue={defaultValues?.title}
          required
          className={inputClass}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="slug">
          Slug (สำหรับ URL เช่น /articles/how-to-warm-up) — ตั้งอัตโนมัติจากชื่อ แก้เองได้
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          placeholder="how-to-warm-up"
          required
          className={`${inputClass} font-mono`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="excerpt">
          บทนำสั้นๆ (ไม่บังคับ)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={defaultValues?.excerpt ?? ""}
          rows={2}
          className={inputClass}
        />
      </div>

      <MarkdownEditor defaultValue={defaultValues?.content} />

      <div>
        <label className={labelClass}>
          รูปปก <span className="text-red-600">(บังคับก่อนเผยแพร่)</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-pitch-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- live client-side preview (blob/existing URL), next/image can't optimize those
              <img src={preview} alt="ตัวอย่างรูปปก" className="h-full w-full object-cover" />
            ) : (
              <span className="text-center text-[10px] text-neutral-400">ไม่มีรูป</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              name="coverImageFile"
              accept="image/png,image/jpeg,image/webp"
              className={inputClass}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            <p className="mt-1 text-xs text-neutral-500">
              PNG, JPEG หรือ WEBP ไม่เกิน 8MB — ระบบจะย่อขนาดให้เหมาะกับเว็บอัตโนมัติ
              {defaultValues && " (เว้นว่างไว้เพื่อใช้รูปเดิม)"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label
          className={`flex min-h-[44px] items-center gap-2 text-sm font-medium ${
            hasImage ? "text-neutral-700" : "cursor-not-allowed text-neutral-400"
          }`}
        >
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaultValues?.published && hasImage}
            disabled={!hasImage}
            className="h-5 w-5 rounded border-neutral-300 disabled:cursor-not-allowed"
          />
          เผยแพร่บทความนี้
        </label>
        {!hasImage && (
          <p className="mt-1 text-xs text-gold-700">กรุณาอัปโหลดรูปปกก่อน จึงจะเผยแพร่บทความได้</p>
        )}
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
