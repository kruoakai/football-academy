"use client";

import { useActionState, useState } from "react";
import { inputClass, labelClass, errorClass, buttonPrimaryClass, cardClass } from "@/lib/admin-ui";
import type { HomeContent } from "@/lib/home-content";
import VideoEmbed from "@/components/VideoEmbed";
import { VisibilityToggle, CardHeader, Field, Fieldset } from "@/components/admin/ContentFormControls";
import { updateHomeContentAction, type HomeContentFormState } from "./actions";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function HeroVideoField({
  currentUrl,
  currentEmbedUrl,
}: {
  currentUrl: string | null;
  currentEmbedUrl: string | null;
}) {
  // Uploaded via a direct fetch() to /api/admin/upload-video on file select,
  // not bundled into this form's Server Action submission — large video files
  // through a Server Action's multipart body are flaky in Next.js dev
  // (Turbopack), throwing a raw "Unexpected end of form" crash before our own
  // size check ever runs. The resolved URL is carried as a plain hidden text
  // field instead, same as every other text field in this form.
  const [videoUrl, setVideoUrl] = useState(currentUrl ?? "");
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [embedUrl, setEmbedUrl] = useState(currentEmbedUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const showFilePreview = preview && videoUrl;
  const showEmbedPreview = !showFilePreview && embedUrl.trim();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError("ไฟล์วิดีโอต้องมีขนาดไม่เกิน 50MB");
      e.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-video", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "อัปโหลดวิดีโอไม่สำเร็จ");
        setPreview(currentUrl);
        return;
      }
      setVideoUrl(data.url);
    } catch {
      setUploadError("อัปโหลดวิดีโอไม่สำเร็จ กรุณาลองใหม่");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>วิดีโอบรรยากาศฝึกซ้อม (16:9)</label>
      <input type="hidden" name="heroVideoUrl" value={videoUrl} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex aspect-video w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-pitch-50">
          {uploading ? (
            <span className="text-center text-xs text-neutral-400">กำลังอัปโหลด...</span>
          ) : showFilePreview ? (
            <video src={preview} className="h-full w-full object-cover" muted controls />
          ) : showEmbedPreview ? (
            <VideoEmbed url={embedUrl.trim()} className="!rounded-none !shadow-none" />
          ) : (
            <span className="text-center text-xs text-neutral-400">ไม่มีวิดีโอ</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="video/mp4,video/webm"
            disabled={uploading}
            className={inputClass}
            onChange={handleFileChange}
          />
          <p className="mt-1 text-xs text-neutral-500">MP4 หรือ WEBM ไม่เกิน 50MB — แสดงแทนกรอบวิดีโอฝั่งซ้ายของ Hero</p>
          {uploadError && <p className={`mt-1 ${errorClass}`}>{uploadError}</p>}
          {videoUrl && (
            <label className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setVideoUrl("");
                    setPreview(null);
                  } else {
                    setVideoUrl(currentUrl ?? "");
                    setPreview(currentUrl);
                  }
                }}
                className="h-4 w-4 rounded border-neutral-300"
              />
              ลบวิดีโอนี้
            </label>
          )}

          <div className="mt-3 border-t border-neutral-200 pt-3">
            <label className={labelClass} htmlFor="heroVideoEmbedUrl">
              หรือวางลิงก์วิดีโอ (YouTube, Facebook, TikTok ฯลฯ)
            </label>
            <input
              id="heroVideoEmbedUrl"
              type="url"
              name="heroVideoEmbedUrl"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-neutral-500">
              ถ้ามีการอัปโหลดไฟล์วิดีโอด้วย ระบบจะแสดงไฟล์ที่อัปโหลดก่อนเสมอ
            </p>
          </div>
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
      {/* aspect-[4/3] matches the live tile on the home page (src/app/page.tsx)
          so the crop the admin sees here is the crop that actually ships. */}
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-pitch-50">
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

