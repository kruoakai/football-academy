"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonSecondaryClass } from "@/lib/admin-ui";
import type { InjuryRecordFormState } from "./actions";

export default function InjuryRecordForm({
  action,
  clinicServices,
}: {
  action: (prevState: InjuryRecordFormState, formData: FormData) => Promise<InjuryRecordFormState>;
  clinicServices: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-dashed border-neutral-300 p-4">
      <p className="text-sm font-medium text-neutral-700">เพิ่มบันทึกการรักษา/บาดเจ็บ</p>
      <div>
        <label className={labelClass} htmlFor="diagnosis">
          การวินิจฉัย/อาการ
        </label>
        <input id="diagnosis" name="diagnosis" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="treatmentNotes">
          บันทึกการรักษา (ไม่บังคับ)
        </label>
        <textarea id="treatmentNotes" name="treatmentNotes" rows={3} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="clinicServiceId">
            บริการที่เกี่ยวข้อง (ไม่บังคับ)
          </label>
          <select id="clinicServiceId" name="clinicServiceId" defaultValue="" className={inputClass}>
            <option value="">ไม่ระบุ</option>
            {clinicServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="date">
            วันที่
          </label>
          <input id="date" name="date" type="date" defaultValue={today} required className={inputClass} />
        </div>
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonSecondaryClass}>
        {pending ? "กำลังบันทึก..." : "+ เพิ่มบันทึก"}
      </button>
    </form>
  );
}
