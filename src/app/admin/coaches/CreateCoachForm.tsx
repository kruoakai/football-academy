"use client";

import { useActionState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import { createCoachAction, type CoachFormState } from "./actions";

export default function CreateCoachForm() {
  const [state, formAction, pending] = useActionState<CoachFormState, FormData>(createCoachAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="name">
          ชื่อ-นามสกุล
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="phone">
            เบอร์โทรศัพท์ (ใช้เข้าสู่ระบบ)
          </label>
          <input id="phone" name="phone" inputMode="numeric" placeholder="08XXXXXXXX" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            อีเมล (ไม่บังคับ)
          </label>
          <input id="email" name="email" type="email" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          ตั้งรหัสผ่าน
        </label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="specialty">
          ความเชี่ยวชาญ (ไม่บังคับ)
        </label>
        <input id="specialty" name="specialty" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="bio">
          ประวัติโดยย่อ (ไม่บังคับ)
        </label>
        <textarea id="bio" name="bio" rows={3} className={inputClass} />
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : "เพิ่มโค้ช"}
      </button>
    </form>
  );
}