export default function HomeContentForm({ content }: { content: HomeContent }) {
  const [state, formAction, pending] = useActionState<HomeContentFormState, FormData>(
    updateHomeContentAction,
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
        <div />
        <Field name="heroTitleLine1" label="หัวข้อ บรรทัด 1" value={content.heroTitleLine1} />
        <Field name="heroTitleHighlight1" label="หัวข้อ คำเน้นสีทอง 1" value={content.heroTitleHighlight1} />
        <Field name="heroTitleLine2" label="หัวข้อ บรรทัด 2" value={content.heroTitleLine2} />
        <Field name="heroTitleHighlight2" label="หัวข้อ คำเน้นสีทอง 2" value={content.heroTitleHighlight2} />
        <div className="sm:col-span-2">
          <Field name="heroDescription" label="คำอธิบายใต้หัวข้อ" value={content.heroDescription} multiline />
        </div>
        <Field name="heroCtaPrimaryLabel" label="ปุ่มหลัก" value={content.heroCtaPrimaryLabel} />
        <Field name="heroCtaSecondaryLabel" label="ปุ่มรอง" value={content.heroCtaSecondaryLabel} />

        <CardHeader title="การ์ดเล็ก 1" toggleName="showHeroChip1" defaultChecked={content.showHeroChip1} />
        <Field name="heroChip1Title" label="การ์ดเล็ก 1 — หัวข้อ" value={content.heroChip1Title} />
        <Field name="heroChip1Desc" label="การ์ดเล็ก 1 — คำอธิบาย" value={content.heroChip1Desc} />

        <CardHeader title="การ์ดเล็ก 2" toggleName="showHeroChip2" defaultChecked={content.showHeroChip2} />
        <Field name="heroChip2Title" label="การ์ดเล็ก 2 — หัวข้อ" value={content.heroChip2Title} />
        <Field name="heroChip2Desc" label="การ์ดเล็ก 2 — คำอธิบาย" value={content.heroChip2Desc} />

        <CardHeader title="การ์ดเล็ก 3" toggleName="showHeroChip3" defaultChecked={content.showHeroChip3} />
        <Field name="heroChip3Title" label="การ์ดเล็ก 3 — หัวข้อ" value={content.heroChip3Title} />
        <Field name="heroChip3Desc" label="การ์ดเล็ก 3 — คำอธิบาย" value={content.heroChip3Desc} />

        <p className="sm:col-span-2 text-xs text-neutral-500">
          การ์ดเล็ก 3 ใบด้านบนจะแสดงเฉพาะตอนที่ยังไม่มีวิดีโอหรือภาพกิจกรรมด้านล่างนี้เลย
        </p>
      </Fieldset>

      <Fieldset title="วิดีโอและภาพกิจกรรม (แทนที่การ์ดเล็กเมื่อมีอย่างน้อย 1 รายการ)">
        <HeroVideoField currentUrl={content.heroVideoUrl} currentEmbedUrl={content.heroVideoEmbedUrl} />
        <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HeroTileField index={1} currentUrl={content.heroTile1Url} labelValue={content.heroTile1Label} />
          <HeroTileField index={2} currentUrl={content.heroTile2Url} labelValue={content.heroTile2Label} />
          <HeroTileField index={3} currentUrl={content.heroTile3Url} labelValue={content.heroTile3Label} />
          <HeroTileField index={4} currentUrl={content.heroTile4Url} labelValue={content.heroTile4Label} />
        </div>
      </Fieldset>

      <Fieldset
        title="สองมืออาชีพ หนึ่งเป้าหมาย (USP)"
        toggle={<VisibilityToggle name="showUspSection" defaultChecked={content.showUspSection} />}
      >
        <Field
          name="uspSectionTitle"
          label="หัวข้อหมวด"
          value={content.uspSectionTitle}
          toggleName="showUspSectionTitle"
          toggleChecked={content.showUspSectionTitle}
        />
        <Field
          name="uspSectionSubtitle"
          label="คำอธิบายหมวด"
          value={content.uspSectionSubtitle}
          toggleName="showUspSectionSubtitle"
          toggleChecked={content.showUspSectionSubtitle}
        />

        <CardHeader title="การ์ด 1" toggleName="showUsp1" defaultChecked={content.showUsp1} />
        <Field name="usp1Tag" label="การ์ด 1 — ป้ายตำแหน่ง" value={content.usp1Tag} />
        <Field name="usp1Title" label="การ์ด 1 — หัวข้อ" value={content.usp1Title} />
        <Field name="usp1Name" label="การ์ด 1 — ชื่อ" value={content.usp1Name} />
        <div className="sm:col-span-2">
          <Field name="usp1Desc" label="การ์ด 1 — คำอธิบาย" value={content.usp1Desc} multiline />
        </div>

        <CardHeader title="การ์ด 2" toggleName="showUsp2" defaultChecked={content.showUsp2} />
        <Field name="usp2Tag" label="การ์ด 2 — ป้ายตำแหน่ง" value={content.usp2Tag} />
        <Field name="usp2Title" label="การ์ด 2 — หัวข้อ" value={content.usp2Title} />
        <Field name="usp2Name" label="การ์ด 2 — ชื่อ" value={content.usp2Name} />
        <div className="sm:col-span-2">
          <Field name="usp2Desc" label="การ์ด 2 — คำอธิบาย" value={content.usp2Desc} multiline />
        </div>
      </Fieldset>

      <Fieldset
        title="ทำไมต้องเรา (Highlights)"
        toggle={<VisibilityToggle name="showHighlightsSection" defaultChecked={content.showHighlightsSection} />}
      >
        <div className="sm:col-span-2">
          <Field
            name="highlightsSectionTitle"
            label="หัวข้อหมวด"
            value={content.highlightsSectionTitle}
            toggleName="showHighlightsSectionTitle"
            toggleChecked={content.showHighlightsSectionTitle}
          />
        </div>

        <CardHeader title="การ์ด 1" toggleName="showHighlight1" defaultChecked={content.showHighlight1} />
        <Field name="highlight1Title" label="การ์ด 1 — หัวข้อ" value={content.highlight1Title} />
        <Field name="highlight1Desc" label="การ์ด 1 — คำอธิบาย" value={content.highlight1Desc} multiline />

        <CardHeader title="การ์ด 2" toggleName="showHighlight2" defaultChecked={content.showHighlight2} />
        <Field name="highlight2Title" label="การ์ด 2 — หัวข้อ" value={content.highlight2Title} />
        <Field name="highlight2Desc" label="การ์ด 2 — คำอธิบาย" value={content.highlight2Desc} multiline />

        <CardHeader title="การ์ด 3" toggleName="showHighlight3" defaultChecked={content.showHighlight3} />
        <Field name="highlight3Title" label="การ์ด 3 — หัวข้อ" value={content.highlight3Title} />
        <Field name="highlight3Desc" label="การ์ด 3 — คำอธิบาย" value={content.highlight3Desc} multiline />
      </Fieldset>

      <Fieldset
        title="คอร์สเรียนตามช่วงวัย (Programs)"
        toggle={<VisibilityToggle name="showProgramsSection" defaultChecked={content.showProgramsSection} />}
      >
        <Field
          name="programsSectionTitle"
          label="หัวข้อหมวด"
          value={content.programsSectionTitle}
          toggleName="showProgramsSectionTitle"
          toggleChecked={content.showProgramsSectionTitle}
        />
        <Field
          name="programsSectionSubtitle"
          label="คำอธิบายหมวด"
          value={content.programsSectionSubtitle}
          toggleName="showProgramsSectionSubtitle"
          toggleChecked={content.showProgramsSectionSubtitle}
        />

        <CardHeader title="การ์ด 1" toggleName="showProgram1" defaultChecked={content.showProgram1} />
        <Field name="program1Age" label="การ์ด 1 — ช่วงอายุ" value={content.program1Age} />
        <Field name="program1Name" label="การ์ด 1 — ชื่อรุ่น" value={content.program1Name} />
        <div className="sm:col-span-2">
          <Field name="program1Desc" label="การ์ด 1 — คำอธิบาย" value={content.program1Desc} multiline />
        </div>

        <CardHeader title="การ์ด 2" toggleName="showProgram2" defaultChecked={content.showProgram2} />
        <Field name="program2Age" label="การ์ด 2 — ช่วงอายุ" value={content.program2Age} />
        <Field name="program2Name" label="การ์ด 2 — ชื่อรุ่น" value={content.program2Name} />
        <div className="sm:col-span-2">
          <Field name="program2Desc" label="การ์ด 2 — คำอธิบาย" value={content.program2Desc} multiline />
        </div>

        <CardHeader title="การ์ด 3" toggleName="showProgram3" defaultChecked={content.showProgram3} />
        <Field name="program3Age" label="การ์ด 3 — ช่วงอายุ" value={content.program3Age} />
        <Field name="program3Name" label="การ์ด 3 — ชื่อรุ่น" value={content.program3Name} />
        <div className="sm:col-span-2">
          <Field name="program3Desc" label="การ์ด 3 — คำอธิบาย" value={content.program3Desc} multiline />
        </div>
      </Fieldset>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-pitch-900">บทความล่าสุด</h2>
            <p className="mt-1 text-xs text-neutral-500">
              แสดงบทความที่เผยแพร่ล่าสุด 3 บทความ ต่อจากส่วน &ldquo;กิจกรรมล่าสุด&rdquo; — เนื้อหาบทความแก้ไขได้ที่หน้า
              &ldquo;บทความ&rdquo; ในเมนู
            </p>
          </div>
          <VisibilityToggle name="showArticlesSection" defaultChecked={content.showArticlesSection} />
        </div>
      </div>

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
        <div className="sm:col-span-2">
          <Field name="ctaDescription" label="คำอธิบาย" value={content.ctaDescription} multiline />
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
