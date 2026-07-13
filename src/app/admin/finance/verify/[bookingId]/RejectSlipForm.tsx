"use client";

import { useActionState } from "react";
import { rejectPaymentSlipAction, type SlipReviewState } from "../../actions";

export default function RejectSlipForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState<SlipReviewState, FormData>(
    rejectPaymentSlipAction.bind(null, bookingId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
      <label htmlFor="reason" className="text-sm font-medium text-red-800">
        เหตุผลที่ไม่ผ่านการตรวจสอบ
      </label>
      <textarea
        id="reason"
        name="reason"
        rows={2}
        placeholder="เช่น ยอดเงินไม่ตรง / มองไม่เห็นรายละเอียด / สลิปไม่ชัดเจน"
        className="min-h-[44px] rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-red-400 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก..." : "ไม่ผ่าน — แจ้งเหตุผล"}
      </button>
    </form>
  );
}
