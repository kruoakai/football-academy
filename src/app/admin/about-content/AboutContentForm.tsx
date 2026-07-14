"use client";

import { useActionState } from "react";
import { errorClass, buttonPrimaryClass } from "@/lib/admin-ui";
import type { AboutContent } from "@/lib/about-content";
import { VisibilityToggle, CardHeader, Field, Fieldset, PhotoField } from "@/components/admin/ContentFormControls";
import { updateAboutContentAction, type AboutContentFormState } from "./actions";

export default function AboutContentForm({ content }: { content: AboutContent }) {
  const [state, formAction, pending] = useActionState<AboutContentFormState, FormData>(
    updateAboutContentAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Fieldset title="ส่วนหัว (Hero)">
        <Field
          name="heroBadge"
          label="ป้ายข้อความเล็กเหนือหัวข้อ"
          value={content.heroBadge}
          toggleName="showHeroBadge"
          toggleChecked={content.showHeroBadge}
        />
        <Field name="heroTitle" label="หัวข้อหลัก" value={content.heroTitle} />
        <div className="sm:col-span-2">
          <Field name="heroDescription" label="คำอธิบายใต้หัวข้อ" value={content.heroDescription} multiline />
        </div>
      </Fieldset>

      <Fieldset
        title="ผู้ก่อตั้งของเรา"
        toggle={<VisibilityToggle name="showFoundersSection" defaultChecked={content.showFoundersSection} />}
      >
        <Field
          name="foundersSectionTitle"
          label="หัวข้อหมวด"
          value={content.foundersSectionTitle}
          toggleName="showFoundersSectionTitle"
          toggleChecked={content.showFoundersSectionTitle}
        />
        <Field
          name="foundersSectionSubtitle"
          label="คำอธิบายหมวด"
          value={content.foundersSectionSubtitle}
          toggleName="showFoundersSectionSubtitle"
          toggleChecked={content.showFoundersSectionSubtitle}
        />

        <CardHeader title="ผู้ก่อตั้ง 1" toggleName="showFounder1" defaultChecked={content.showFounder1} />
        <div className="sm:col-span-2">
          <PhotoField
            title="รูปผู้ก่อตั้ง 1"
            fileFieldName="founder1Photo"
            removeFieldName="removeFounder1Photo"
            currentUrl={content.founder1PhotoUrl}
            aspectClassName="aspect-square max-w-[10rem]"
          />
        </div>
        <Field name="founder1Initials" label="ผู้ก่อตั้ง 1 — ตัวย่อ (ถ้ายังไม่มีรูป)" value={content.founder1Initials} />
        <Field name="founder1Role" label="ผู้ก่อตั้ง 1 — ตำแหน่ง" value={content.founder1Role} />
        <Field name="founder1Name" label="ผู้ก่อตั้ง 1 — ชื่อ" value={content.founder1Name} />
        <div className="sm:col-span-2">
          <Field name="founder1Bio" label="ผู้ก่อตั้ง 1 — ประวัติ" value={content.founder1Bio} multiline />
        </div>

        <CardHeader title="ผู้ก่อตั้ง 2" toggleName="showFounder2" defaultChecked={content.showFounder2} />
        <div className="sm:col-span-2">
          <PhotoField
            title="รูปผู้ก่อตั้ง 2"
            fileFieldName="founder2Photo"
            removeFieldName="removeFounder2Photo"
            currentUrl={content.founder2PhotoUrl}
            aspectClassName="aspect-square max-w-[10rem]"
          />
        </div>
        <Field name="founder2Initials" label="ผู้ก่อตั้ง 2 — ตัวย่อ (ถ้ายังไม่มีรูป)" value={content.founder2Initials} />
        <Field name="founder2Role" label="ผู้ก่อตั้ง 2 — ตำแหน่ง" value={content.founder2Role} />
        <Field name="founder2Name" label="ผู้ก่อตั้ง 2 — ชื่อ" value={content.founder2Name} />
        <div className="sm:col-span-2">
          <Field name="founder2Bio" label="ผู้ก่อตั้ง 2 — ประวัติ" value={content.founder2Bio} multiline />
        </div>
      </Fieldset>

      <Fieldset
        title="พันธกิจและแนวทาง"
        toggle={<VisibilityToggle name="showMissionSection" defaultChecked={content.showMissionSection} />}
      >
        <CardHeader title="การ์ด 1" toggleName="showMission1" defaultChecked={content.showMission1} />
        <Field name="mission1Title" label="การ์ด 1 — หัวข้อ" value={content.mission1Title} />
        <div className="sm:col-span-2">
          <Field name="mission1Desc" label="การ์ด 1 — คำอธิบาย" value={content.mission1Desc} multiline />
        </div>

        <CardHeader title="การ์ด 2" toggleName="showMission2" defaultChecked={content.showMission2} />
        <Field name="mission2Title" label="การ์ด 2 — หัวข้อ" value={content.mission2Title} />
        <div className="sm:col-span-2">
          <Field name="mission2Desc" label="การ์ด 2 — คำอธิบาย" value={content.mission2Desc} multiline />
        </div>

        <CardHeader title="การ์ด 3" toggleName="showMission3" defaultChecked={content.showMission3} />
        <Field name="mission3Title" label="การ์ด 3 — หัวข้อ" value={content.mission3Title} />
        <div className="sm:col-span-2">
          <Field name="mission3Desc" label="การ์ด 3 — คำอธิบาย" value={content.mission3Desc} multiline />
        </div>
      </Fieldset>

      <Fieldset
        title="ชวนสมัคร (CTA ท้ายหน้า)"
        toggle={<VisibilityToggle name="showCtaSection" defaultChecked={content.showCtaSection} />}
      >
        <div className="sm:col-span-2">
          <Field
            name="ctaTitle"
            label="หัวข้อ"
            value={content.ctaTitle}
            toggleName="showCtaTitle"
            toggleChecked={content.showCtaTitle}
          />
        </div>
        <Field name="ctaButtonLabel" label="ข้อความปุ่ม" value={content.ctaButtonLabel} />
      </Fieldset>

      {state?.error && <p className={errorClass}>{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-pitch-700">{state.success}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimaryClass} self-start px-8`}>
        {pending ? "กำลังบันทึก..." : "บันทึกเนื้อหาหน้าเกี่ยวกับเรา"}
      </button>
    </form>
  );
}
