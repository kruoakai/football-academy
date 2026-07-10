"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { ClinicServiceFormState } from "./actions";

export default function ClinicServiceForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ClinicServiceFormState, formData: FormData) => Promise<ClinicServiceFormState>;
  defaultValues?: { name: string; description: string | null; price: number; durationMin: number };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="name">
          ชื่อบริการ
        </label>
        <input id="name" name="name" defaultValue={defaultValues?.name} required className={inputClass} />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <label className={labelClass} htmlFor="durationMin">
            ระยะเวลา (นาที)
          </label>
          <input
            id="durationMin"
            name="durationMin"
            type="number"
            min="5"
            step="5"
            defaultValue={defaultValues?.durationMin}
            required
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
