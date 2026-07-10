"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { ArticleFormState } from "./actions";

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
    authorName: string | null;
    published: boolean;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="title">
          ชื่อบทความ
        </label>
        <input id="title" name="title" defaultValue={defaultValues?.title} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="slug">
          Slug (สำหรับ URL เช่น /blog/how-to-warm-up)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={defaultValues?.slug}
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
      <div>
        <label className={labelClass} htmlFor="content">
          เนื้อหา (รองรับ Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={defaultValues?.content}
          rows={12}
          required
          className={`${inputClass} font-mono text-sm`}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="coverImage">
            รูปหน้าปก (URL, ไม่บังคับ)
          </label>
          <input
            id="coverImage"
            name="coverImage"
            defaultValue={defaultValues?.coverImage ?? ""}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="authorName">
            ผู้เขียน (ไม่บังคับ)
          </label>
          <input
            id="authorName"
            name="authorName"
            defaultValue={defaultValues?.authorName ?? ""}
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaultValues?.published}
          className="h-5 w-5 rounded border-neutral-300"
        />
        เผยแพร่บทความนี้
      </label>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
