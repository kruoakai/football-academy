"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { ClinicActivityFormState } from "./actions";

const CATEGORY_OPTIONS = [
  { value: "ASSESSMENT", label: "ตรวจประเมิน" },
  { value: "TREATMENT", label: "รักษาในคลินิก" },
  { value: "FIELD", label: "ดูแลข้างสนาม" },
] as const;

export default function ClinicActivityForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ClinicActivityFormState, formData: FormData) => Promise<ClinicActivityFormState>;
  defaultValues?: {
    category: string;
    title: string;
    caption: string;
    imageUrl: string | null;
    published: boolean;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(defaultValues?.imageUrl ?? null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="category">
          หมวดหมู่
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category}
          required
          className={inputClass}
        >
          <option value="" disabled>
            เลือกหมวดหมู่
          </option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {state?.error && state.error.includes("หมวดหมู่") && <p className={errorClass}>{state.error}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          ชื่อกิจกรรม
        </label>
        <input id="title" name="title" defaultValue={defaultValues?.title} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="caption">
          คำอธิบาย
        </label>
        <textarea
          id="caption"
          name="caption"
          defaultValue={defaultValues?.caption}
          rows={3}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>รูปภาพ</label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-pitch-50">
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

      <label className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaultValues?.published ?? true}
          className="h-5 w-5 rounded border-neutral-300"
        />
        แสดงผลบนหน้าเว็บไซต์
      </label>

      {state?.error && !state.error.includes("หมวดหมู่") && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
