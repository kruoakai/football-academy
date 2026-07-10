"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { CourseFormState } from "./actions";

export default function CourseForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  defaultValues?: { name: string; ageGroup: string; level: string | null; description: string | null; price: number };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="name">
          ชื่อคอร์ส
        </label>
        <input id="name" name="name" defaultValue={defaultValues?.name} required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ageGroup">
            ช่วงอายุ
          </label>
          <input
            id="ageGroup"
            name="ageGroup"
            defaultValue={defaultValues?.ageGroup}
            placeholder="เช่น 6-9 ปี"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="level">
            ระดับ (ไม่บังคับ)
          </label>
          <input id="level" name="level" defaultValue={defaultValues?.level ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="description">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={3}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="price">
          ราคา (บาท)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="1"
          defaultValue={defaultValues?.price}
          required
          className={inputClass}
        />
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
