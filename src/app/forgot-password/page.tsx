"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    undefined
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-pitch-900">ลืมรหัสผ่าน</h1>
        <p className="mt-1 text-sm text-neutral-600">
          กรอกอีเมลหรือเบอร์โทรศัพท์ที่ใช้สมัคร ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </p>

        {state?.success ? (
          <div className="mt-6 rounded-lg bg-pitch-50 px-4 py-3 text-sm text-pitch-800">
            {state.success}
          </div>
        ) : (
          <form action={action} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700">
                อีเมลหรือเบอร์โทรศัพท์
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                className="mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400 disabled:opacity-60"
            >
              {pending ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-600">
          <Link href="/login" className="font-medium text-pitch-700 hover:text-pitch-900">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-neutral-500">
          หากไม่มีอีเมลหรือ LINE ที่เชื่อมต่อไว้ ระบบจะไม่สามารถส่งลิงก์ให้ได้ กรุณา{" "}
          <Link href="/contact" className="font-medium text-pitch-700 hover:underline">
            ติดต่อเจ้าหน้าที่
          </Link>{" "}
          เพื่อขอให้ตั้งรหัสผ่านใหม่ให้
        </p>
      </div>
    </div>
  );
}
