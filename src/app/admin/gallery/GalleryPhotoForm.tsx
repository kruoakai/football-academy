"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { GalleryPhotoFormState } from "./actions";

export default function GalleryPhotoForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: GalleryPhotoFormState, formData: FormData) => Promise<GalleryPhotoFormState>;
  defaultValues?: {
    caption: string | null;
    imageUrl: string;
    published: boolean;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(defaultValues?.imageUrl ?? null);
  const hasImage = !!preview;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>รูปภาพ</label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-pitch-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- live client-side preview (blob/existing URL), next/image can't optimize those
              <img src={preview} alt="ตัวอย่างรูปภาพ" className="h-full w-full object-cover" />
            ) : (
              <span className="text-center text-[10px] text-neutral-400">ไม่มีรูป</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              name="imageFile"
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
        <label className={labelClass} htmlFor="caption">
          คำบรรยายภาพ (ไม่บังคับ)
        </label>
        <input
          id="caption"
          name="caption"
          defaultValue={defaultValues?.caption ?? ""}
          placeholder="เช่น บรรยากาศการฝึกซ้อม"
          className={inputClass}
        />
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
            defaultChecked={(defaultValues?.published ?? true) && hasImage}
            disabled={!hasImage}
            className="h-5 w-5 rounded border-neutral-300 disabled:cursor-not-allowed"
          />
          แสดงผลบนหน้าแกลเลอรี่
        </label>
        {!hasImage && <p className="mt-1 text-xs text-gold-700">กรุณาอัปโหลดรูปภาพก่อน จึงจะแสดงผลได้</p>}
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
