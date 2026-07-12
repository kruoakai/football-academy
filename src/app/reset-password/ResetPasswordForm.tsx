"use client";

import { useActionState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    undefined
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <PasswordInput id="password" name="password" label="รหัสผ่านใหม่" autoComplete="new-password" required />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="ยืนยันรหัสผ่านใหม่"
        autoComplete="new-password"
        required
      />

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
