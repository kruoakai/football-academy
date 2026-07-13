"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import PasswordInput from "@/components/PasswordInput";
import type { GuardianAccountFormState } from "./actions";

export default function GuardianAccountForm({
  action,
  defaultValues,
}: {
  action: (prevState: GuardianAccountFormState, formData: FormData) => Promise<GuardianAccountFormState>;
  defaultValues: { name: string; phone: string | null; email: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="guardianName">
          ชื่อ-นามสกุลผู้ปกครอง
        </label>
        <input id="guardianName" name="name" defaultValue={defaultValues.name} required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="guardianPhone">
            เบอร์โทรศัพท์
          </label>
          <input
            id="guardianPhone"
            name="phone"
            defaultValue={defaultValues.phone ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="guardianEmail">
            อีเมล (ใช้เข้าสู่ระบบ)
          </label>
          <input
            id="guardianEmail"
            name="email"
            type="email"
            defaultValue={defaultValues.email ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <PasswordInput
        id="guardianPassword"
        name="password"
        label="ตั้งรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
        autoComplete="new-password"
      />

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="mt-1 text-sm text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} self-start px-8`}>
        {pending ? "กำลังบันทึก..." : "บันทึกบัญชีผู้ปกครอง"}
      </button>
    </form>
  );
}
