"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { CoachFormState } from "./actions";

export default function EditCoachForm({
  action,
  defaultValues,
}: {
  action: (prevState: CoachFormState, formData: FormData) => Promise<CoachFormState>;
  defaultValues: { specialty: string | null; bio: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="specialty">
          ความเชี่ยวชาญ (ไม่บังคับ)
        </label>
        <input id="specialty" name="specialty" defaultValue={defaultValues.specialty ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="bio">
          ประวัติโดยย่อ (ไม่บังคับ)
        </label>
        <textarea id="bio" name="bio" defaultValue={defaultValues.bio ?? ""} rows={4} className={inputClass} />
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}
