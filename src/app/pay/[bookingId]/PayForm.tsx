"use client";

import { useActionState } from "react";
import type { PayState } from "./actions";

export default function PayForm({
  action,
}: {
  action: (prevState: PayState, formData: FormData) => Promise<PayState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <div>
        <label htmlFor="promoCode" className="block text-sm font-medium text-neutral-700">
          รหัสโปรโมชั่น (ถ้ามี)
        </label>
        <input
          id="promoCode"
          name="promoCode"
          placeholder="เช่น SUMMER2569"
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-base uppercase focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
        <p className="mt-1 text-xs text-neutral-400">ส่วนลด (ถ้ามี) จะคำนวณและแสดงผลหลังยืนยันชำระเงิน</p>
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400 disabled:opacity-60"
      >
        {pending ? "กำลังดำเนินการ..." : "จำลองชำระเงินสำเร็จ"}
      </button>
    </form>
  );
}
