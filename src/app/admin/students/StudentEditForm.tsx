"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { StudentFormState } from "./actions";

export default function StudentEditForm({
  action,
  batches,
  defaultValues,
}: {
  action: (prevState: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  batches: { id: string; label: string }[];
  defaultValues: { name: string; dob: string; level: string | null; batchId: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="name">
          ชื่อ-นามสกุลนักเรียน
        </label>
        <input id="name" name="name" defaultValue={defaultValues.name} required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="dob">
            วันเกิด
          </label>
          <input id="dob" name="dob" type="date" defaultValue={defaultValues.dob} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="level">
            ระดับพื้นฐาน (ไม่บังคับ)
          </label>
          <input id="level" name="level" defaultValue={defaultValues.level ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="batchId">
          รุ่นที่สังกัด
        </label>
        <select id="batchId" name="batchId" defaultValue={defaultValues.batchId ?? ""} className={inputClass}>
          <option value="">ไม่ระบุ</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="mt-1 text-sm text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}
