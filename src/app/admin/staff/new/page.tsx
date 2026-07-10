"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inputClass, labelClass, errorClass, buttonPrimaryClass, cardClass } from "@/lib/admin-ui";
import { createAdminAction, type StaffFormState } from "../actions";

export default function NewAdminPage() {
  const [state, formAction, pending] = useActionState<StaffFormState, FormData>(createAdminAction, undefined);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/staff" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าทีมงาน
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มแอดมินใหม่</h1>
      </div>
      <div className={cardClass}>
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

          {state?.error && <p className={errorClass}>{state.error}</p>}

          <button type="submit" disabled={pending} className={buttonPrimaryClass}>
            {pending ? "กำลังบันทึก..." : "เพิ่มแอดมิน"}
          </button>
        </form>
      </div>
    </div>
  );
}
