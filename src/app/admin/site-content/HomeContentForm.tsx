"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass, cardClass } from "@/lib/admin-ui";
import type { HomeContent } from "@/lib/home-content";
import { updateHomeContentAction, type HomeContentFormState } from "./actions";

const textareaFields = new Set([
  "heroDescription",
  "usp1Desc",
  "usp2Desc",
  "highlight1Desc",
  "highlight2Desc",
  "highlight3Desc",
  "program1Desc",
  "program2Desc",
  "program3Desc",
  "ctaDescription",
]);

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  const isTextarea = textareaFields.has(name);
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      {isTextarea ? (
        <textarea id={name} name={name} defaultValue={value} rows={3} required className={inputClass} />
      ) : (
        <input id={name} name={name} defaultValue={value} required className={inputClass} />
      )}
    </div>
  );
}

function HeroVideoField({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [remove, setRemove] = useState(false);

  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>วิดีโอบรรยากาศฝึกซ้อม (16:9)</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex aspect-video w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-pitch-50">
          {preview && !remove ? (
            <video src={preview} className="h-full w-full object-cover" muted controls />
          ) : (
            <span className="text-center text-xs text-neutral-400">ไม่มีวิดีโอ</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            name="heroVideoFile"
            accept="video/mp4,video/webm"
            className={inputClass}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setRemove(false);
              }
            }}
          />
          <p className="mt-1 text-xs text-neutral-500">MP4 หรือ WEBM ไม่เกิน 50MB — แสดงแทนกรอบวิดีโอฝั่งซ้ายของ Hero</p>
          {currentUrl && (
            <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                name="removeHeroVideo"
                checked={remove}
                onChange={(e) => setRemove(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              ลบวิดีโอนี้
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroTileField({
  index,
  currentUrl,
  labelValue,
}: {
  index: 1 | 2 | 3 | 4;
  currentUrl: string | null;
  labelValue: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [remove, setRemove] = useState(false);
  const fileFieldName = `heroTile${index}File`;
  const removeFieldName = `removeHeroTile${index}`;
  const labelFieldName = `heroTile${index}Label`;

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="mb-2 text-sm font-semibold text-pitch-800">ภาพกิจกรรม {index}</p>
      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-pitch-50">
        {preview && !remove ? (
          // eslint-disable-next-line @next/next/no-img-element -- live client-side preview (blob/existing URL), next/image can't optimize those
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-neutral-400">ไม่มีรูป</span>
        )}
      </div>
      <div className="mt-2">
        <label className={labelClass} htmlFor={labelFieldName}>
          ป้ายข้อความ
        </label>
        <input id={labelFieldName} name={labelFieldName} defaultValue={labelValue} required className={inputClass} />
      </div>
      <input
        type="file"
        name={fileFieldName}
        accept="image/png,image/jpeg,image/webp"
        className={`${inputClass} mt-2`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setPreview(URL.createObjectURL(file));
            setRemove(false);
          }
        }}
      />
      {currentUrl && (
        <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            name={removeFieldName}
            checked={remove}
            onChange={(e) => setRemove(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          ลบรูปนี้
        </label>
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

export default function HomeContentForm({ content }: { content: HomeContent }) {
  const [state, formAction, pending] = useActionState<HomeContentFormState, FormData>(
    updateHomeContentAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Fieldset title="ส่วนหัว (Hero)">
        <Field name="heroBadge" label="ป้ายข้อความเล็กเหนือหัวข้อ" value={content.heroBadge} />
        <div />
        <Field name="heroTitleLine1" label="หัวข้อ บรรทัด 1" value={content.heroTitleLine1} />
        <Field name="heroTitleHighlight1" label="หัวข้อ คำเน้นสีทอง 1" value={content.heroTitleHighlight1} />
        <Field name="heroTitleLine2" label="หัวข้อ บรรทัด 2" value={content.heroTitleLine2} />
        <Field name="heroTitleHighlight2" label="หัวข้อ คำเน้นสีทอง 2" value={content.heroTitleHighlight2} />
        <div className="sm:col-span-2">
          <Field name="heroDescription" label="คำอธิบายใต้หัวข้อ" value={content.heroDescription} />
        </div>
        <Field name="heroCtaPrimaryLabel" label="ปุ่มหลัก" value={content.heroCtaPrimaryLabel} />
        <Field name="heroCtaSecondaryLabel" label="ปุ่มรอง" value={content.heroCtaSecondaryLabel} />
        <Field name="heroChip1Title" label="การ์ดเล็ก 1 — หัวข้อ" value={content.heroChip1Title} />
        <Field name="heroChip1Desc" label="การ์ดเล็ก 1 — คำอธิบาย" value={content.heroChip1Desc} />
        <Field name="heroChip2Title" label="การ์ดเล็ก 2 — หัวข้อ" value={content.heroChip2Title} />
        <Field name="heroChip2Desc" label="การ์ดเล็ก 2 — คำอธิบาย" value={content.heroChip2Desc} />
        <Field name="heroChip3Title" label="การ์ดเล็ก 3 — หัวข้อ" value={content.heroChip3Title} />
        <Field name="heroChip3Desc" label="การ์ดเล็ก 3 — คำอธิบาย" value={content.heroChip3Desc} />
        <p className="sm:col-span-2 text-xs text-neutral-500">
          การ์ดเล็ก 3 ใบด้านบนจะแสดงเฉพาะตอนที่ยังไม่มีวิดีโอหรือภาพกิจกรรมด้านล่างนี้เลย
        </p>
      </Fieldset>

      <Fieldset title="วิดีโอและภาพกิจกรรม (แทนที่การ์ดเล็กเมื่อมีอย่างน้อย 1 รายการ)">
        <HeroVideoField currentUrl={content.heroVideoUrl} />
        <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HeroTileField index={1} currentUrl={content.heroTile1Url} labelValue={content.heroTile1Label} />
          <HeroTileField index={2} currentUrl={content.heroTile2Url} labelValue={content.heroTile2Label} />
          <HeroTileField index={3} currentUrl={content.heroTile3Url} labelValue={content.heroTile3Label} />
          <HeroTileField index={4} currentUrl={content.heroTile4Url} labelValue={content.heroTile4Label} />
        </div>
      </Fieldset>

      <Fieldset title="สองมืออาชีพ หนึ่งเป้าหมาย (USP)">
        <Field name="uspSectionTitle" label="หัวข้อหมวด" value={content.uspSectionTitle} />
        <Field name="uspSectionSubtitle" label="คำอธิบายหมวด" value={content.uspSectionSubtitle} />
        <Field name="usp1Tag" label="การ์ด 1 — ป้ายตำแหน่ง" value={content.usp1Tag} />
        <Field name="usp1Title" label="การ์ด 1 — หัวข้อ" value={content.usp1Title} />
        <Field name="usp1Name" label="การ์ด 1 — ชื่อ" value={content.usp1Name} />
        <div className="sm:col-span-2">
          <Field name="usp1Desc" label="การ์ด 1 — คำอธิบาย" value={content.usp1Desc} />
        </div>
        <Field name="usp2Tag" label="การ์ด 2 — ป้ายตำแหน่ง" value={content.usp2Tag} />
        <Field name="usp2Title" label="การ์ด 2 — หัวข้อ" value={content.usp2Title} />
        <Field name="usp2Name" label="การ์ด 2 — ชื่อ" value={content.usp2Name} />
        <div className="sm:col-span-2">
          <Field name="usp2Desc" label="การ์ด 2 — คำอธิบาย" value={content.usp2Desc} />
        </div>
      </Fieldset>

      <Fieldset title="ทำไมต้องเรา (Highlights)">
        <div className="sm:col-span-2">
          <Field name="highlightsSectionTitle" label="หัวข้อหมวด" value={content.highlightsSectionTitle} />
        </div>
        <Field name="highlight1Title" label="การ์ด 1 — หัวข้อ" value={content.highlight1Title} />
        <Field name="highlight1Desc" label="การ์ด 1 — คำอธิบาย" value={content.highlight1Desc} />
        <Field name="highlight2Title" label="การ์ด 2 — หัวข้อ" value={content.highlight2Title} />
        <Field name="highlight2Desc" label="การ์ด 2 — คำอธิบาย" value={content.highlight2Desc} />
        <Field name="highlight3Title" label="การ์ด 3 — หัวข้อ" value={content.highlight3Title} />
        <Field name="highlight3Desc" label="การ์ด 3 — คำอธิบาย" value={content.highlight3Desc} />
      </Fieldset>

      <Fieldset title="คอร์สเรียนตามช่วงวัย (Programs)">
        <Field name="programsSectionTitle" label="หัวข้อหมวด" value={content.programsSectionTitle} />
        <Field name="programsSectionSubtitle" label="คำอธิบายหมวด" value={content.programsSectionSubtitle} />
        <Field name="program1Age" label="การ์ด 1 — ช่วงอายุ" value={content.program1Age} />
        <Field name="program1Name" label="การ์ด 1 — ชื่อรุ่น" value={content.program1Name} />
        <div className="sm:col-span-2">
          <Field name="program1Desc" label="การ์ด 1 — คำอธิบาย" value={content.program1Desc} />
        </div>
        <Field name="program2Age" label="การ์ด 2 — ช่วงอายุ" value={content.program2Age} />
        <Field name="program2Name" label="การ์ด 2 — ชื่อรุ่น" value={content.program2Name} />
        <div className="sm:col-span-2">
          <Field name="program2Desc" label="การ์ด 2 — คำอธิบาย" value={content.program2Desc} />
        </div>
        <Field name="program3Age" label="การ์ด 3 — ช่วงอายุ" value={content.program3Age} />
        <Field name="program3Name" label="การ์ด 3 — ชื่อรุ่น" value={content.program3Name} />
        <div className="sm:col-span-2">
          <Field name="program3Desc" label="การ์ด 3 — คำอธิบาย" value={content.program3Desc} />
        </div>
      </Fieldset>

      <Fieldset title="ชวนสมัคร (CTA ท้ายหน้า)">
        <div className="sm:col-span-2">
          <Field name="ctaTitle" label="หัวข้อ" value={content.ctaTitle} />
        </div>
        <div className="sm:col-span-2">
          <Field name="ctaDescription" label="คำอธิบาย" value={content.ctaDescription} />
        </div>
        <Field name="ctaButtonLabel" label="ข้อความปุ่ม" value={content.ctaButtonLabel} />
      </Fieldset>

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} self-start px-8`}>
        {pending ? "กำลังบันทึก..." : "บันทึกเนื้อหาหน้าแรก"}
      </button>
    </form>
  );
}
