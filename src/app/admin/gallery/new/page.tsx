import type { Metadata } from "next";
import Link from "next/link";
import { cardClass } from "@/lib/admin-ui";
import { createGalleryPhotoAction } from "../actions";
import GalleryPhotoForm from "../GalleryPhotoForm";

export const metadata: Metadata = { title: "เพิ่มรูปภาพแกลเลอรี่ | หลังบ้านแอดมิน" };

export default function NewGalleryPhotoPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/gallery" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าแกลเลอรี่
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">เพิ่มรูปภาพแกลเลอรี่</h1>
      </div>
      <div className={cardClass}>
        <GalleryPhotoForm action={createGalleryPhotoAction} submitLabel="เพิ่มรูปภาพ" />
      </div>
    </div>
  );
}
