"use client";

import { useState } from "react";
import { inputClass, labelClass, cardClass } from "@/lib/admin-ui";

export function VisibilityToggle({
  name,
  defaultChecked,
  label = "แสดงส่วนนี้บนหน้านี้",
}: {
  name: string;
  defaultChecked: boolean;
  label?: string;
}) {
  return (
    <label className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-neutral-600">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-neutral-300 text-pitch-600 focus:ring-pitch-500"
      />
      {label}
    </label>
  );
}

export function CardHeader({
  title,
  toggleName,
  defaultChecked,
}: {
  title: string;
  toggleName: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 sm:col-span-2">
      <p className="text-sm font-semibold text-pitch-800">{title}</p>
      <VisibilityToggle name={toggleName} defaultChecked={defaultChecked} label="แสดงการ์ดนี้" />
    </div>
  );
}

export function Field({
  name,
  label,
  value,
  multiline = false,
  toggleName,
  toggleChecked,
}: {
  name: string;
  label: string;
  value: string;
  multiline?: boolean;
  toggleName?: string;
  toggleChecked?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className={labelClass} htmlFor={name}>
          {label}
        </label>
        {toggleName && <VisibilityToggle name={toggleName} defaultChecked={!!toggleChecked} label="แสดง" />}
      </div>
      {multiline ? (
        <textarea id={name} name={name} defaultValue={value} rows={3} required className={inputClass} />
      ) : (
        <input id={name} name={name} defaultValue={value} required className={inputClass} />
      )}
    </div>
  );
}

export function Fieldset({
  title,
  toggle,
  children,
}: {
  title: string;
  toggle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-pitch-900">{title}</h2>
        {toggle}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// Generic image upload+preview+remove control, submitted through the parent
// Server Action's multipart body (unlike the video upload, images here stay
// well under the form's bodySizeLimit — see next.config.ts).
export function PhotoField({
  title,
  fileFieldName,
  removeFieldName,
  currentUrl,
  aspectClassName = "aspect-square",
}: {
  title: string;
  fileFieldName: string;
  removeFieldName: string;
  currentUrl: string | null;
  aspectClassName?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [remove, setRemove] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="mb-2 text-sm font-semibold text-pitch-800">{title}</p>
      <div className={`flex w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-pitch-50 ${aspectClassName}`}>
        {preview && !remove ? (
          // eslint-disable-next-line @next/next/no-img-element -- live client-side preview (blob/existing URL), next/image can't optimize those
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-neutral-400">ไม่มีรูป</span>
        )}
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
