"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass, cardClass } from "@/lib/admin-ui";
import type { SiteSettings } from "@/lib/site-settings";
import { updateSiteSettingsAction, type SiteSettingsFormState } from "./actions";

const textareaFields = new Set(["footerDescription"]);

function LogoField({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);

  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>รูปโลโก้</label>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-pitch-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- live client-side preview (blob/data URL), next/image can't optimize those
            <img src={preview} alt="ตัวอย่างโลโก้" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">ไอคอนเริ่มต้น</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            name="logoFile"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className={inputClass}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
          <p className="mt-1 text-xs text-neutral-500">PNG, JPEG, WEBP หรือ SVG ไม่เกิน 5MB</p>
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass} htmlFor="logoUrl">
          หรือวาง URL รูปภาพแทน (เว้นว่างทั้งคู่เพื่อใช้ไอคอนเริ่มต้น)
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          defaultValue={currentUrl ?? ""}
          className={inputClass}
          placeholder="https://..."
          onChange={(e) => {
            if (e.target.value) setPreview(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  const isTextarea = textareaFields.has(name);
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      {isTextarea ? (
        <textarea id={name} name={name} defaultValue={value} rows={2} required className={inputClass} />
      ) : (
        <input id={name} name={name} defaultValue={value} required className={inputClass} />
      )}
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cardClass}>
      <h2 className="mb-4 font-heading text-lg font-semibold text-pitch-900">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<SiteSettingsFormState, FormData>(
    updateSiteSettingsAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Fieldset title="ส่วนหัว (Header)">
        <LogoField currentUrl={settings.logoUrl} />
        <Field name="headerBrandPrefix" label="ชื่อแบรนด์ (ส่วนแรก)" value={settings.headerBrandPrefix} />
        <Field
          name="headerBrandHighlight"
          label="ชื่อแบรนด์ (ส่วนเน้นสีทอง)"
          value={settings.headerBrandHighlight}
        />
        <Field name="headerLoginLabel" label="ข้อความปุ่มเข้าสู่ระบบ" value={settings.headerLoginLabel} />
        <Field name="headerCtaLabel" label="ข้อความปุ่มสมัครเรียน" value={settings.headerCtaLabel} />
      </Fieldset>

      <Fieldset title="เมนูนำทาง (Nav)">
        <Field name="navHomeLabel" label="หน้าแรก" value={settings.navHomeLabel} />
        <Field name="navAboutLabel" label="เกี่ยวกับเรา" value={settings.navAboutLabel} />
        <Field name="navCoursesLabel" label="คอร์สเรียน (เร็วๆ นี้)" value={settings.navCoursesLabel} />
        <Field name="navClinicLabel" label="คลินิกกายภาพ (เร็วๆ นี้)" value={settings.navClinicLabel} />
        <Field name="navGalleryLabel" label="แกลเลอรี่ (เร็วๆ นี้)" value={settings.navGalleryLabel} />
        <Field name="navBlogLabel" label="บทความ" value={settings.navBlogLabel} />
        <Field name="navContactLabel" label="ติดต่อเรา (เร็วๆ นี้)" value={settings.navContactLabel} />
      </Fieldset>

      <Fieldset title="ส่วนท้าย (Footer) — แบรนด์">
        <Field name="footerBrandName" label="ชื่อแบรนด์" value={settings.footerBrandName} />
        <div className="sm:col-span-2">
          <Field name="footerDescription" label="คำอธิบายแบรนด์" value={settings.footerDescription} />
        </div>
        <Field name="footerCoursesText" label="เมนู: คอร์สเรียน" value={settings.footerCoursesText} />
        <Field name="footerClinicText" label="เมนู: คลินิกกายภาพ" value={settings.footerClinicText} />
      </Fieldset>

      <Fieldset title="ส่วนท้าย (Footer) — ติดต่อเรา">
        <Field name="footerAddress" label="ที่อยู่/สนามฝึกซ้อม" value={settings.footerAddress} />
        <Field name="footerPhone" label="เบอร์โทร" value={settings.footerPhone} />
        <Field name="footerLineId" label="LINE Official" value={settings.footerLineId} />
        <Field name="footerCopyrightText" label="ข้อความลิขสิทธิ์ (ต่อจากปี ค.ศ.)" value={settings.footerCopyrightText} />
        <Field name="contactHours" label="เวลาทำการ (แสดงในหน้าติดต่อเรา)" value={settings.contactHours} />
      </Fieldset>

      <Fieldset title="ส่วนท้าย (Footer) — ติดตามเรา">
        <Field name="footerFacebookText" label="Facebook" value={settings.footerFacebookText} />
        <Field name="footerInstagramText" label="Instagram" value={settings.footerInstagramText} />
      </Fieldset>

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} self-start px-8`}>
        {pending ? "กำลังบันทึก..." : "บันทึกส่วนหัว/ท้ายเว็บไซต์"}
      </button>
    </form>
  );
}
