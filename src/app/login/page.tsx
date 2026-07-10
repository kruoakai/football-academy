"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-pitch-900">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-neutral-600">
          สำหรับผู้ปกครอง โค้ช และเจ้าหน้าที่ยินผัน ฟุตบอล อคาเดมี
        </p>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
            {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-pitch-700 hover:text-pitch-900">
            สมัครเรียน
          </Link>
        </p>
      </div>
    </div>
  );
}
