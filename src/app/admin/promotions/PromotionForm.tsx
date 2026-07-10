"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { PromotionFormState } from "./actions";

type DefaultValues = {
  code: string;
  type: "DISCOUNT" | "GIFT";
  value: number | null;
  discountUnit: "PERCENT" | "AMOUNT" | null;
  giftItem: string | null;
  giftStock: number | null;
  targetGroup: string | null;
  validFrom: string;
  validTo: string;
  maxUses: number | null;
};

export default function PromotionForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: PromotionFormState, formData: FormData) => Promise<PromotionFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<"DISCOUNT" | "GIFT">(defaultValues?.type ?? "DISCOUNT");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="code">
          รหัสโปรโมชั่น
        </label>
        <input
          id="code"
          name="code"
          defaultValue={defaultValues?.code}
          placeholder="เช่น SUMMER2569"
          required
          className={`${inputClass} uppercase`}
        />
      </div>

      <div>
        <span className={labelClass}>ประเภท</span>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("DISCOUNT")}
            className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium ${
              type === "DISCOUNT" ? "border-gold-500 bg-gold-50 text-pitch-900" : "border-neutral-200 text-neutral-600"
            }`}
          >
            ส่วนลด
          </button>
          <button
            type="button"
            onClick={() => setType("GIFT")}
            className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium ${
              type === "GIFT" ? "border-gold-500 bg-gold-50 text-pitch-900" : "border-neutral-200 text-neutral-600"
            }`}
          >
            ของแถม
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {type === "DISCOUNT" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="value">
              มูลค่าส่วนลด
            </label>
            <input
              id="value"
              name="value"
              type="number"
              min="0"
              step="1"
              defaultValue={defaultValues?.value ?? undefined}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="discountUnit">
              หน่วย
            </label>
            <select id="discountUnit" name="discountUnit" defaultValue={defaultValues?.discountUnit ?? "PERCENT"} className={inputClass}>
              <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
              <option value="AMOUNT">บาท</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="giftItem">
              ชื่อของแถม
            </label>
            <input id="giftItem" name="giftItem" defaultValue={defaultValues?.giftItem ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="giftStock">
              จำนวนคงเหลือ
            </label>
            <input
              id="giftStock"
              name="giftStock"
              type="number"
              min="0"
              defaultValue={defaultValues?.giftStock ?? undefined}
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="targetGroup">
          กลุ่มเป้าหมาย (ไม่บังคับ)
        </label>
        <input
          id="targetGroup"
          name="targetGroup"
          defaultValue={defaultValues?.targetGroup ?? ""}
          placeholder="เช่น สมาชิกใหม่"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="validFrom">
            เริ่มใช้ได้
          </label>
          <input
            id="validFrom"
            name="validFrom"
            type="date"
            defaultValue={defaultValues?.validFrom}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="validTo">
            ใช้ได้ถึง
          </label>
          <input
            id="validTo"
            name="validTo"
            type="date"
            defaultValue={defaultValues?.validTo}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="maxUses">
          จำนวนครั้งที่ใช้ได้สูงสุด (ไม่บังคับ)
        </label>
        <input
          id="maxUses"
          name="maxUses"
          type="number"
          min="1"
          defaultValue={defaultValues?.maxUses ?? undefined}
          className={inputClass}
        />
      </div>

      {state?.error && <p className={errorClass}>{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimaryClass}>
        {pending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
