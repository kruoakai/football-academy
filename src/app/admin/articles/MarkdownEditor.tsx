"use client";

import { useRef, useState } from "react";
import { marked } from "marked";
import { labelClass, inputClass } from "@/lib/admin-ui";

type ToolbarAction = {
  label: string;
  title: string;
  apply: (selected: string) => { before: string; after: string; placeholder: string };
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "H2", title: "หัวข้อย่อย", apply: () => ({ before: "## ", after: "", placeholder: "หัวข้อ" }) },
  { label: "B", title: "ตัวหนา", apply: () => ({ before: "**", after: "**", placeholder: "ข้อความตัวหนา" }) },
  { label: "I", title: "ตัวเอียง", apply: () => ({ before: "*", after: "*", placeholder: "ข้อความตัวเอียง" }) },
  {
    label: "🔗",
    title: "ลิงก์",
    apply: () => ({ before: "[", after: "](https://)", placeholder: "ข้อความลิงก์" }),
  },
  { label: "•", title: "รายการหัวข้อ", apply: () => ({ before: "- ", after: "", placeholder: "รายการ" }) },
  {
    label: "🖼",
    title: "รูปภาพ (แทรก URL)",
    apply: () => ({ before: "![", after: "](https://)", placeholder: "คำอธิบายรูป" }),
  },
];

export default function MarkdownEditor({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const [content, setContent] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = content.slice(selectionStart, selectionEnd);
    const { before, after, placeholder } = action.apply(selected);
    const inner = selected || placeholder;
    const next = content.slice(0, selectionStart) + before + inner + after + content.slice(selectionEnd);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + before.length + inner.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div>
      <label className={labelClass}>เนื้อหา (รองรับ Markdown)</label>
      <div className="mt-1 overflow-hidden rounded-lg border border-neutral-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.title}
              onClick={() => applyAction(action)}
              className="flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-200"
            >
              {action.label}
            </button>
          ))}
          <div className="ml-auto flex overflow-hidden rounded-md border border-neutral-300 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1.5 ${tab === "write" ? "bg-pitch-700 text-white" : "bg-white text-neutral-600"}`}
            >
              เขียน
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1.5 ${tab === "preview" ? "bg-pitch-700 text-white" : "bg-white text-neutral-600"}`}
            >
              ตัวอย่าง
            </button>
          </div>
        </div>

        {/* Textarea stays mounted (just visually hidden) on the preview tab so its
            value is still included in the form's FormData on submit. */}
        <textarea
          ref={textareaRef}
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          required
          className={`${inputClass} rounded-none border-0 font-mono text-sm focus:ring-0 ${tab === "preview" ? "hidden" : ""}`}
        />
        {tab === "preview" && (
          <div
            className="prose prose-sm prose-neutral min-h-[280px] max-w-none p-4 prose-headings:font-heading prose-headings:text-pitch-900 prose-a:text-pitch-700"
            dangerouslySetInnerHTML={{
              __html: content
                ? (marked.parse(content, { async: false }) as string)
                : "<p class='text-neutral-400'>ยังไม่มีเนื้อหา</p>",
            }}
          />
        )}
      </div>
    </div>
  );
}
