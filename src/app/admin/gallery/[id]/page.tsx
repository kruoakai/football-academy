import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/admin-ui";
import { updateGalleryPhotoAction } from "../actions";
import GalleryPhotoForm from "../GalleryPhotoForm";

export const metadata: Metadata = { title: "แก้ไขรูปภาพแกลเลอรี่ | หลังบ้านแอดมิน" };

export default async function EditGalleryPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!photo) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/gallery" className="text-sm font-medium text-pitch-700 hover:underline">
          ← กลับไปหน้าแกลเลอรี่
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-pitch-900">แก้ไขรูปภาพแกลเลอรี่</h1>
      </div>
      <div className={cardClass}>
        <GalleryPhotoForm
          action={updateGalleryPhotoAction.bind(null, photo.id)}
          defaultValues={{
            caption: photo.caption,
            imageUrl: photo.imageUrl,
            published: photo.published,
          }}
          submitLabel="บันทึกการแก้ไข"
        />
      </div>
    </div>
  );
}
