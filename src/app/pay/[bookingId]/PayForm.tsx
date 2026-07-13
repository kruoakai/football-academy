"use client";

import { useActionState } from "react";
import type { PayState } from "./actions";

export default function PayForm({
  action,
  promoCode,
}: {
  action: (prevState: PayState, formData: FormData) => Promise<PayState>;
  promoCode: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="promoCode" value={promoCode} />
      <div>
        <label htmlFor="slipFile" className="block text-sm font-medium text-neutral-700">
          แนบสลิปการโอนเงิน
        </label>
        <input
          id="slipFile"
          name="slipFile"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-pitch-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-pitch-700 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
        <p className="mt-1 text-xs text-neutral-400">รองรับ PNG, JPEG, WEBP</p>
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400 disabled:opacity-60"
      >
        {pending ? "กำลังส่ง..." : "ส่งสลิปเพื่อตรวจสอบ"}
      </button>
    </form>
  );
}
