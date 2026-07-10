"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonSecondaryClass } from "@/lib/admin-ui";
import { THAI_DAY_NAMES } from "@/lib/thai";
import type { ScheduleFormState } from "./actions";

export default function ScheduleForm({
  action,
  coaches,
}: {
  action: (prevState: ScheduleFormState, formData: FormData) => Promise<ScheduleFormState>;
  coaches: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-dashed border-neutral-300 p-4">
      <p className="text-sm font-medium text-neutral-700">เพิ่มตารางฝึกซ้อม</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="day">
            วัน
          </label>
          <select id="day" name="day" defaultValue="" required className={inputClass}>
            <option value="" disabled>
              เลือกวัน
            </option>
            {THAI_DAY_NAMES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="time">
            เวลา
          </label>
          <input id="time" name="time" placeholder="09:00-10:30" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="venue">
            สถานที่
          </label>
          <input id="venue" name="venue" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="coachId">
            โค้ช
          </label>
          <select id="coachId" name="coachId" defaultValue="" required className={inputClass}>
            <option value="" disabled>
              เลือกโค้ช
            </option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonSecondaryClass}>
        {pending ? "กำลังเพิ่ม..." : "+ เพิ่มตารางฝึก"}
      </button>
    </form>
  );
}
