"use client";

import { useActionState, useEffect, useRef } from "react";
import { markByCodeAction, type MarkByCodeState } from "./actions";

export default function ScanInput({ activityId }: { activityId: string }) {
  const boundAction = markByCodeAction.bind(null, activityId);
  const [state, formAction, pending] = useActionState<MarkByCodeState, FormData>(boundAction, undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl bg-pitch-50 p-4">
      <label htmlFor="code" className="text-sm font-medium text-pitch-800">
        สแกน หรือ กรอกรหัสนักเรียน (QR)
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="code"
          name="code"
          autoFocus
          autoComplete="off"
          placeholder="YP-XXXXXXXX"
          className="min-h-[44px] flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded-lg bg-pitch-700 px-4 text-sm font-semibold text-white hover:bg-pitch-800 disabled:opacity-60"
        >
          เช็คชื่อ
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-pitch-700">{state.success}</p>}
    </form>
  );
}
