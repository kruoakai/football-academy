"use client";

import { useActionState, useRef } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass, buttonSecondaryClass } from "@/lib/admin-ui";
import { sendCampaignAction, type CampaignFormState } from "./actions";

export default function CampaignForm({ batches }: { batches: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<CampaignFormState, FormData>(sendCampaignAction, undefined);
  const confirmRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="subject">
          หัวข้อ (สำหรับอีเมล)
        </label>
        <input id="subject" name="subject" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="message">
          ข้อความ
        </label>
        <textarea id="message" name="message" rows={6} required className={inputClass} />
      </div>

      <div>
        <span className={labelClass}>ช่องทาง</span>
        <div className="mt-1 flex gap-4">
          <label className="flex min-h-[44px] items-center gap-2 text-sm">
            <input type="checkbox" name="channelEmail" defaultChecked className="h-5 w-5 rounded border-neutral-300" />
            อีเมล
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm">
            <input type="checkbox" name="channelLine" className="h-5 w-5 rounded border-neutral-300" />
            LINE
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="audience">
          กลุ่มเป้าหมาย
        </label>
        <select id="audience" name="audience" defaultValue="all" className={inputClass}>
          <option value="all">ผู้ปกครองทุกคน</option>
          <option value="pending_payment">มีการจองค้างชำระ</option>
          {batches.map((b) => (
            <option key={b.id} value={`batch:${b.id}`}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="confirm" ref={confirmRef} defaultValue="false" />

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="text-sm text-pitch-700">{state.success}</p>}

      {state?.preview ? (
        <div className="rounded-lg bg-gold-50 px-3 py-3 text-sm text-gold-800">
          <p>
            จะส่งถึง <strong>{state.preview.count}</strong> คน (กลุ่ม: {state.preview.audienceLabel})
          </p>
          <button
            type="submit"
            onClick={() => {
              if (confirmRef.current) confirmRef.current.value = "true";
            }}
            disabled={pending}
            className={`${buttonPrimaryClass} mt-3`}
          >
            ยืนยันและส่ง
          </button>
        </div>
      ) : (
        <button
          type="submit"
          onClick={() => {
            if (confirmRef.current) confirmRef.current.value = "false";
          }}
          disabled={pending}
          className={buttonSecondaryClass}
        >
          {pending ? "กำลังตรวจสอบ..." : "ตรวจสอบจำนวนผู้รับ"}
        </button>
      )}
    </form>
  );
}
