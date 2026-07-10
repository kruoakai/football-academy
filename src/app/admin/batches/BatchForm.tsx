"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { BatchFormState } from "./actions";

export default function BatchForm({
  action,
  courses,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: BatchFormState, formData: FormData) => Promise<BatchFormState>;
  courses: { id: string; name: string }[];
  defaultValues?: { courseId: string; name: string; startDate: string; endDate: string; sessionTime: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="courseId">
          คอร์ส
        </label>
        <select id="courseId" name="courseId" defaultValue={defaultValues?.courseId} required className={inputClass}>
          <option value="" disabled>
            เลือกคอร์ส
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="name">
          ชื่อรุ่น
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="เช่น รุ่น 1/2569"
          required
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="startDate">
            วันเริ่ม
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaultValues?.startDate}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endDate">
            วันสิ้นสุด
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={defaultValues?.endDate}
            required
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="sessionTime">
          เวลาเรียน (ข้อความอธิบาย)
        </label>
        <input
          id="sessionTime"
          name="sessionTime"
          defaultValue={defaultValues?.sessionTime}
          placeholder="เช่น 09:00-10:30"
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
