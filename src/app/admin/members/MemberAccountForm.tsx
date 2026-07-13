"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import PasswordInput from "@/components/PasswordInput";
import type { UpdateMemberFormState } from "./actions";

export default function MemberAccountForm({
  action,
  defaultValues,
}: {
  action: (prevState: UpdateMemberFormState, formData: FormData) => Promise<UpdateMemberFormState>;
  defaultValues: { name: string; phone: string | null; email: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="memberName">
          ชื่อ-นามสกุล
        </label>
        <input id="memberName" name="name" defaultValue={defaultValues.name} required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="memberPhone">
            เบอร์โทรศัพท์ (ใช้เข้าสู่ระบบ)
          </label>
          <input
            id="memberPhone"
            name="phone"
            defaultValue={defaultValues.phone ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="memberEmail">
            อีเมล (ไม่บังคับ)
          </label>
          <input
            id="memberEmail"
            name="email"
            type="email"
            defaultValue={defaultValues.email ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <PasswordInput
        id="memberPassword"
        name="password"
        label="ตั้งรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
        autoComplete="new-password"
      />

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="mt-1 text-sm text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} self-start px-8`}>
        {pending ? "กำลังบันทึก..." : "บันทึกบัญชี"}
      </button>
    </form>
  );
}
